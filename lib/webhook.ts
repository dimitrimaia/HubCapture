export type LeadType = 'colab' | 'cadastro'

const WEBHOOK_TIMEOUT_MS = 8000

function webhookUrlFor(tipo: LeadType) {
  if (tipo === 'cadastro') return process.env.CADASTRO_WEBHOOK_URL || process.env.COLAB_WEBHOOK_URL
  return process.env.COLAB_WEBHOOK_URL
}

/**
 * Envia o lead para o Google Apps Script (ou outro webhook) configurado na env.
 * O Apps Script responde 200 com uma página HTML mesmo quando o script falha,
 * por isso só consideramos sucesso quando a resposta é JSON com `ok: true`.
 */
export async function forwardLead(tipo: LeadType, lead: Record<string, unknown>) {
  const payload = { tipo, ...lead, origem: 'hubcapture.app', criadoEm: new Date().toISOString() }
  const url = webhookUrlFor(tipo)

  if (!url) {
    console.warn(`[leads] Nenhum webhook configurado para "${tipo}"; lead não foi salvo:`, payload)
    return true
  }

  try {
    // text/plain evita o preflight que o Apps Script não suporta; o redirect 302 dele é seguido.
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    })
    const body = await response.text()
    let ok = false
    try {
      ok = response.ok && JSON.parse(body)?.ok === true
    } catch {}
    if (!ok) console.error(`[leads] Webhook "${tipo}" respondeu ${response.status}:`, body.slice(0, 500))
    return ok
  } catch (error) {
    console.error(`[leads] Falha ao enviar lead "${tipo}" para o webhook:`, error)
    return false
  }
}
