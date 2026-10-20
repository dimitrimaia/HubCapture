export type LeadType = 'colab' | 'cadastro'

const WEBHOOK_TIMEOUT_MS = 8000

/** Ex.: "20/10/2026 11:22:12" no horário de Brasília, legível direto na planilha. */
function formatSaoPaulo(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  })
    .format(date)
    .replace(',', '')
}

/**
 * CADASTRO_WEBHOOK_URL → planilha "Usuários Cadastrados HubCapture".
 * INFLUENCER_WEBHOOK_URL → planilha de afiliados/influencers.
 * COLAB_WEBHOOK_URL é o nome antigo: serve de fallback para o cadastro e só é usado para
 * influencers quando CADASTRO_WEBHOOK_URL também existe, para não misturar as planilhas.
 */
function webhookUrlFor(tipo: LeadType) {
  const { CADASTRO_WEBHOOK_URL, INFLUENCER_WEBHOOK_URL, COLAB_WEBHOOK_URL } = process.env
  if (tipo === 'cadastro') return CADASTRO_WEBHOOK_URL || COLAB_WEBHOOK_URL
  return INFLUENCER_WEBHOOK_URL || (CADASTRO_WEBHOOK_URL ? COLAB_WEBHOOK_URL : undefined)
}

/**
 * Envia o lead para o Google Apps Script (ou outro webhook) configurado na env.
 * O Apps Script responde 200 com uma página HTML mesmo quando o script falha,
 * por isso só consideramos sucesso quando a resposta é JSON com `ok: true`.
 */
export async function forwardLead(tipo: LeadType, lead: Record<string, unknown>) {
  const payload = { tipo, ...lead, origem: 'hubcapture.app', criadoEm: formatSaoPaulo(new Date()) }
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
