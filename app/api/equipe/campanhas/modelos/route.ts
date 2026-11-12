import { exigirSessaoApi } from '@/lib/equipe'
import { listarModelosAprovados } from '@/lib/whatsapp'

/** Modelos aprovados na conta do WhatsApp Business (Meta). Só admin. */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  try {
    return Response.json({ ok: true, modelos: await listarModelosAprovados() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return Response.json({ ok: false, erro: error instanceof Error ? error.message : 'Não foi possível falar com a Meta.' })
  }
}
