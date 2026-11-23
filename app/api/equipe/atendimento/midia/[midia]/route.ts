import { midiaConhecida } from '@/lib/atendimento'
import { exigirSessaoApi } from '@/lib/equipe'
import { baixarMidia } from '@/lib/whatsapp'

/**
 * Foto, áudio ou documento que um cliente mandou no WhatsApp.
 * Só para a equipe logada e só mídias de mensagens guardadas (não vira proxy aberto da Meta).
 */
export async function GET(request: Request, ctx: RouteContext<'/api/equipe/atendimento/midia/[midia]'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return new Response('Não autorizado', { status: 401 })
  const { midia } = await ctx.params
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(midia) || !(await midiaConhecida(midia).catch(() => false))) {
    return new Response('Não encontrada', { status: 404 })
  }
  const arquivo = await baixarMidia(midia).catch(() => null)
  if (!arquivo) return new Response('A Meta não devolveu a mídia (pode ter expirado: ela guarda por cerca de 30 dias).', { status: 410 })
  const download = new URL(request.url).searchParams.has('baixar')
  return new Response(arquivo.corpo, {
    headers: {
      'Content-Type': arquivo.tipo,
      ...(arquivo.tamanho ? { 'Content-Length': arquivo.tamanho } : {}),
      // Fica só no navegador de quem está logado.
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'",
      'Content-Disposition': download ? `attachment; filename="whatsapp-${midia}"` : 'inline',
    },
  })
}
