/** Tipos compartilhados entre o navegador e o servidor (sem dependência do banco). */
export type LeadAcao = 'cadastrar' | 'whatsapp' | 'comunidade'
export const LEAD_ACOES: LeadAcao[] = ['cadastrar', 'whatsapp', 'comunidade']
