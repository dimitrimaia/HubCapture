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

export function isValidWhatsapp(digits: string) {
  return digits.length === 10 || digits.length === 11
}

/**
 * Normaliza um telefone brasileiro para +55DDDNÚMERO.
 * Aceita "(11) 91234-5678", "11912345678", "5511912345678", "+55 11 9...", "011 9..." etc.
 * Retorna null quando não dá para montar um número válido (DDD + 8 ou 9 dígitos).
 */
export function toE164(value: string) {
  let digits = onlyDigits(value).replace(/^0+/, '')
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2)
  if (!isValidWhatsapp(digits) || digits.startsWith('0')) return null
  return `+55${digits}`
}

/** "+5511912345678" → "(11) 91234-5678" para exibir. */
export function formatE164(e164: string) {
  return formatWhatsapp(e164.replace(/^\+55/, ''))
}

/** Link wa.me com texto pronto. `numero` pode vir em qualquer formato com DDI. */
export function waLink(numero: string, texto?: string) {
  const base = `https://wa.me/${onlyDigits(numero)}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

/**
 * Formas possíveis do mesmo celular no formato +55: o WhatsApp às vezes entrega números
 * antigos sem o 9 na frente (5511 1234-5678), enquanto o cadastro tem 5511 91234-5678.
 */
export function variantesE164(numero: string) {
  const e164 = toE164(numero)
  if (!e164) return []
  const local = e164.slice(3)
  const variantes = [e164]
  if (local.length === 10 && /[6-9]/.test(local[2])) variantes.push(`+55${local.slice(0, 2)}9${local.slice(2)}`)
  if (local.length === 11 && local[2] === '9') variantes.push(`+55${local.slice(0, 2)}${local.slice(3)}`)
  return variantes
}
