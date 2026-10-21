import 'server-only'
import { eq, lt, sql } from 'drizzle-orm'
import { getDb, whatsappConversas, whatsappMensagens } from '@/db'
import type { MensagemChat } from './assistente'

/**
 * Memória do atendimento no WhatsApp, por número, por 24 h após a última mensagem
 * (a mesma janela em que a Meta deixa responder sem modelo pago).
 *
 * - Com banco (DATABASE_URL): guarda em whatsapp_conversas e whatsapp_mensagens.
 * - SEM banco: guarda na MEMÓRIA da instância da Vercel. Isso se perde quando a instância
 *   reinicia ou quando a Meta cai em outra instância; a conversa recomeça do zero. Configure
 *   o banco (docs/banco-de-dados.md) para o atendimento lembrar o contexto de verdade.
 */

const VALIDADE_MS = 24 * 60 * 60 * 1000
const MAX_MENSAGENS = 20

const conversasEmMemoria = new Map<string, { mensagens: MensagemChat[]; atualizadoEm: number }>()
const idsEmMemoria = new Map<string, number>()

function limparMemoria() {
  const limite = Date.now() - VALIDADE_MS
  for (const [chave, valor] of conversasEmMemoria) if (valor.atualizadoEm < limite) conversasEmMemoria.delete(chave)
  for (const [id, quando] of idsEmMemoria) if (quando < limite) idsEmMemoria.delete(id)
}

/** true na primeira vez que vemos o id; false se a Meta reenviou a mesma mensagem. */
export async function mensagemNova(id: string) {
  const db = getDb()
  if (db) {
    const inseridas = await db.insert(whatsappMensagens).values({ id }).onConflictDoNothing().returning({ id: whatsappMensagens.id })
    // Faxina leve: apaga ids com mais de 7 dias de vez em quando.
    if (Math.random() < 0.02) await db.delete(whatsappMensagens).where(lt(whatsappMensagens.recebidoEm, sql`now() - interval '7 days'`))
    return inseridas.length > 0
  }
  limparMemoria()
  if (idsEmMemoria.has(id)) return false
  idsEmMemoria.set(id, Date.now())
  return true
}

export async function carregarConversa(telefone: string): Promise<MensagemChat[]> {
  const db = getDb()
  if (db) {
    const [conversa] = await db.select().from(whatsappConversas).where(eq(whatsappConversas.telefone, telefone))
    if (!conversa || Date.now() - conversa.atualizadoEm.getTime() > VALIDADE_MS) return []
    return conversa.mensagens
  }
  const conversa = conversasEmMemoria.get(telefone)
  if (!conversa || Date.now() - conversa.atualizadoEm > VALIDADE_MS) return []
  return conversa.mensagens
}

export async function salvarConversa(telefone: string, mensagens: MensagemChat[]) {
  const recentes = mensagens.slice(-MAX_MENSAGENS)
  const db = getDb()
  if (db) {
    await db
      .insert(whatsappConversas)
      .values({ telefone, mensagens: recentes, atualizadoEm: new Date() })
      .onConflictDoUpdate({ target: whatsappConversas.telefone, set: { mensagens: recentes, atualizadoEm: new Date() } })
    return
  }
  conversasEmMemoria.set(telefone, { mensagens: recentes, atualizadoEm: Date.now() })
}
