import { exigirSessaoApi } from '@/lib/equipe'

/**
 * Confere um vídeo do YouTube pelo oEmbed (público, grátis, sem chave): título, canal e se está
 * acessível. Vídeo "Não listado" funciona; "Privado" ou removido volta como indisponível.
 */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!/^[\w-]{11}$/.test(id)) return Response.json({ ok: false, erro: 'ID inválido.' }, { status: 400 })

  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`
  const resposta = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 3600 } }).catch(() => null)
  if (!resposta) return Response.json({ ok: false, erro: 'Não foi possível consultar o YouTube agora.' })
  if (!resposta.ok) {
    return Response.json({
      ok: false,
      erro: resposta.status === 401 || resposta.status === 403 ? 'Vídeo privado: mude para "Não listado" ou "Público" no YouTube Studio.' : 'Vídeo não encontrado.',
    })
  }
  const dados = await resposta.json().catch(() => ({}))
  return Response.json({ ok: true, titulo: String(dados.title ?? ''), canal: String(dados.author_name ?? '') })
}
