import type { LeadAcao } from './leads-tipos'

/**
 * Lembra no navegador que a pessoa deixou nome e WhatsApp, para:
 * - reabrir /cadastro direto no "próximo passo";
 * - na próxima visita, avisar "Falta só criar sua conta" se ela não tocou em criar conta.
 */
export type CadastroLocal = {
  id: string | null
  nome: string
  whatsapp: string
  etapa: 'pendente' | 'concluido'
  em: number
}

const CHAVE = 'hubcapture:cadastro'
const CHAVE_SESSAO = 'hubcapture:cadastro-nesta-visita'
const CHAVE_AVISO = 'hubcapture:aviso-fechado'
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000

export function lerCadastroLocal(): CadastroLocal | null {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as CadastroLocal | null
    if (!dados || Date.now() - dados.em > VALIDADE_MS) return null
    return dados
  } catch {
    return null
  }
}

export function salvarCadastroLocal(dados: CadastroLocal) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
    sessionStorage.setItem(CHAVE_SESSAO, '1')
  } catch {}
}

export function concluirCadastroLocal() {
  const dados = lerCadastroLocal()
  if (dados) salvarCadastroLocal({ ...dados, etapa: 'concluido' })
}

export function esquecerCadastroLocal() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {}
}

/** O aviso só aparece numa visita seguinte (não logo depois de enviar) e some se a pessoa fechar. */
export function deveMostrarAviso() {
  try {
    if (sessionStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_AVISO)) return false
  } catch {
    return false
  }
  return lerCadastroLocal()?.etapa === 'pendente'
}

export function fecharAviso() {
  try {
    sessionStorage.setItem(CHAVE_AVISO, '1')
  } catch {}
}

/** Registra o botão tocado sem atrasar a abertura do link (sendBeacon sobrevive à troca de aba). */
export function enviarAcao(acao: LeadAcao) {
  const dados = lerCadastroLocal()
  if (!dados) return
  const corpo = JSON.stringify({ id: dados.id, whatsapp: dados.whatsapp, nome: dados.nome, acao })
  try {
    if (navigator.sendBeacon?.('/api/cadastro/acao', new Blob([corpo], { type: 'text/plain' }))) return
  } catch {}
  fetch('/api/cadastro/acao', { method: 'POST', body: corpo, keepalive: true }).catch(() => {})
}
