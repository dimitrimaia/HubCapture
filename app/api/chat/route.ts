import { AssistenteIndisponivel, assistenteConfigurado, gerarResposta, limparHistorico } from '@/lib/assistente'
import { ipDoPedido } from '@/lib/ip'
import { criarLimite } from '@/lib/limite'

export const maxDuration = 30

const permitir = criarLimite({ maximo: 20, janelaMs: 10 * 60 * 1000 })

export async function POST(request: Request) {
  if (!assistenteConfigurado()) {
    return Response.json({ ok: false, erro: 'O assistente está indisponível no momento.' }, { status: 503 })
  }
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

  try {
    const resposta = await gerarResposta(historico, 'site')
    return Response.json({ ok: true, resposta })
  } catch (error) {
    console.error('[chat]', error)
    const status = error instanceof AssistenteIndisponivel ? 503 : 500
    return Response.json({ ok: false, erro: 'Não consegui responder agora. Tente de novo em instantes.' }, { status })
  }
}
