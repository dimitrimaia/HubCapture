/** Tipos compartilhados entre o navegador e o servidor (sem dependência do banco). */
export type LeadAcao = 'cadastrar' | 'whatsapp' | 'comunidade'
export const LEAD_ACOES: LeadAcao[] = ['cadastrar', 'whatsapp', 'comunidade']

/** Etiquetas rápidas do painel (a equipe também pode criar outras). */
export const ETIQUETAS_SUGERIDAS = ['pediu ajuda com Minute', 'voltar sexta', 'sem resposta', 'quer o HubCap', 'dúvida de pagamento']

/** Etiqueta: até 30 caracteres, sem vírgula, espaços simples. */
export function limparEtiqueta(valor: unknown) {
  if (typeof valor !== 'string') return null
  const limpa = valor.replace(/[,\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30)
  return limpa.length >= 2 ? limpa : null
}
