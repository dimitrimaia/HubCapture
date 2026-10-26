/**
 * Rastreio de origem dos cadastros (links de divulgação).
 * Ex.: hubcapture.app/cadastro?utm_source=instagram&utm_campaign=post-123 ou ?ref=perfil-do-influencer.
 * A PRIMEIRA visita com rastreio fica guardada no navegador por 30 dias e vai junto com o cadastro.
 * Roda no navegador e no servidor: nada de banco aqui.
 */

export type Rastreio = { utmSource?: string; utmMedium?: string; utmCampaign?: string; ref?: string }

export const CHAVE_RASTREIO = 'hubcapture:rastreio'
export const VALIDADE_RASTREIO_MS = 30 * 24 * 60 * 60 * 1000

const PARAMETROS: [keyof Rastreio, string][] = [
  ['utmSource', 'utm_source'],
  ['utmMedium', 'utm_medium'],
  ['utmCampaign', 'utm_campaign'],
  ['ref', 'ref'],
]

/** Só letras, números e . _ - @ +, minúsculas, até 60 caracteres. Qualquer outra coisa é descartada. */
export function limparValor(valor: unknown) {
  if (typeof valor !== 'string') return undefined
  const limpo = valor
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9._@+-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return limpo || undefined
}

export function limparRastreio(entrada: unknown): Rastreio {
  if (!entrada || typeof entrada !== 'object') return {}
  const e = entrada as Record<string, unknown>
  const r: Rastreio = {}
  for (const [chave] of PARAMETROS) {
    const valor = limparValor(e[chave])
    if (valor) r[chave] = valor
  }
  return r
}

export function rastreioDaUrl(params: URLSearchParams): Rastreio {
  const r: Rastreio = {}
  for (const [chave, parametro] of PARAMETROS) {
    const valor = limparValor(params.get(parametro))
    if (valor) r[chave] = valor
  }
  return r
}

export function temRastreio(r: Rastreio) {
  return Object.keys(r).length > 0
}

/** Rótulo curto da origem para tabelas e gráficos: ref > utm_source > origem do cadastro. */
export function rotuloOrigem(l: Rastreio & { origem: string }) {
  if (l.ref) return `ref: ${l.ref}`
  if (l.utmSource) return l.utmCampaign ? `${l.utmSource} · ${l.utmCampaign}` : l.utmSource
  return l.origem === 'site' ? 'site (direto)' : l.origem
}

/** Link de rastreio para um influencer, a partir do @perfil ou do link do perfil. */
export function linkRastreio(siteUrl: string, perfil: string) {
  const handle = limparValor(perfil.replace(/^https?:\/\/[^/]+\//i, '').split(/[/?#]/)[0])
  return handle ? `${siteUrl}/cadastro?ref=${handle}` : `${siteUrl}/cadastro`
}
