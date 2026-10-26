import { contagemAtendimento, FILTROS_ATENDIMENTO, type FiltroAtendimento, listarAtendimentos, podeResponder } from '@/lib/atendimento'
import { exigirSessaoApi } from '@/lib/equipe'
import { formatE164 } from '@/lib/phone'

/** Lista da central de atendimento + contagens das abas (o painel atualiza a cada poucos segundos). */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const params = new URL(request.url).searchParams
  const filtro = (FILTROS_ATENDIMENTO as readonly string[]).includes(params.get('filtro') ?? '') ? (params.get('filtro') as FiltroAtendimento) : 'fila'
  const [lista, contagem] = await Promise.all([
    listarAtendimentos({ filtro, canal: params.get('canal') ?? undefined, busca: params.get('q')?.slice(0, 60), sessao }),
    contagemAtendimento(sessao),
  ]).catch(() => [null, null] as const)
  if (!lista) return Response.json({ ok: false, erro: 'Banco indisponível.' }, { status: 503 })
  return Response.json(
    {
      ok: true,
      contagem,
      itens: lista.map((a) => ({
        id: a.id,
        canal: a.canal,
        nome: a.nome ?? (a.canal === 'whatsapp' ? formatE164(`+${a.contato}`) : 'Visitante do site'),
        telefone: a.canal === 'whatsapp' ? formatE164(`+${a.contato}`) : null,
        status: a.status,
        atendente: a.atendenteNome,
        meu: a.atendenteId === sessao.id,
        naoLidas: a.naoLidas,
        ultimaMensagem: a.ultimaMensagem,
        ultimaMensagemEm: a.ultimaMensagemEm.toISOString(),
        temCadastro: Boolean(a.leadId),
        janelaAberta: podeResponder(a),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
