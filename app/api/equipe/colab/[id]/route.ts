import { atualizarColab, STATUS_COLAB, type StatusColab } from '@/lib/colabs'
import { exigirSessaoApi } from '@/lib/equipe'

/** Atualiza status, observação ou marca que a equipe chamou o influencer. */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/colab/[id]'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const dados: Parameters<typeof atualizarColab>[1] = {}
  if ((STATUS_COLAB as readonly string[]).includes(body.status)) dados.status = body.status as StatusColab
  if (typeof body.observacao === 'string') dados.observacao = body.observacao.slice(0, 1000)
  if (body.chamado === true) dados.chamadoPor = sessao.nome
  const colab = await atualizarColab(id, dados).catch(() => null)
  return colab ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 404 })
}
