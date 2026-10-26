import { responder } from '@/lib/atendimento'
import { exigirSessaoApi } from '@/lib/equipe'

/** Resposta da equipe: { texto, chave } (chave de idempotência gerada no navegador). */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/atendimento/[id]/responder'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))
  if (typeof body.texto !== 'string' || typeof body.chave !== 'string' || !/^[\w-]{8,64}$/.test(body.chave)) {
    return Response.json({ ok: false, erro: 'Pedido inválido.' }, { status: 400 })
  }
  const resultado = await responder(id, sessao, body.texto, body.chave).catch(() => ({ ok: false as const, erro: 'Não foi possível enviar.' }))
  return Response.json(resultado, { status: resultado.ok ? 200 : 400 })
}
