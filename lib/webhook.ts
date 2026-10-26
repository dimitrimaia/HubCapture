/** acao: botão tocado no próximo passo do cadastro ou chamado feito pela equipe (aba "Acoes"). */
export type LeadType = 'colab' | 'cadastro' | 'acao'

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
  if (tipo === 'cadastro' || tipo === 'acao') return CADASTRO_WEBHOOK_URL || COLAB_WEBHOOK_URL
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

export type LinhaPlanilha = { criadoEm?: string; nome?: string; whatsapp?: string | number }

/**
 * Lê a aba "Cadastro" pela função doGet do Apps Script (protegida por PLANILHA_LEITURA_TOKEN).
 * Usado pelo painel da equipe para importar quem se cadastrou antes do banco existir.
 */
export async function lerCadastrosDaPlanilha(): Promise<{ ok: true; linhas: LinhaPlanilha[] } | { ok: false; erro: string }> {
  const url = webhookUrlFor('cadastro')
  const token = process.env.PLANILHA_LEITURA_TOKEN
  if (!url || !token) return { ok: false, erro: 'Configure CADASTRO_WEBHOOK_URL e PLANILHA_LEITURA_TOKEN na Vercel.' }

  try {
    const endereco = new URL(url)
    endereco.searchParams.set('token', token)
    endereco.searchParams.set('aba', 'Cadastro')
    const response = await fetch(endereco, { redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(20000) })
    const body = await response.text()
    const dados = JSON.parse(body)
    if (!dados?.ok || !Array.isArray(dados.linhas)) {
      const erro = dados?.erro
        ? String(dados.erro)
        : dados?.status === 'online'
          ? 'A URL configurada na Vercel roda o código ANTIGO do Apps Script. Use "Testar planilha", acima, para ver qual implantação é.'
          : 'A planilha não devolveu as linhas. Atualize o Apps Script.'
      return { ok: false, erro }
    }
    return { ok: true, linhas: dados.linhas }
  } catch (error) {
    console.error('[leads] Falha ao ler a planilha:', error)
    return { ok: false, erro: 'Não foi possível ler a planilha (resposta inválida). Confira a implantação do Apps Script.' }
  }
}

/** "20/10/2026 11:22:12" (horário de Brasília) ou ISO → Date. */
export function parseDataPlanilha(valor?: string) {
  if (!valor) return undefined
  const br = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(valor).trim())
  if (br) {
    const [, dia, mes, ano, hora = '00', minuto = '00', segundo = '00'] = br
    return new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`)
  }
  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? undefined : data
}

export type DiagnosticoPlanilha = {
  variavel: string | null
  implantacao: string | null
  tokenConfigurado: boolean
  situacao: 'sem-url' | 'sem-token' | 'ok' | 'codigo-antigo' | 'token-invalido' | 'sem-acesso' | 'erro'
  linhas?: number
  detalhe?: string
}

/** Qual variável guarda a URL da planilha de usuários (sem mostrar o valor). */
function variavelCadastro() {
  if (process.env.CADASTRO_WEBHOOK_URL) return 'CADASTRO_WEBHOOK_URL'
  if (process.env.COLAB_WEBHOOK_URL) return 'COLAB_WEBHOOK_URL'
  return null
}

/** "AKfycbzrP…uSoCiL": começo e fim do código da implantação, para comparar com o Apps Script. */
function resumoImplantacao(url: string) {
  const id = /\/macros\/s\/([^/]+)\//.exec(url)?.[1]
  return id ? `${id.slice(0, 8)}…${id.slice(-6)}` : null
}

/** Testa a leitura da planilha de usuários e explica o resultado (para o painel da equipe). */
export async function diagnosticarPlanilha(): Promise<DiagnosticoPlanilha> {
  const url = webhookUrlFor('cadastro')
  const base = { variavel: variavelCadastro(), implantacao: url ? resumoImplantacao(url) : null, tokenConfigurado: Boolean(process.env.PLANILHA_LEITURA_TOKEN) }
  if (!url) return { ...base, situacao: 'sem-url' }
  if (!process.env.PLANILHA_LEITURA_TOKEN) return { ...base, situacao: 'sem-token' }

  try {
    const endereco = new URL(url)
    endereco.searchParams.set('token', process.env.PLANILHA_LEITURA_TOKEN)
    endereco.searchParams.set('aba', 'Cadastro')
    const response = await fetch(endereco, { redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(20000) })
    const texto = await response.text()
    let dados: { ok?: boolean; linhas?: unknown[]; status?: string; erro?: string }
    try {
      dados = JSON.parse(texto)
    } catch {
      // Página HTML de login do Google: a implantação não está como "Qualquer pessoa".
      return { ...base, situacao: 'sem-acesso', detalhe: `Resposta ${response.status} não é JSON.` }
    }
    if (dados.ok && Array.isArray(dados.linhas)) return { ...base, situacao: 'ok', linhas: dados.linhas.length }
    if (dados.status === 'online') return { ...base, situacao: 'codigo-antigo' }
    if (/token/i.test(dados.erro ?? '')) return { ...base, situacao: 'token-invalido', detalhe: dados.erro }
    return { ...base, situacao: 'erro', detalhe: dados.erro ?? texto.slice(0, 160) }
  } catch (error) {
    return { ...base, situacao: 'erro', detalhe: String(error).slice(0, 160) }
  }
}
