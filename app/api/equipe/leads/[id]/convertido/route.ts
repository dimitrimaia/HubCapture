import { exigirSessaoApi } from '@/lib/equipe'
import { marcarConvertido } from '@/lib/leads'

export async function POST(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]/convertido'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))
  const lead = await marcarConvertido(id, sessao.nome, body.convertido === true).catch((error) => {
    console.error('[equipe] Falha ao marcar conversão:', error)
    return null
  })
  return lead ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 404 })
}
