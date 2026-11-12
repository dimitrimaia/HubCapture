import { timingSafeEqual } from 'node:crypto'
import { campanhasEnviando, processarLote } from '@/lib/campanhas'

export const maxDuration = 60

/**
 * Continua as campanhas em andamento mesmo com o painel fechado. Agendador (cron-job.org) a cada
 * 5–15 min com "Authorization: Bearer <CRON_SECRET>". Sem o segredo certo: 401.
 */
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET
  const recebido = request.headers.get('authorization') ?? ''
  const esperado = `Bearer ${segredo}`
  const autorizado =
    Boolean(segredo) && recebido.length === esperado.length && timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado))
  if (!autorizado) return Response.json({ ok: false }, { status: 401 })

  const inicio = Date.now()
  const resultados = []
  for (const { id } of await campanhasEnviando()) {
    // Até ~45 s por chamada (limite da função é 60 s).
    while (Date.now() - inicio < 45_000) {
      const r = await processarLote(id)
      resultados.push({ id, ...r })
      if (r.motivo !== 'continua') break
    }
  }
  return Response.json({ ok: true, resultados })
}
