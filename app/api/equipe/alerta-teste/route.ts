import { alertaConfigurado, alertarErro } from '@/lib/alerta'
import { exigirSessaoApi } from '@/lib/equipe'

/** Manda um e-mail de teste (conta no limite de 1 por hora da origem "teste"). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  if (!alertaConfigurado()) return Response.json({ ok: false, erro: 'Configure RESEND_API_KEY e ALERTA_EMAIL na Vercel.' })
  const ok = await alertarErro('teste', `Teste enviado por ${sessao.nome} pelo painel. Se chegou, os alertas estão funcionando.`)
  return Response.json(ok ? { ok: true } : { ok: false, erro: 'Não enviou: já houve um teste na última hora ou o Resend recusou (veja os logs).' })
}
