import { normalizeColabLead, validateColabLead } from '@/lib/colab'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 })
  }

  // Honeypot: bots preenchem o campo escondido; respondemos sucesso sem salvar.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return Response.json({ ok: true })
  }

  const lead = normalizeColabLead(body)
  const errors = validateColabLead(lead)
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  const payload = { ...lead, origem: 'hubcapture.app', criadoEm: new Date().toISOString() }
  const webhookUrl = process.env.COLAB_WEBHOOK_URL

  if (!webhookUrl) {
    console.info('[colab] COLAB_WEBHOOK_URL não configurada; lead recebido:', payload)
    return Response.json({ ok: true })
  }

  try {
    // Google Apps Script responde com redirect 302 e não aceita preflight; text/plain evita ambos os problemas.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Webhook respondeu ${response.status}`)
  } catch (error) {
    console.error('[colab] Falha ao enviar lead para o webhook:', error)
    return Response.json({ ok: false, error: 'Não foi possível enviar agora. Tente novamente.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
