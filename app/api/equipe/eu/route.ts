import { lerSessao } from '@/lib/equipe'

/** Quem está logado (para a barra de admin do site público). Nunca vai para cache. */
export async function GET() {
  const sessao = await lerSessao()
  if (!sessao) return Response.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  return Response.json({ ok: true, nome: sessao.nome, papel: sessao.papel }, { headers: { 'Cache-Control': 'no-store' } })
}
