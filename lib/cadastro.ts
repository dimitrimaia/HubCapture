import { isValidWhatsapp, onlyDigits } from './phone'
import { limparRastreio, type Rastreio } from './rastreio'

/** consentimento: marcou "Aceito receber mensagens do Hub Capture no WhatsApp" (opcional). */
export type CadastroLead = { nome: string; whatsapp: string; consentimento?: boolean; rastreio?: Rastreio }
export type CadastroErrors = Partial<Record<keyof CadastroLead, string>>

export function normalizeCadastroLead(input: Record<string, unknown>): CadastroLead {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string).trim() : '')
  return {
    nome: text('nome').slice(0, 120),
    whatsapp: onlyDigits(text('whatsapp')),
    consentimento: input.consentimento === true || input.consentimento === 'on',
    rastreio: limparRastreio(input.rastreio),
  }
}

export function validateCadastroLead(lead: CadastroLead): CadastroErrors {
  const errors: CadastroErrors = {}
  if (lead.nome.length < 2) errors.nome = 'Informe seu nome.'
  if (!isValidWhatsapp(lead.whatsapp)) errors.whatsapp = 'Informe o WhatsApp com DDD.'
  return errors
}
