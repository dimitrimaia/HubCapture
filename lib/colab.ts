export const FOLLOWER_RANGES = [
  'Até 1 mil',
  '1 mil a 10 mil',
  '10 mil a 50 mil',
  '50 mil a 100 mil',
  '100 mil a 500 mil',
  'Mais de 500 mil',
] as const

export type ColabLead = {
  nome: string
  perfil: string
  seguidores: string
  email: string
  whatsapp: string
  consentimento: boolean
}

export type ColabErrors = Partial<Record<keyof ColabLead, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const HANDLE_RE = /^@?[a-zA-Z0-9._]{2,30}$/
const PROFILE_URL_RE = /^(https?:\/\/)?(www\.)?(instagram\.com|tiktok\.com)\/@?[a-zA-Z0-9._]{2,30}\/?$/i

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function normalizeColabLead(input: Record<string, unknown>): ColabLead {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string).trim() : '')
  return {
    nome: text('nome').slice(0, 120),
    perfil: text('perfil').slice(0, 120),
    seguidores: text('seguidores'),
    email: text('email').toLowerCase().slice(0, 160),
    whatsapp: onlyDigits(text('whatsapp')),
    consentimento: input.consentimento === true || input.consentimento === 'on',
  }
}

export function validateColabLead(lead: ColabLead): ColabErrors {
  const errors: ColabErrors = {}
  if (lead.nome.length < 2) errors.nome = 'Informe seu nome.'
  if (!HANDLE_RE.test(lead.perfil) && !PROFILE_URL_RE.test(lead.perfil))
    errors.perfil = 'Informe seu @ ou o link do perfil no Instagram ou TikTok.'
  if (!(FOLLOWER_RANGES as readonly string[]).includes(lead.seguidores))
    errors.seguidores = 'Selecione sua faixa de seguidores.'
  if (!EMAIL_RE.test(lead.email)) errors.email = 'Informe um e-mail válido.'
  if (lead.whatsapp.length < 10 || lead.whatsapp.length > 11)
    errors.whatsapp = 'Informe o WhatsApp com DDD.'
  if (!lead.consentimento) errors.consentimento = 'Autorize o contato para continuar.'
  return errors
}
