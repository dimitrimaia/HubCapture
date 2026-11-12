import { contarPublico, limparFiltros } from '@/lib/campanhas'
import { exigirSessaoApi } from '@/lib/equipe'

/** Quantas pessoas a campanha atinge com estes filtros (só quem aceitou mensagens). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const contagem = await contarPublico(limparFiltros(body.filtros)).catch(() => null)
  return contagem ? Response.json({ ok: true, ...contagem }) : Response.json({ ok: false }, { status: 503 })
}
