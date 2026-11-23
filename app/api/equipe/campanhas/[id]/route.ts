import { registrarAuditoria, registrarErro } from '@/lib/auditoria'
import { detalheCampanha, iniciarCampanha, LIMITE_DIARIO, mudarStatusCampanha, processarLote } from '@/lib/campanhas'
import { exigirSessaoApi } from '@/lib/equipe'
import { acaoEmLote } from '@/lib/leads'

export const maxDuration = 60

export async function GET(request: Request, ctx: RouteContext<'/api/equipe/campanhas/[id]'>) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const filtro = new URL(request.url).searchParams.get('filtro') === 'falhas' ? 'falhas' : 'todos'
  const campanha = await detalheCampanha(id, filtro).catch(async (error) => {
    await registrarErro('campanhas', error)
    return null
  })
  return campanha ? Response.json({ ok: true, campanha, limiteDiario: LIMITE_DIARIO }, { headers: { 'Cache-Control': 'no-store' } }) : Response.json({ ok: false }, { status: 404 })
}

/** { acao: 'iniciar' | 'processar' | 'pausar' | 'retomar' | 'cancelar' | 'invalidar', leadIds? } */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/campanhas/[id]'>) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const { acao, leadIds } = await request.json().catch(() => ({}))
  if (acao === 'processar') return Response.json({ ok: true, ...(await processarLote(id)) })
  if (acao === 'iniciar') {
    const campanha = await iniciarCampanha(id)
    if (!campanha) return Response.json({ ok: false, erro: 'Essa campanha já foi iniciada.' }, { status: 400 })
    await registrarAuditoria('campanha_iniciada', sessao, { detalhe: `${campanha.nome}: ${campanha.total} pessoas` })
    return Response.json({ ok: true, total: campanha.total })
  }
  if (acao === 'pausar' || acao === 'retomar' || acao === 'cancelar') {
    const campanha = await mudarStatusCampanha(id, acao)
    if (campanha) await registrarAuditoria(`campanha_${acao}`, sessao, { detalhe: campanha.nome })
    return Response.json({ ok: Boolean(campanha) })
  }
  if (acao === 'invalidar') {
    // Tira das próximas campanhas e da Fila (número sem WhatsApp, bloqueou etc.). Dá para desfazer em Cadastros.
    const ids = Array.isArray(leadIds) ? leadIds.filter((v): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)) : []
    let total = 0
    for (let i = 0; i < ids.length; i += 100) total += await acaoEmLote(ids.slice(i, i + 100), 'invalido', sessao.nome)
    if (total) await registrarAuditoria('campanha_invalidar', sessao, { detalhe: `${total} números marcados como inválidos` })
    return Response.json({ ok: true, total })
  }
  return Response.json({ ok: false }, { status: 400 })
}
