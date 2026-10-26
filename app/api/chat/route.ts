import { AssistenteIndisponivel, gerarResposta, limparHistorico } from '@/lib/assistente'
import { AVISO_HUMANO, codigoVisitanteValido, hashVisitante, pediuHumano, pedirHumano, registrarDoCliente, registrarMensagem } from '@/lib/atendimento'
import { registrarErro } from '@/lib/auditoria'
import { ipDoPedido } from '@/lib/ip'
import { criarLimite } from '@/lib/limite'

export const maxDuration = 60

const permitir = criarLimite({ maximo: 20, janelaMs: 10 * 60 * 1000 })

export async function POST(request: Request) {
  if (!permitir(ipDoPedido(request.headers))) {
    return Response.json(
      { ok: false, erro: 'Muitas mensagens em pouco tempo. Espere alguns minutos e tente de novo.' },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const historico = limparHistorico(body?.messages)
  if (historico.length === 0 || historico.at(-1)?.role !== 'user') {
    return Response.json({ ok: false, erro: 'Mensagem inválida.' }, { status: 400 })
  }
  const pergunta = historico.at(-1)!.content

  // Central de atendimento: guarda a conversa (sem banco ou com erro, o chat segue só com o assistente).
  const atendimento = codigoVisitanteValido(body?.visitante)
    ? await registrarDoCliente({
        canal: 'site',
        contato: hashVisitante(body.visitante),
        texto: pergunta,
        leadId: typeof body?.cadastro === 'string' ? body.cadastro : undefined,
      }).catch(async (error) => {
        await registrarErro('atendimento', error)
        return null
      })
    : null

  if (atendimento && atendimento.status === 'bot' && pediuHumano(pergunta)) {
    await pedirHumano(atendimento.id)
    await registrarMensagem(atendimento.id, 'bot', AVISO_HUMANO).catch(() => null)
    return Response.json({ ok: true, resposta: AVISO_HUMANO, modo: 'aguardando' })
  }
  // Uma pessoa da equipe está cuidando (ou vai cuidar): o assistente não responde.
  if (atendimento && (atendimento.status === 'aguardando' || atendimento.status === 'humano')) {
    return Response.json({ ok: true, resposta: null, modo: atendimento.status, atendente: atendimento.atendenteNome })
  }

  try {
    const resposta = await gerarResposta(historico, 'site')
    if (atendimento) await registrarMensagem(atendimento.id, 'bot', resposta).catch(() => null)
    return Response.json({ ok: true, resposta, modo: 'bot' })
  } catch (error) {
    await registrarErro('chat', error)
    // Sem chave ou com o Gemini fora do ar, as respostas prontas continuam funcionando; o resto vira 503.
    const status = error instanceof AssistenteIndisponivel ? 503 : 500
    return Response.json({ ok: false, erro: 'Não consegui responder agora. Tente de novo em instantes.' }, { status })
  }
}
