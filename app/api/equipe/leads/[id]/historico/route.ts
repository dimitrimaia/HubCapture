import { exigirSessaoApi } from '@/lib/equipe'
import { historicoLead } from '@/lib/leads'

export async function GET(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]/historico'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const eventos = await historicoLead(id).catch(() => null)
  return Response.json({ ok: true, eventos: (eventos ?? []).map((e) => ({ tipo: e.tipo, detalhe: e.detalhe, por: e.por, em: e.criadoEm })) })
}
