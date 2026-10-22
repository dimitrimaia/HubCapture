import 'server-only'
import { and, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm'
import { getDb, leadEventos, leads } from '@/db'
import type { LeadAcao } from './leads-tipos'

export { LEAD_ACOES, type LeadAcao } from './leads-tipos'

export type Lead = typeof leads.$inferSelect

/** Cria o lead ou, se o número já existe, atualiza o nome. Retorna o id (ou null sem banco). */
export async function salvarLead(dados: { nome: string; whatsapp: string; origem?: string }) {
  const db = getDb()
  if (!db) return null
  const [lead] = await db
    .insert(leads)
    .values({ nome: dados.nome, whatsapp: dados.whatsapp, origem: dados.origem ?? 'site' })
    .onConflictDoUpdate({ target: leads.whatsapp, set: { nome: dados.nome, atualizadoEm: new Date() } })
    .returning({ id: leads.id })
  await db.insert(leadEventos).values({ leadId: lead.id, tipo: 'formulario' })
  return lead.id
}

/** Registra o botão tocado na tela de próximo passo do cadastro. */
export async function registrarAcao(id: string, acao: LeadAcao) {
  const db = getDb()
  if (!db) return null
  const agora = new Date()
  const [lead] = await db
    .update(leads)
    .set({ ultimaAcao: acao, ultimaAcaoEm: agora, atualizadoEm: agora })
    .where(eq(leads.id, id))
    .returning({ id: leads.id, whatsapp: leads.whatsapp })
  if (!lead) return null
  await db.insert(leadEventos).values({ leadId: lead.id, tipo: `acao:${acao}` })
  return lead
}

export type FiltroLeads = 'nao-convertidos' | 'nao-chamados' | 'todos'

export async function listarLeads({ filtro, busca, limite = 300 }: { filtro: FiltroLeads; busca?: string; limite?: number }) {
  const db = getDb()
  if (!db) return null
  const condicoes = []
  if (filtro === 'nao-convertidos') condicoes.push(isNull(leads.convertidoEm))
  if (filtro === 'nao-chamados') condicoes.push(and(isNull(leads.convertidoEm), isNull(leads.chamadoEm)))
  const termo = busca?.trim()
  if (termo) {
    const digitos = termo.replace(/\D/g, '')
    condicoes.push(
      or(ilike(leads.nome, `%${termo}%`), ...(digitos.length >= 3 ? [ilike(leads.whatsapp, `%${digitos}%`)] : [])),
    )
  }
  return db
    .select()
    .from(leads)
    .where(condicoes.length ? and(...condicoes) : undefined)
    .orderBy(desc(leads.criadoEm))
    .limit(limite)
}

export async function resumoLeads() {
  const db = getDb()
  if (!db) return null
  const [resumo] = await db
    .select({
      total: sql<number>`count(*)::int`,
      ultimas24h: sql<number>`count(*) filter (where ${leads.criadoEm} > now() - interval '24 hours')::int`,
      tocaramCadastrar: sql<number>`count(*) filter (where ${leads.ultimaAcao} is not null)::int`,
      chamados: sql<number>`count(*) filter (where ${leads.chamadoEm} is not null)::int`,
      responderam: sql<number>`count(*) filter (where ${leads.respondeuWhatsappEm} is not null)::int`,
      convertidos: sql<number>`count(*) filter (where ${leads.convertidoEm} is not null)::int`,
    })
    .from(leads)
  return resumo
}

/** Marca que alguém da equipe chamou o lead no WhatsApp (evita duas pessoas chamarem a mesma). */
export async function marcarChamado(id: string, por: string, modelo: string) {
  const db = getDb()
  if (!db) return null
  const agora = new Date()
  const [lead] = await db
    .update(leads)
    .set({ chamadoEm: agora, chamadoPor: por, chamadoModelo: modelo, chamadas: sql`${leads.chamadas} + 1`, atualizadoEm: agora })
    .where(eq(leads.id, id))
    .returning()
  if (lead) await db.insert(leadEventos).values({ leadId: id, tipo: 'chamado', detalhe: modelo, por })
  return lead ?? null
}

export async function marcarConvertido(id: string, por: string, convertido: boolean) {
  const db = getDb()
  if (!db) return null
  const [lead] = await db
    .update(leads)
    .set({ convertidoEm: convertido ? new Date() : null, convertidoPor: convertido ? por : null, atualizadoEm: new Date() })
    .where(eq(leads.id, id))
    .returning()
  if (lead) await db.insert(leadEventos).values({ leadId: id, tipo: convertido ? 'convertido' : 'desconvertido', por })
  return lead ?? null
}

/** Quando a pessoa escreve para o WhatsApp do atendimento, marca no lead (se existir). */
export async function marcarRespondeuWhatsapp(numeros: string[]) {
  const db = getDb()
  if (!db || numeros.length === 0) return
  await db
    .update(leads)
    .set({ respondeuWhatsappEm: new Date() })
    .where(and(inArray(leads.whatsapp, numeros), isNull(leads.respondeuWhatsappEm)))
}

/** Importa leads (ex.: da planilha). Números já existentes são mantidos como estão. */
export async function importarLeads(lista: { nome: string; whatsapp: string; criadoEm?: Date }[]) {
  const db = getDb()
  if (!db) return null
  let novos = 0
  for (let i = 0; i < lista.length; i += 200) {
    const lote = lista.slice(i, i + 200)
    const inseridos = await db
      .insert(leads)
      .values(lote.map((item) => ({ nome: item.nome, whatsapp: item.whatsapp, origem: 'planilha', criadoEm: item.criadoEm ?? new Date() })))
      .onConflictDoNothing({ target: leads.whatsapp })
      .returning({ id: leads.id })
    novos += inseridos.length
  }
  return { novos, existentes: lista.length - novos }
}

/** Traduz o erro de conexão/consulta do Postgres para algo que a equipe consiga resolver. */
export function explicarErroBanco(error: unknown) {
  const causa = (error as { cause?: unknown })?.cause ?? error
  const codigo = String((causa as { code?: string })?.code ?? '')
  // Nunca mostra a senha: mascara qualquer usuario:senha@ que venha na mensagem.
  const mensagem = String((causa as Error)?.message ?? causa)
    .replace(/\/\/[^@\s/]+@/g, '//***@')
    .slice(0, 200)
  const texto = `${codigo} ${mensagem}`

  let dica = 'Confira a DATABASE_URL na Vercel (URL do Transaction pooler, porta 6543) e faça Redeploy.'
  if (/28P01|password authentication failed/i.test(texto))
    dica = 'Senha do banco errada na DATABASE_URL. Troque [YOUR-PASSWORD] pela senha do projeto (com & ou + codificados como %26 e %2B) ou redefina a senha em Supabase → Project Settings → Database.'
  else if (/42P01|does not exist/i.test(texto))
    dica = 'A conexão funcionou, mas as tabelas não existem: rode o db/setup.sql no Supabase → SQL Editor.'
  else if (/tenant or user not found/i.test(texto))
    dica = 'Usuário errado para o pooler: na URL do Transaction pooler o usuário é postgres.<id-do-projeto>, não só postgres. Copie a URL de novo em Connect → Transaction pooler.'
  else if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(texto))
    dica = 'Endereço do banco não encontrado. A DATABASE_URL está incompleta ou é a "Direct connection" (db.xxx.supabase.co, só IPv6). Use a URL do Transaction pooler (…pooler.supabase.com:6543).'
  else if (/ECONNREFUSED|ETIMEDOUT|CONNECT_TIMEOUT|ENETUNREACH|timeout/i.test(texto))
    dica = 'O banco não respondeu. Verifique se o projeto não está pausado (Supabase → Restore project) e se a URL é a do Transaction pooler (porta 6543).'
  else if (/Invalid URL|ERR_INVALID_URL|invalid connection string/i.test(texto))
    dica = 'A DATABASE_URL não é uma URL válida. Ela começa com postgresql:// e não pode ter espaços ou aspas.'

  return { codigo, mensagem, dica }
}
