import { SIGNUP_URL, WHATSAPP_COMMUNITY_URL } from './site'

/** Modelos curtos para a equipe chamar os leads pelo WhatsApp (wa.me, envio manual e gratuito). */
export const MODELOS_CHAMADA = [
  {
    id: 'boas-vindas',
    rotulo: 'Boas-vindas',
    texto: (nome: string, atendente: string) =>
      `Oi, ${nome}! Aqui é ${atendente}, do Hub Capture 👋 Vi que você se cadastrou no site. Quer ajuda para criar sua conta com o código VEMHUB? É por aqui: ${SIGNUP_URL}`,
  },
  {
    id: 'lembrete',
    rotulo: 'Lembrete do cadastro',
    texto: (nome: string, atendente: string) =>
      `Oi, ${nome}! ${atendente} do Hub Capture aqui. Passando para lembrar que falta só criar sua conta com o código VEMHUB para começar a gravar: ${SIGNUP_URL} Ficou alguma dúvida? Me responde aqui 🙂`,
  },
  {
    id: 'comunidade',
    rotulo: 'Convite para a comunidade',
    texto: (nome: string, atendente: string) =>
      `Oi, ${nome}! Aqui é ${atendente}, do Hub Capture. Temos uma comunidade no WhatsApp com dicas para ter os vídeos aprovados e suporte direto. Entra com a gente: ${WHATSAPP_COMMUNITY_URL}`,
  },
] as const

export type ModeloChamadaId = (typeof MODELOS_CHAMADA)[number]['id']

export function primeiroNome(nome: string) {
  const primeiro = nome.trim().split(/\s+/)[0] ?? ''
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase()
}
