import 'server-only'
import { createHash } from 'node:crypto'
import { and, asc, desc, eq, gt, ilike, inArray, ne, or, sql } from 'drizzle-orm'
import { atendimentos, getDb, leads, mensagensAtendimento } from '@/db'
import type { SessaoEquipe } from './equipe'
import { variantesE164 } from './phone'
import { normalizarPergunta } from './respostas-prontas'
import { enviarTexto } from './whatsapp'

/**
 * Central de atendimento (aba Atendimento do painel). Guarda TODAS as conversas do chat do site e
 * do WhatsApp e deixa a equipe assumir, responder, devolver ao assistente e resolver.
 *
 * Fluxo: status "bot" → o assistente responde. A pessoa pede um humano (ou a equipe assume) →
 * "aguardando"/"humano": o assistente fica quieto e só a equipe responde. "resolvida" volta para
 * "bot" quando a pessoa escreve de novo.
 */

export type Canal = 'site' | 'whatsapp'
export type StatusAtendimento = 'bot' | 'aguardando' | 'humano' | 'resolvida'
export type Autor = 'cliente' | 'bot' | 'atendente' | 'sistema'
export type Atendimento = typeof atendimentos.$inferSelect
export type MensagemAtendimento = typeof mensagensAtendimento.$inferSelect

/** No WhatsApp a empresa só responde de graça até 24 h depois da última mensagem da pessoa. */
export const JANELA_WHATSAPP_MS = 24 * 60 * 60 * 1000

export const AVISO_HUMANO =
  'Certo! Chamei alguém da equipe 🙋 Assim que possível uma pessoa responde aqui mesmo. Enquanto isso, pode ir escrevendo sua dúvida.'

/** O código secreto do visitante do site nunca é guardado: só o hash. */
export function hashVisitante(codigo: string) {
  return createHash('sha256').update(`hubcapture-visitante:${codigo}`).digest('hex')
}

export function codigoVisitanteValido(codigo: unknown): codigo is string {
  return typeof codigo === 'string' && /^[0-9a-f-]{36}$/i.test(codigo)
}

const PEDIDOS_HUMANO = [
  /\batendente\b/,
  /\bhumano\b/,
  /\bfalar com (uma |alguem|algu[eé]m|a )?(pessoa|equipe|suporte|voce|dimitri)\b/,
  /\bpessoa de verdade\b/,
  /\bsuporte humano\b/,
  /\bquero falar com (alguem|uma pessoa)\b/,
]

/** "Quero falar com um atendente", "humano", "falar com uma pessoa"… */
export function pediuHumano(texto: string) {
  const normalizado = normalizarPergunta(texto)
  return normalizado.length <= 120 && PEDIDOS_HUMANO.some((padrao) => padrao.test(normalizado))
}

function previa(texto: string) {
  return texto.replace(/\s+/g, ' ').trim().slice(0, 140)
}

/** Liga a conversa a um cadastro (pelo WhatsApp ou pelo id salvo no navegador). */
async function acharLead(dados: { whatsapp?: string; leadId?: string }) {
  const db = getDb()
  if (!db) return null
  if (dados.leadId && /^[0-9a-f-]{36}$/i.test(dados.leadId)) {
    const [lead] = await db.select({ id: leads.id, nome: leads.nome }).from(leads).where(eq(leads.id, dados.leadId))
    if (lead) return lead
  }
  const variantes = dados.whatsapp ? variantesE164(dados.whatsapp) : []
  if (variantes.length === 0) return null
  const [lead] = await db.select({ id: leads.id, nome: leads.nome }).from(leads).where(inArray(leads.whatsapp, variantes)).limit(1)
  return lead ?? null
}

/**
 * Mensagem que a pessoa mandou: cria ou reabre a conversa e guarda a mensagem.
 * Devolve a conversa já atualizada (o status diz se o assistente deve responder).
 */
export async function registrarDoCliente(dados: { canal: Canal; contato: string; texto: string; nome?: string; whatsapp?: string; leadId?: string }) {
  const db = getDb()
  if (!db) return null
  const lead = await acharLead({ whatsapp: dados.whatsapp ?? (dados.canal === 'whatsapp' ? dados.contato : undefined), leadId: dados.leadId })
  const agora = new Date()
  const [atendimento] = await db
    .insert(atendimentos)
    .values({
      canal: dados.canal,
      contato: dados.contato,
      nome: lead?.nome ?? dados.nome ?? null,
      leadId: lead?.id ?? null,
      naoLidas: 1,
      ultimaMensagem: previa(dados.texto),
      ultimaMensagemEm: agora,
      ultimaDoClienteEm: agora,
    })
    .onConflictDoUpdate({
      target: [atendimentos.canal, atendimentos.contato],
      set: {
        nome: sql`coalesce(${atendimentos.nome}, excluded.nome)`,
        leadId: sql`coalesce(${atendimentos.leadId}, excluded.lead_id)`,
        naoLidas: sql`${atendimentos.naoLidas} + 1`,
        ultimaMensagem: previa(dados.texto),
        ultimaMensagemEm: agora,
        ultimaDoClienteEm: agora,
        // Resolvida + nova mensagem = conversa nova com o assistente.
        status: sql`case when ${atendimentos.status} = 'resolvida' then 'bot' else ${atendimentos.status} end`,
        atendenteId: sql`case when ${atendimentos.status} = 'resolvida' then null else ${atendimentos.atendenteId} end`,
        atendenteNome: sql`case when ${atendimentos.status} = 'resolvida' then null else ${atendimentos.atendenteNome} end`,
      },
    })
    .returning()
  await db.insert(mensagensAtendimento).values({ atendimentoId: atendimento.id, autor: 'cliente', texto: dados.texto.slice(0, 4000) })
  return atendimento
}

/** Guarda uma mensagem do assistente ou do sistema (não mexe em não lidas). */
export async function registrarMensagem(atendimentoId: string, autor: Autor, texto: string, extra: { autorNome?: string; wamid?: string; erro?: string } = {}) {
  const db = getDb()
  if (!db) return null
  const [mensagem] = await db
    .insert(mensagensAtendimento)
    .values({ atendimentoId, autor, texto: texto.slice(0, 4000), autorNome: extra.autorNome ?? null, wamid: extra.wamid ?? null, erro: extra.erro ?? null })
    .returning()
  if (autor !== 'sistema') {
    await db.update(atendimentos).set({ ultimaMensagem: previa(texto), ultimaMensagemEm: new Date() }).where(eq(atendimentos.id, atendimentoId))
  }
  return mensagem
}

/** A pessoa pediu um humano: o assistente para e a conversa entra na fila "Aguardando". */
export async function pedirHumano(atendimentoId: string) {
  const db = getDb()
  if (!db) return
  const [atualizado] = await db
    .update(atendimentos)
    .set({ status: 'aguardando' })
    .where(and(eq(atendimentos.id, atendimentoId), eq(atendimentos.status, 'bot')))
    .returning({ id: atendimentos.id })
  if (atualizado) await registrarMensagem(atendimentoId, 'sistema', 'Pediu para falar com uma pessoa.')
}

/* ───────────── Painel ───────────── */

export const FILTROS_ATENDIMENTO = ['fila', 'meus', 'humano', 'bot', 'resolvida', 'todas'] as const
export type FiltroAtendimento = (typeof FILTROS_ATENDIMENTO)[number]

export async function listarAtendimentos(f: { filtro: FiltroAtendimento; canal?: string; busca?: string; sessao: SessaoEquipe }) {
  const db = getDb()
  if (!db) return null
  const condicoes = []
  if (f.filtro === 'fila') condicoes.push(eq(atendimentos.status, 'aguardando'))
  if (f.filtro === 'meus') condicoes.push(and(eq(atendimentos.status, 'humano'), eq(atendimentos.atendenteId, f.sessao.id)))
  if (f.filtro === 'humano') condicoes.push(eq(atendimentos.status, 'humano'))
  if (f.filtro === 'bot') condicoes.push(eq(atendimentos.status, 'bot'))
  if (f.filtro === 'resolvida') condicoes.push(eq(atendimentos.status, 'resolvida'))
  if (f.canal === 'site' || f.canal === 'whatsapp') condicoes.push(eq(atendimentos.canal, f.canal))
  const termo = f.busca?.trim()
  if (termo) {
    const digitos = termo.replace(/\D/g, '')
    condicoes.push(
      or(
        ilike(atendimentos.nome, `%${termo}%`),
        ilike(atendimentos.ultimaMensagem, `%${termo}%`),
        ...(digitos.length >= 4 ? [ilike(atendimentos.contato, `%${digitos}%`)] : []),
      ),
    )
  }
  return db
    .select()
    .from(atendimentos)
    .where(condicoes.length ? and(...condicoes) : undefined)
    .orderBy(desc(atendimentos.ultimaMensagemEm))
    .limit(100)
}

/** Números para as abas e o selo do menu. */
export async function contagemAtendimento(sessao: SessaoEquipe) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db
    .select({
      fila: sql<number>`count(*) filter (where ${atendimentos.status} = 'aguardando')::int`,
      meus: sql<number>`count(*) filter (where ${atendimentos.status} = 'humano' and ${atendimentos.atendenteId} = ${sessao.id})::int`,
      meusNaoLidas: sql<number>`coalesce(sum(${atendimentos.naoLidas}) filter (where ${atendimentos.status} = 'humano' and ${atendimentos.atendenteId} = ${sessao.id}), 0)::int`,
      humano: sql<number>`count(*) filter (where ${atendimentos.status} = 'humano')::int`,
      bot24h: sql<number>`count(*) filter (where ${atendimentos.status} = 'bot' and ${atendimentos.ultimaMensagemEm} > now() - interval '24 hours')::int`,
    })
    .from(atendimentos)
  return linha
}

export async function buscarAtendimento(id: string) {
  const db = getDb()
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const [atendimento] = await db.select().from(atendimentos).where(eq(atendimentos.id, id))
  return atendimento ?? null
}

/** Conversa completa (últimas 500 mensagens). `marcarLida` zera as não lidas. */
export async function conversaCompleta(id: string, { marcarLida = false } = {}) {
  const db = getDb()
  const atendimento = await buscarAtendimento(id)
  if (!db || !atendimento) return null
  const mensagens = await db
    .select()
    .from(mensagensAtendimento)
    .where(eq(mensagensAtendimento.atendimentoId, id))
    .orderBy(desc(mensagensAtendimento.criadoEm))
    .limit(500)
  if (marcarLida && atendimento.naoLidas > 0) await db.update(atendimentos).set({ naoLidas: 0 }).where(eq(atendimentos.id, id))
  return { atendimento, mensagens: mensagens.reverse() }
}

/** Mensagens novas para o chat do site (o visitante só vê respostas da equipe e avisos). */
export async function novasParaVisitante(contato: string, depois: Date) {
  const db = getDb()
  if (!db) return null
  const [atendimento] = await db.select().from(atendimentos).where(and(eq(atendimentos.canal, 'site'), eq(atendimentos.contato, contato)))
  if (!atendimento) return { status: 'bot' as StatusAtendimento, mensagens: [] }
  const mensagens = await db
    .select({ id: mensagensAtendimento.id, autor: mensagensAtendimento.autor, autorNome: mensagensAtendimento.autorNome, texto: mensagensAtendimento.texto, criadoEm: mensagensAtendimento.criadoEm })
    .from(mensagensAtendimento)
    .where(and(eq(mensagensAtendimento.atendimentoId, atendimento.id), eq(mensagensAtendimento.autor, 'atendente'), gt(mensagensAtendimento.criadoEm, depois)))
    .orderBy(asc(mensagensAtendimento.criadoEm))
    .limit(50)
  return { status: atendimento.status as StatusAtendimento, atendente: atendimento.atendenteNome, mensagens }
}

async function mudarStatus(id: string, sessao: SessaoEquipe, status: StatusAtendimento, aviso: string) {
  const db = getDb()
  if (!db) return null
  const [atualizado] = await db
    .update(atendimentos)
    .set({
      status,
      naoLidas: 0,
      ...(status === 'humano' ? { atendenteId: sessao.id, atendenteNome: sessao.nome } : {}),
      ...(status === 'bot' ? { atendenteId: null, atendenteNome: null } : {}),
    })
    .where(and(eq(atendimentos.id, id), ne(atendimentos.status, status)))
    .returning()
  if (atualizado) await registrarMensagem(id, 'sistema', aviso, { autorNome: sessao.nome })
  return atualizado ?? null
}

export const assumir = (id: string, s: SessaoEquipe) => mudarStatus(id, s, 'humano', `${s.nome} assumiu o atendimento.`)
export const devolverAoBot = (id: string, s: SessaoEquipe) => mudarStatus(id, s, 'bot', `${s.nome} devolveu a conversa para o assistente.`)
export const resolver = (id: string, s: SessaoEquipe) => mudarStatus(id, s, 'resolvida', `${s.nome} marcou como resolvida.`)

/** Pode responder agora? No WhatsApp, só dentro de 24 h da última mensagem da pessoa (grátis). */
export function podeResponder(a: Pick<Atendimento, 'canal' | 'ultimaDoClienteEm'>, agora = Date.now()) {
  if (a.canal !== 'whatsapp') return true
  return Boolean(a.ultimaDoClienteEm && agora - a.ultimaDoClienteEm.getTime() < JANELA_WHATSAPP_MS)
}

/**
 * Resposta da equipe. `chave` (gerada no navegador) evita envio duplicado se a pessoa clicar
 * duas vezes ou a rede repetir o pedido. Quem responde assume a conversa.
 */
export async function responder(id: string, sessao: SessaoEquipe, texto: string, chave: string) {
  const db = getDb()
  const atendimento = await buscarAtendimento(id)
  if (!db || !atendimento) return { ok: false as const, erro: 'Conversa não encontrada.' }
  const conteudo = texto.trim().slice(0, 4000)
  if (!conteudo) return { ok: false as const, erro: 'Escreva a mensagem.' }
  if (!podeResponder(atendimento)) {
    return { ok: false as const, erro: 'Passou de 24 h desde a última mensagem da pessoa: o WhatsApp só deixa enviar modelo aprovado (pago). Peça para ela escrever de novo.' }
  }

  // Assume antes de gravar, para o aviso "fulano assumiu" ficar antes da resposta no histórico.
  if (atendimento.status !== 'humano' || !atendimento.atendenteId) await assumir(id, sessao)
  const [mensagem] = await db
    .insert(mensagensAtendimento)
    .values({ atendimentoId: id, autor: 'atendente', autorNome: sessao.nome, texto: conteudo, chave: chave.slice(0, 64) })
    .onConflictDoNothing({ target: [mensagensAtendimento.atendimentoId, mensagensAtendimento.chave] })
    .returning()
  if (!mensagem) return { ok: true as const, repetido: true } // mesmo envio de novo: não manda duas vezes

  await db.update(atendimentos).set({ ultimaMensagem: previa(conteudo), ultimaMensagemEm: new Date(), naoLidas: 0 }).where(eq(atendimentos.id, id))

  if (atendimento.canal === 'whatsapp') {
    try {
      const resposta = (await enviarTexto(atendimento.contato, conteudo)) as { messages?: { id?: string }[] }
      await db.update(mensagensAtendimento).set({ wamid: resposta.messages?.[0]?.id ?? null }).where(eq(mensagensAtendimento.id, mensagem.id))
    } catch (error) {
      const erro = (error instanceof Error ? error.message : String(error)).slice(0, 300)
      await db.update(mensagensAtendimento).set({ erro }).where(eq(mensagensAtendimento.id, mensagem.id))
      return { ok: false as const, erro: `O WhatsApp recusou a mensagem: ${erro}` }
    }
  }
  return { ok: true as const }
}

/**
 * Mensagem enviada por campanha: aparece no histórico da conversa (aba Atendimento), sem contar
 * como não lida. Se a pessoa responder, a conversa já está lá, com o contexto do disparo.
 */
export async function registrarEnvioCampanha(dados: { telefone: string; nome?: string | null; leadId?: string | null; texto: string; campanha: string; wamid?: string | null }) {
  const db = getDb()
  if (!db) return
  const contato = dados.telefone.replace(/\D/g, '')
  const agora = new Date()
  const [atendimento] = await db
    .insert(atendimentos)
    .values({ canal: 'whatsapp', contato, nome: dados.nome ?? null, leadId: dados.leadId ?? null, naoLidas: 0, ultimaMensagem: previa(dados.texto), ultimaMensagemEm: agora })
    .onConflictDoUpdate({
      target: [atendimentos.canal, atendimentos.contato],
      set: {
        nome: sql`coalesce(${atendimentos.nome}, excluded.nome)`,
        leadId: sql`coalesce(${atendimentos.leadId}, excluded.lead_id)`,
        ultimaMensagem: previa(dados.texto),
        ultimaMensagemEm: agora,
      },
    })
    .returning({ id: atendimentos.id })
  await db
    .insert(mensagensAtendimento)
    .values({ atendimentoId: atendimento.id, autor: 'atendente', autorNome: `Campanha · ${dados.campanha}`, texto: dados.texto.slice(0, 4000), wamid: dados.wamid ?? null })
}
