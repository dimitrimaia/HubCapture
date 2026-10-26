import { exigirSessaoApi } from '@/lib/equipe'
import { diagnosticarPlanilha } from '@/lib/webhook'

export const maxDuration = 30

/** Mostra qual implantação do Apps Script o site usa e se a leitura funciona (só para a equipe). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  return Response.json(await diagnosticarPlanilha())
}
