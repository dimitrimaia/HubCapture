import { exigirSessaoApi } from '@/lib/equipe'
import { salvarNotas } from '@/lib/leads'

/** Salva { nota } e/ou { etiquetas: string[] } de um contato. */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]/notas'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))
  const dados: { nota?: string; etiquetas?: string[] } = {}
  if (typeof body.nota === 'string') dados.nota = body.nota
  if (Array.isArray(body.etiquetas)) dados.etiquetas = body.etiquetas.filter((e: unknown): e is string => typeof e === 'string')
  if (!('nota' in dados) && !('etiquetas' in dados)) return Response.json({ ok: false }, { status: 400 })
  const lead = await salvarNotas(id, dados, sessao.nome).catch(() => null)
  return lead ? Response.json({ ok: true, etiquetas: lead.etiquetas, nota: lead.nota }) : Response.json({ ok: false }, { status: 404 })
}
