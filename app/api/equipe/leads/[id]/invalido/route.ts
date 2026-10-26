import { exigirSessaoApi } from '@/lib/equipe'
import { marcarNumeroInvalido } from '@/lib/fila'

export async function POST(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]/invalido'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))
  const lead = await marcarNumeroInvalido(id, sessao.nome, body.invalido !== false).catch(() => null)
  return lead ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 404 })
}
