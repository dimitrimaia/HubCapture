import { registrarAuditoria, registrarErro } from '@/lib/auditoria'
import { detalheCampanha, iniciarCampanha, LIMITE_DIARIO, mudarStatusCampanha, processarLote } from '@/lib/campanhas'
import { exigirSessaoApi } from '@/lib/equipe'

export const maxDuration = 60

export async function GET(request: Request, ctx: RouteContext<'/api/equipe/campanhas/[id]'>) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const campanha = await detalheCampanha(id).catch(async (error) => {
    await registrarErro('campanhas', error)
    return null
  })
  return campanha ? Response.json({ ok: true, campanha, limiteDiario: LIMITE_DIARIO }, { headers: { 'Cache-Control': 'no-store' } }) : Response.json({ ok: false }, { status: 404 })
}

/** { acao: 'iniciar' | 'processar' | 'pausar' | 'retomar' | 'cancelar' } */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/campanhas/[id]'>) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const { acao } = await request.json().catch(() => ({}))
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
  return Response.json({ ok: false }, { status: 400 })
}
