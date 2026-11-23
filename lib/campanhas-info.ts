/**
 * Preços e explicação dos erros da Meta para campanhas. Sem dependências de servidor:
 * serve para o painel (navegador) e para as rotas.
 */

/** Custo aproximado por mensagem ENTREGUE no Brasil, em US$ (confira a tabela oficial da Meta). */
export const CUSTO_USD: Record<string, number> = { MARKETING: 0.0625, UTILITY: 0.0068, AUTHENTICATION: 0.0068 }

/** Cotação usada só para mostrar o valor aproximado em reais. */
export const COTACAO_BRL = 5.5

export function custoPorMensagem(categoria: string | null | undefined) {
  return CUSTO_USD[(categoria ?? '').toUpperCase()] ?? CUSTO_USD.MARKETING
}

/**
 * Gasto real: a Meta cobra só mensagens entregues (entregue ou lida).
 * Falhas e mensagens que nunca chegaram não são cobradas.
 */
export function custoCampanha(categoria: string | null | undefined, entregues: number) {
  const usd = custoPorMensagem(categoria) * entregues
  return { usd, brl: usd * COTACAO_BRL }
}

export const formatarUsd = (v: number) => `US$ ${v.toFixed(2).replace('.', ',')}`
export const formatarBrl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export type AcaoFalha = 'invalidar' | 'aguardar' | 'conferir'

export type ExplicacaoErro = { codigo: string; titulo: string; detalhe: string; acao: AcaoFalha }

const ERROS: Record<string, Omit<ExplicacaoErro, 'codigo'>> = {
  '131026': {
    titulo: 'Número sem WhatsApp ou que não pode receber',
    detalhe: 'O número não tem WhatsApp, a pessoa bloqueou a empresa ou usa uma versão muito antiga do app.',
    acao: 'invalidar',
  },
  '130472': {
    titulo: 'Bloqueado por um teste da Meta',
    detalhe: 'A Meta está testando limitar mensagens de marketing para este número. Não é erro seu e não é cobrado. Tente numa próxima campanha.',
    acao: 'aguardar',
  },
  '131049': {
    titulo: 'Limite de mensagens de marketing da Meta',
    detalhe: 'A pessoa já recebeu muitas mensagens de marketing de empresas. A Meta segurou a mensagem para não cansar o usuário. Tente daqui a alguns dias.',
    acao: 'aguardar',
  },
  '131050': {
    titulo: 'A pessoa parou de receber marketing',
    detalhe: 'O usuário desativou mensagens de marketing desta empresa no WhatsApp.',
    acao: 'invalidar',
  },
  '131021': { titulo: 'Número igual ao da empresa', detalhe: 'O destino é o próprio número que envia.', acao: 'invalidar' },
  '100': { titulo: 'Número ou dados inválidos', detalhe: 'A Meta recusou o número ou os parâmetros da mensagem.', acao: 'conferir' },
  '131008': { titulo: 'Falta um dado da mensagem', detalhe: 'Alguma variável do modelo ficou vazia.', acao: 'conferir' },
  '132000': { titulo: 'Variáveis não batem com o modelo', detalhe: 'A quantidade de variáveis é diferente da que o modelo aprovado espera.', acao: 'conferir' },
  '132001': { titulo: 'Modelo não encontrado', detalhe: 'O modelo não existe nesta conta ou neste idioma.', acao: 'conferir' },
  '131047': { titulo: 'Fora da janela de 24 horas', detalhe: 'Só dá para mandar modelo aprovado para quem não falou com você nas últimas 24 horas.', acao: 'conferir' },
  '131000': { titulo: 'Erro temporário da Meta', detalhe: 'Falha genérica do lado da Meta.', acao: 'aguardar' },
  '130429': { titulo: 'Envio rápido demais', detalhe: 'A Meta limitou a velocidade. Os próximos envios saem normalmente.', acao: 'aguardar' },
}

/** Traduz o erro guardado no envio ("131026 Message undeliverable", "WhatsApp API 400: …"). */
export function explicarErro(erro: string | null | undefined): ExplicacaoErro {
  const texto = erro ?? ''
  const codigo = texto.match(/\b(13\d{4}|100)\b/)?.[1] ?? ''
  const conhecido = codigo ? ERROS[codigo] : undefined
  if (conhecido) return { codigo, ...conhecido }
  if (/interrompido/i.test(texto)) {
    return { codigo: '', titulo: 'Envio interrompido', detalhe: 'O envio caiu no meio e não foi repetido para não mandar duas vezes.', acao: 'aguardar' }
  }
  return { codigo, titulo: 'Outro erro', detalhe: texto.slice(0, 200) || 'Sem detalhe da Meta.', acao: 'conferir' }
}

export const ROTULO_ACAO: Record<AcaoFalha, string> = {
  invalidar: 'Tirar das próximas campanhas',
  aguardar: 'Pode tentar de novo depois',
  conferir: 'Conferir',
}
