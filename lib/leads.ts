import 'server-only'
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm'
import { getDb, leadEventos, leads, limparUrlBanco } from '@/db'
import { type LeadAcao, limparEtiqueta } from './leads-tipos'
import type { Rastreio } from './rastreio'

export { LEAD_ACOES, type LeadAcao } from './leads-tipos'

export type Lead = typeof leads.$inferSelect

/** Cria o lead ou, se o número já existe, atualiza o nome. Retorna o id (ou null sem banco). */
export async function salvarLead(dados: { nome: string; whatsapp: string; origem?: string; consentimento?: boolean; rastreio?: Rastreio }) {
  const db = getDb()
  if (!db) return null
  const consentiu = dados.consentimento === true
  const [lead] = await db
    .insert(leads)
    .values({ nome: dados.nome, whatsapp: dados.whatsapp, origem: dados.origem ?? 'site', consentimentoWhatsapp: consentiu, ...dados.rastreio })
    .onConflictDoUpdate({
      target: leads.whatsapp,
      // Um novo envio só LIGA o consentimento; nunca desliga (quem quer sair responde SAIR).
      // O rastreio da PRIMEIRA vez vale: só preenche o que ainda está vazio.
      set: {
        nome: dados.nome,
        atualizadoEm: new Date(),
        ...(consentiu ? { consentimentoWhatsapp: true } : {}),
        utmSource: sql`coalesce(${leads.utmSource}, excluded.utm_source)`,
        utmMedium: sql`coalesce(${leads.utmMedium}, excluded.utm_medium)`,
        utmCampaign: sql`coalesce(${leads.utmCampaign}, excluded.utm_campaign)`,
        ref: sql`coalesce(${leads.ref}, excluded.ref)`,
      },
    })
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
    dica = `A DATABASE_URL não é uma URL válida. ${conferirUrlBanco()}`

  return { codigo, mensagem, dica }
}

/** Dicas sobre o formato da DATABASE_URL sem nunca mostrar a senha. */
function conferirUrlBanco() {
  const url = limparUrlBanco(process.env.DATABASE_URL)
  const problemas: string[] = []
  if (!/^postgres(ql)?:\/\//.test(url)) problemas.push('não começa com postgresql://')
  if (!url.includes('@')) problemas.push('falta o @ entre a senha e o endereço')
  if (/\[|\]|YOUR-PASSWORD/i.test(url)) problemas.push('ainda tem [YOUR-PASSWORD] ou colchetes')
  if (!/pooler\.supabase\.com:6543\//.test(url)) problemas.push('não termina em pooler.supabase.com:6543/postgres')
  if (/\s/.test(url)) problemas.push('tem espaço ou quebra de linha')
  return problemas.length
    ? `Problemas encontrados: ${problemas.join('; ')}. Copie de novo a URL do Shared/Transaction pooler no Supabase.`
    : 'Copie de novo a URL do Shared/Transaction pooler no Supabase e troque [YOUR-PASSWORD] pela senha (sem colchetes).'
}

/* ───────────── Tabela paginada do painel ───────────── */

export const SITUACOES = ['pendentes', 'nunca-chamados', 'chamados', 'convertidos', 'invalidos', 'todos'] as const
export type Situacao = (typeof SITUACOES)[number]
export const ORDENS = ['recentes', 'antigos', 'nome', 'contato'] as const
export type Ordem = (typeof ORDENS)[number]
export const PERIODOS = ['todos', 'hoje', '7d', '30d'] as const
export type Periodo = (typeof PERIODOS)[number]

export type FiltrosLeads = {
  situacao: Situacao
  origem: 'todas' | 'site' | 'planilha'
  periodo: Periodo
  consentiu: boolean
  etiqueta: string
  busca: string
  ordem: Ordem
  pagina: number
  porPagina: number
}

/** Lê os filtros da URL com valores seguros (qualquer valor estranho vira o padrão). */
export function lerFiltrosLeads(params: Record<string, string | undefined>): FiltrosLeads {
  const escolher = <T extends string>(valor: string | undefined, opcoes: readonly T[], padrao: T) =>
    (opcoes as readonly string[]).includes(valor ?? '') ? (valor as T) : padrao
  const porPagina = [25, 50, 100].includes(Number(params.por)) ? Number(params.por) : 25
  return {
    situacao: escolher(params.situacao, SITUACOES, 'pendentes'),
    origem: escolher(params.origem, ['todas', 'site', 'planilha'] as const, 'todas'),
    periodo: escolher(params.periodo, PERIODOS, 'todos'),
    consentiu: params.consentiu === '1',
    etiqueta: limparEtiqueta(params.etiqueta) ?? '',
    busca: (params.q ?? '').slice(0, 60),
    ordem: escolher(params.ordem, ORDENS, 'recentes'),
    pagina: Math.max(1, Math.min(10_000, Number.parseInt(params.pagina ?? '1', 10) || 1)),
    porPagina,
  }
}

function condicoesLeads(f: FiltrosLeads) {
  const condicoes = []
  const ativo = and(isNull(leads.convertidoEm), isNull(leads.numeroInvalidoEm), isNull(leads.optOutEm))
  if (f.situacao === 'pendentes') condicoes.push(ativo)
  if (f.situacao === 'nunca-chamados') condicoes.push(and(ativo, isNull(leads.chamadoEm)))
  if (f.situacao === 'chamados') condicoes.push(and(ativo, sql`${leads.chamadoEm} is not null`))
  if (f.situacao === 'convertidos') condicoes.push(sql`${leads.convertidoEm} is not null`)
  if (f.situacao === 'invalidos') condicoes.push(or(sql`${leads.numeroInvalidoEm} is not null`, sql`${leads.optOutEm} is not null`))
  if (f.origem !== 'todas') condicoes.push(eq(leads.origem, f.origem))
  if (f.periodo === 'hoje')
    condicoes.push(sql`${leads.criadoEm} >= date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'`)
  if (f.periodo === '7d') condicoes.push(sql`${leads.criadoEm} >= now() - interval '7 days'`)
  if (f.periodo === '30d') condicoes.push(sql`${leads.criadoEm} >= now() - interval '30 days'`)
  if (f.consentiu) condicoes.push(eq(leads.consentimentoWhatsapp, true))
  if (f.etiqueta) condicoes.push(sql`${f.etiqueta} = any(${leads.etiquetas})`)
  const termo = f.busca.trim()
  if (termo) {
    const digitos = termo.replace(/\D/g, '')
    condicoes.push(or(ilike(leads.nome, `%${termo}%`), ...(digitos.length >= 3 ? [ilike(leads.whatsapp, `%${digitos}%`)] : [])))
  }
  return condicoes.length ? and(...condicoes) : undefined
}

function ordemLeads(ordem: Ordem) {
  if (ordem === 'antigos') return [asc(leads.criadoEm)]
  if (ordem === 'nome') return [asc(leads.nome)]
  if (ordem === 'contato') return [sql`${leads.chamadoEm} desc nulls last`, desc(leads.criadoEm)]
  return [desc(leads.criadoEm)]
}

export async function paginaLeads(f: FiltrosLeads) {
  const db = getDb()
  if (!db) return null
  const onde = condicoesLeads(f)
  const [itens, [contagem]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(onde)
      .orderBy(...ordemLeads(f.ordem))
      .limit(f.porPagina)
      .offset((f.pagina - 1) * f.porPagina),
    db.select({ n: sql<number>`count(*)::int` }).from(leads).where(onde),
  ])
  return { itens, total: contagem?.n ?? 0 }
}

/** Para exportar em CSV: mesmos filtros, sem paginação (até 20 mil linhas). */
export async function todosLeadsFiltrados(f: FiltrosLeads) {
  const db = getDb()
  if (!db) return null
  return db.select().from(leads).where(condicoesLeads(f)).orderBy(...ordemLeads(f.ordem)).limit(20_000)
}

export async function historicoLead(id: string) {
  const db = getDb()
  if (!db) return null
  return db.select().from(leadEventos).where(eq(leadEventos.leadId, id)).orderBy(desc(leadEventos.criadoEm)).limit(100)
}

/** Ações em lote da tabela (até 100 por vez). */
export async function acaoEmLote(ids: string[], acao: 'convertido' | 'nao-convertido' | 'invalido' | 'valido', por: string) {
  const db = getDb()
  if (!db || ids.length === 0) return 0
  const agora = new Date()
  const set =
    acao === 'convertido'
      ? { convertidoEm: agora, convertidoPor: por }
      : acao === 'nao-convertido'
        ? { convertidoEm: null, convertidoPor: null }
        : acao === 'invalido'
          ? { numeroInvalidoEm: agora }
          : { numeroInvalidoEm: null }
  const atualizados = await db
    .update(leads)
    .set({ ...set, atualizadoEm: agora })
    .where(inArray(leads.id, ids.slice(0, 100)))
    .returning({ id: leads.id })
  if (atualizados.length) {
    await db.insert(leadEventos).values(atualizados.map((l) => ({ leadId: l.id, tipo: `lote:${acao}`, por })))
  }
  return atualizados.length
}

/** Etiquetas já usadas (para o filtro e as sugestões), mais usadas primeiro. */
export async function etiquetasEmUso() {
  const db = getDb()
  if (!db) return []
  const linhas = await db.execute<{ etiqueta: string }>(
    sql`select etiqueta from (select unnest(${leads.etiquetas}) as etiqueta from ${leads}) e group by etiqueta order by count(*) desc limit 50`,
  )
  return [...linhas].map((l) => l.etiqueta)
}

/** Salva nota e/ou etiquetas de um contato e registra no histórico. */
export async function salvarNotas(id: string, dados: { nota?: string; etiquetas?: string[] }, por: string) {
  const db = getDb()
  if (!db) return null
  const set: Partial<typeof leads.$inferInsert> = { atualizadoEm: new Date() }
  if (dados.nota !== undefined) set.nota = dados.nota.trim().slice(0, 2000) || null
  if (dados.etiquetas !== undefined) {
    set.etiquetas = [...new Set(dados.etiquetas.map(limparEtiqueta).filter((e): e is string => Boolean(e)))].slice(0, 10)
  }
  const [lead] = await db.update(leads).set(set).where(eq(leads.id, id)).returning({ id: leads.id, etiquetas: leads.etiquetas, nota: leads.nota })
  if (!lead) return null
  const eventos = []
  if (dados.nota !== undefined) eventos.push({ leadId: id, tipo: 'nota', detalhe: lead.nota?.slice(0, 120) ?? 'nota apagada', por })
  if (dados.etiquetas !== undefined) eventos.push({ leadId: id, tipo: 'etiquetas', detalhe: lead.etiquetas.join(', ') || 'sem etiquetas', por })
  if (eventos.length) await db.insert(leadEventos).values(eventos)
  return lead
}
