import { timingSafeEqual } from 'node:crypto'
import { rodarLembretes } from '@/lib/lembretes'

export const maxDuration = 60

/**
 * Roda os lembretes automáticos (desligados por padrão). Chamado a cada hora por um agendador
 * (Vercel Cron no plano Pro ou cron-job.org no grátis) com o cabeçalho
 * "Authorization: Bearer <CRON_SECRET>". Sem o segredo certo: 401.
 */
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET
  const recebido = request.headers.get('authorization') ?? ''
  const esperado = `Bearer ${segredo}`
  const autorizado =
    Boolean(segredo) && recebido.length === esperado.length && timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado))
  if (!autorizado) return Response.json({ ok: false }, { status: 401 })

  const resultado = await rodarLembretes()
  return Response.json({ ok: true, ...resultado })
}
