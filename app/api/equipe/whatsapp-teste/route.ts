import { exigirSessaoApi } from '@/lib/equipe'
import { testarWhatsapp } from '@/lib/sistema'

export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  return Response.json(await testarWhatsapp())
}
