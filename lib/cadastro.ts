import { isValidWhatsapp, onlyDigits } from './phone'

export type CadastroLead = { nome: string; whatsapp: string }
export type CadastroErrors = Partial<Record<keyof CadastroLead, string>>

export function normalizeCadastroLead(input: Record<string, unknown>): CadastroLead {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string).trim() : '')
  return { nome: text('nome').slice(0, 120), whatsapp: onlyDigits(text('whatsapp')) }
}

export function validateCadastroLead(lead: CadastroLead): CadastroErrors {
  const errors: CadastroErrors = {}
  if (lead.nome.length < 2) errors.nome = 'Informe seu nome.'
  if (!isValidWhatsapp(lead.whatsapp)) errors.whatsapp = 'Informe o WhatsApp com DDD.'
  return errors
}
