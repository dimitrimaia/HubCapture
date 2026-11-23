import 'server-only'
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm'
import { campanhaEnvios, campanhas, getDb, leads } from '@/db'
import { registrarEnvioCampanha } from './atendimento'
import { registrarErro } from './auditoria'
import { marcarChamado } from './leads'
import { primeiroNome } from './mensagens'
import { enviarModelo, type StatusEntrega } from './whatsapp'
import { carregarConversa, salvarConversa } from './whatsapp-memoria'

/**
 * Campanhas de disparo no WhatsApp com modelos aprovados na Meta.
 *
 * Regras que o código garante (WhatsApp Business Policy + LGPD):
 * - só vai para quem MARCOU "aceito receber mensagens" no cadastro;
 * - nunca para quem respondeu SAIR ou tem número inválido;
 * - cada pessoa recebe a mesma campanha uma vez só (UNIQUE + "reserva" atômica antes de enviar);
 * - respeita um limite diário de contatos (o "nível" do número na Meta), em WHATSAPP_LIMITE_DIARIO.
 */

export type FiltrosPublico = {
  situacao?: 'todos' | 'nao-convertidos' | 'convertidos'
  /** Contato anterior da equipe (botão "Chamar no WhatsApp", Fila ou campanha). */
  chamado?: 'qualquer' | 'nunca' | 'nao-recente' | 'ja-chamados'
  /** Com chamado = 'nao-recente': ninguém chamado nos últimos N dias. */
  chamadoDias?: number
  origem?: 'todas' | 'site' | 'planilha'
  /** Data do cadastro, em dias civis de São Paulo. */
  periodo?: 'todos' | 'hoje' | 'ontem' | '3d' | '7d' | '15d' | '30d' | '90d' | 'personalizado'
  /** Com periodo = 'personalizado' ("AAAA-MM-DD", inclusive). */
  de?: string
  ate?: string
  etiqueta?: string
  /** Não manda para quem recebeu QUALQUER campanha nos últimos N dias (evita cansar o público). */
  semCampanhaDias?: number
  /** Máximo de pessoas (0 = todas). */
  limite?: number
  /** Quem entra primeiro quando há limite. */
  ordem?: 'recentes' | 'antigos'
}

export type Variavel = { tipo: 'nome' | 'fixo'; valor?: string }

export const LIMITE_DIARIO = Math.max(1, Number(process.env.WHATSAPP_LIMITE_DIARIO) || 250)
const LOTE = 40

const DATA = /^\d{4}-\d{2}-\d{2}$/
export const DIAS_PERIODO = { '3d': 3, '7d': 7, '15d': 15, '30d': 30, '90d': 90 } as const
export const LIMITE_MAXIMO = 10000

export function limparFiltros(entrada: unknown): FiltrosPublico {
  const f = (entrada && typeof entrada === 'object' ? entrada : {}) as Record<string, unknown>
  const um = <T extends string>(v: unknown, opcoes: readonly T[], padrao: T) => ((opcoes as readonly unknown[]).includes(v) ? (v as T) : padrao)
  const dias = Number(f.semCampanhaDias)
  const diasChamado = Number(f.chamadoDias)
  const limite = Math.floor(Number(f.limite))
  const data = (v: unknown) => (typeof v === 'string' && DATA.test(v) ? v : '')
  // Campanhas antigas guardavam "nunca chamados" na situação.
  const antigoNunca = f.situacao === 'nunca-chamados'
  let de = data(f.de)
  let ate = data(f.ate)
  if (de && ate && de > ate) [de, ate] = [ate, de]
  const periodo = um(f.periodo, ['todos', 'hoje', 'ontem', '3d', '7d', '15d', '30d', '90d', 'personalizado'] as const, 'todos')
  return {
    situacao: antigoNunca ? 'nao-convertidos' : um(f.situacao, ['todos', 'nao-convertidos', 'convertidos'] as const, 'nao-convertidos'),
    chamado: antigoNunca ? 'nunca' : um(f.chamado, ['qualquer', 'nunca', 'nao-recente', 'ja-chamados'] as const, 'qualquer'),
    chamadoDias: [1, 3, 7, 15, 30, 60].includes(diasChamado) ? diasChamado : 7,
    origem: um(f.origem, ['todas', 'site', 'planilha'] as const, 'todas'),
    periodo: periodo === 'personalizado' && !de && !ate ? 'todos' : periodo,
    de: periodo === 'personalizado' ? de : '',
    ate: periodo === 'personalizado' ? ate : '',
    etiqueta: typeof f.etiqueta === 'string' ? f.etiqueta.slice(0, 30) : '',
    semCampanhaDias: [0, 3, 7, 15, 30].includes(dias) ? dias : 7,
    limite: limite > 0 ? Math.min(limite, LIMITE_MAXIMO) : 0,
    ordem: um(f.ordem, ['recentes', 'antigos'] as const, 'recentes'),
  }
}

function condicoesPublico(f: FiltrosPublico) {
  const c = [eq(leads.consentimentoWhatsapp, true), isNull(leads.optOutEm), isNull(leads.numeroInvalidoEm)]
  if (f.situacao === 'nao-convertidos') c.push(isNull(leads.convertidoEm))
  if (f.situacao === 'convertidos') c.push(sql`${leads.convertidoEm} is not null`)
  if (f.chamado === 'nunca') c.push(isNull(leads.chamadoEm))
  if (f.chamado === 'ja-chamados') c.push(sql`${leads.chamadoEm} is not null`)
  if (f.chamado === 'nao-recente') {
    c.push(sql`(${leads.chamadoEm} is null or ${leads.chamadoEm} < now() - make_interval(days => ${f.chamadoDias ?? 7}))`)
  }
  if (f.origem && f.origem !== 'todas') c.push(eq(leads.origem, f.origem))
  // Dia civil do cadastro em São Paulo (o banco guarda em UTC).
  const dia = sql`(${leads.criadoEm} at time zone 'America/Sao_Paulo')::date`
  const hoje = sql`(now() at time zone 'America/Sao_Paulo')::date`
  if (f.periodo === 'hoje') c.push(sql`${dia} = ${hoje}`)
  if (f.periodo === 'ontem') c.push(sql`${dia} = ${hoje} - 1`)
  if (f.periodo && f.periodo in DIAS_PERIODO) {
    // "Últimos 7 dias" = hoje e os 6 dias antes.
    c.push(sql`${dia} > ${hoje} - ${DIAS_PERIODO[f.periodo as keyof typeof DIAS_PERIODO]}::int`)
  }
  if (f.periodo === 'personalizado') {
    if (f.de) c.push(sql`${dia} >= ${f.de}::date`)
    if (f.ate) c.push(sql`${dia} <= ${f.ate}::date`)
  }
  if (f.etiqueta) c.push(sql`${f.etiqueta} = any(${leads.etiquetas})`)
  if (f.semCampanhaDias) {
    c.push(
      sql`not exists (select 1 from campanha_envios e where e.telefone = leads.whatsapp and e.enviado_em > now() - make_interval(days => ${f.semCampanhaDias}))`,
    )
  }
  return and(...c)
}

/** Ordem de prioridade quando há limite (mais recentes ou mais antigos primeiro). */
function ordemPublico(f: FiltrosPublico) {
  return f.ordem === 'antigos' ? sql`criado_em asc, id` : sql`criado_em desc, id`
}

/** Quantas pessoas a campanha atinge, e quantas no total aceitaram mensagens. */
export async function contarPublico(f: FiltrosPublico) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db
    .select({
      encontrados: sql<number>`count(distinct ${leads.whatsapp}) filter (where ${condicoesPublico(f)})::int`,
      consentiram: sql<number>`count(*) filter (where ${leads.consentimentoWhatsapp} and ${leads.optOutEm} is null)::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(leads)
  if (!linha) return linha
  return { ...linha, publico: f.limite ? Math.min(linha.encontrados, f.limite) : linha.encontrados }
}

export async function criarCampanha(dados: { nome: string; modelo: string; idioma: string; categoria: string; textoModelo: string; variaveis: Variavel[]; filtros: FiltrosPublico; por: string }) {
  const db = getDb()
  if (!db) throw new Error('Banco não configurado')
  const [campanha] = await db
    .insert(campanhas)
    .values({
      nome: dados.nome.slice(0, 80),
      modelo: dados.modelo,
      idioma: dados.idioma,
      categoria: dados.categoria,
      textoModelo: dados.textoModelo,
      variaveis: dados.variaveis,
      filtros: dados.filtros as Record<string, unknown>,
      criadoPor: dados.por,
    })
    .returning()
  return campanha
}

/** Monta os parâmetros {{1}}, {{2}}… para uma pessoa. */
export function parametrosPara(variaveis: Variavel[], nome: string | null) {
  return variaveis.map((v) => (v.tipo === 'nome' ? primeiroNome(nome ?? '') || 'tudo bem' : (v.valor ?? '').slice(0, 200) || '-'))
}

/** Texto final (para o histórico da conversa). */
export function textoFinal(modelo: string, parametros: string[]) {
  return modelo.replace(/\{\{(\d+)\}\}/g, (_, n) => parametros[Number(n) - 1] ?? '')
}

/** Inicia: congela a lista de destinatários (quem entra depois não recebe) e marca "enviando". */
export async function iniciarCampanha(id: string) {
  const db = getDb()
  if (!db) return null
  const [campanha] = await db.select().from(campanhas).where(eq(campanhas.id, id))
  if (!campanha || campanha.status !== 'rascunho') return null
  const filtros = limparFiltros(campanha.filtros)
  await db.execute(sql`
    insert into campanha_envios (campanha_id, lead_id, telefone, nome)
    select ${id}, id, whatsapp, nome from (
      -- Um envio por número (cadastros repetidos com o mesmo WhatsApp contam uma vez).
      select distinct on (whatsapp) id, whatsapp, nome, criado_em from leads
      where ${condicoesPublico(filtros)}
      order by whatsapp, criado_em desc
    ) unicos
    order by ${ordemPublico(filtros)}
    ${filtros.limite ? sql`limit ${filtros.limite}` : sql``}
    on conflict (campanha_id, telefone) do nothing`)
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(campanhaEnvios).where(eq(campanhaEnvios.campanhaId, id))
  const [atualizada] = await db
    .update(campanhas)
    .set({ status: n > 0 ? 'enviando' : 'concluida', total: n, iniciadoEm: new Date(), ...(n === 0 ? { concluidoEm: new Date() } : {}) })
    .where(and(eq(campanhas.id, id), eq(campanhas.status, 'rascunho')))
    .returning()
  return atualizada ?? null
}

/** Quantas pessoas já receberam disparo nas últimas 24 h (todas as campanhas). */
export async function enviadosUltimas24h() {
  const db = getDb()
  if (!db) return 0
  const [{ n }] = await db
    .select({ n: sql<number>`count(distinct ${campanhaEnvios.telefone})::int` })
    .from(campanhaEnvios)
    .where(gt(campanhaEnvios.enviadoEm, sql`now() - interval '24 hours'`))
  return n
}

/**
 * Envia o próximo lote de uma campanha. Seguro para rodar em paralelo (painel aberto + cron):
 * cada envio é "reservado" com FOR UPDATE SKIP LOCKED antes de sair, então nunca sai duas vezes.
 */
export async function processarLote(id: string) {
  const db = getDb()
  if (!db) return { enviados: 0, motivo: 'sem banco' }
  const [campanha] = await db.select().from(campanhas).where(eq(campanhas.id, id))
  if (!campanha || campanha.status !== 'enviando') return { enviados: 0, motivo: campanha?.status ?? 'não encontrada' }

  // Reserva presa há mais de 10 min (instância caiu no meio): marca como falha, sem reenviar.
  await db
    .update(campanhaEnvios)
    .set({ status: 'falhou', erro: 'Envio interrompido; não reenviado para evitar duplicidade.', atualizadoEm: new Date() })
    .where(and(eq(campanhaEnvios.campanhaId, id), eq(campanhaEnvios.status, 'enviando'), sql`${campanhaEnvios.atualizadoEm} < now() - interval '10 minutes'`))

  // "Quantos ainda cabem hoje + reservar" acontece com UM processo por vez (trava no banco), senão
  // o painel e o agendador, rodando juntos, passariam do limite diário da Meta.
  const { reservados, semLimite } = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('hubcapture:campanhas'))`)
    const [{ usados }] = (await tx.execute<{ usados: number }>(sql`
      select count(distinct telefone)::int as usados from campanha_envios
      where enviado_em > now() - interval '24 hours' or status = 'enviando'`)) as unknown as { usados: number }[]
    const disponivel = LIMITE_DIARIO - usados
    if (disponivel <= 0) return { reservados: [], semLimite: true }
    const linhas = await tx.execute<{ id: string; telefone: string; nome: string | null; lead_id: string | null }>(sql`
      update campanha_envios set status = 'enviando', atualizado_em = now()
      where id in (
        select id from campanha_envios where campanha_id = ${id} and status = 'pendente'
        order by id limit ${Math.min(LOTE, disponivel)} for update skip locked
      )
      returning id, telefone, nome, lead_id`)
    return { reservados: [...linhas], semLimite: false }
  })
  if (semLimite) return { enviados: 0, motivo: 'limite diário' }

  let enviados = 0
  for (const envio of reservados) {
    const parametros = parametrosPara(campanha.variaveis, envio.nome)
    try {
      const wamid = await enviarModelo(envio.telefone, campanha.modelo, parametros, campanha.idioma)
      await db.update(campanhaEnvios).set({ status: 'enviado', wamid, enviadoEm: new Date(), atualizadoEm: new Date() }).where(eq(campanhaEnvios.id, envio.id))
      enviados += 1
      const texto = textoFinal(campanha.textoModelo ?? `[modelo ${campanha.modelo}]`, parametros)
      await registrarEnvioCampanha({ telefone: envio.telefone, nome: envio.nome, leadId: envio.lead_id, texto, campanha: campanha.nome, wamid }).catch(() => null)
      // Conta como contato: a Fila não chama de novo quem acabou de receber (próxima etapa em 2 dias).
      if (envio.lead_id) await marcarChamado(envio.lead_id, `Campanha · ${campanha.nome}`, `campanha:${campanha.modelo}`).catch(() => null)
      // A IA do WhatsApp passa a "lembrar" do que foi enviado: se a pessoa responder, continua com contexto.
      await lembrarNaConversa(envio.telefone, texto).catch(() => null)
    } catch (error) {
      const erro = (error instanceof Error ? error.message : String(error)).slice(0, 300)
      await db.update(campanhaEnvios).set({ status: 'falhou', erro, atualizadoEm: new Date() }).where(eq(campanhaEnvios.id, envio.id))
      // Token inválido ou conta bloqueada: pausa a campanha em vez de errar com todo mundo.
      if (/WhatsApp API (401|403)/.test(erro) || /\b(131031|131042|368)\b/.test(erro)) {
        await db.update(campanhas).set({ status: 'pausada' }).where(eq(campanhas.id, id))
        await registrarErro('campanhas', `Campanha "${campanha.nome}" pausada: ${erro}`)
        return { enviados, motivo: 'pausada por erro da Meta' }
      }
    }
  }

  const [{ restantes }] = await db
    .select({ restantes: sql<number>`count(*) filter (where ${campanhaEnvios.status} in ('pendente', 'enviando'))::int` })
    .from(campanhaEnvios)
    .where(eq(campanhaEnvios.campanhaId, id))
  if (restantes === 0) {
    await db.update(campanhas).set({ status: 'concluida', concluidoEm: new Date() }).where(and(eq(campanhas.id, id), eq(campanhas.status, 'enviando')))
  }
  return { enviados, restantes, motivo: restantes === 0 ? 'concluída' : 'continua' }
}

/** Status que a Meta devolve no webhook. Só avança (enviado → entregue → lido); falha sempre vale. */
export async function aplicarStatuses(statuses: StatusEntrega[]) {
  const db = getDb()
  if (!db || statuses.length === 0) return
  const ordem: Record<string, number> = { enviado: 1, entregue: 2, lido: 3 }
  for (const s of statuses) {
    const novo = s.status === 'failed' ? 'falhou' : s.status === 'read' ? 'lido' : s.status === 'delivered' ? 'entregue' : 'enviado'
    await db
      .update(campanhaEnvios)
      .set({ status: novo, atualizadoEm: new Date(), ...(s.erro ? { erro: s.erro } : {}) })
      .where(
        and(
          eq(campanhaEnvios.wamid, s.wamid),
          novo === 'falhou'
            ? sql`true`
            : sql`coalesce(case ${campanhaEnvios.status} when 'enviado' then 1 when 'entregue' then 2 when 'lido' then 3 else 0 end, 0) < ${ordem[novo]}`,
        ),
      )
    // Vistos de qualquer mensagem (respostas da equipe e do assistente). Só avança: enviado → entregue → lido.
    // Sem a atualização 6 rodada, a tabela não existe e isto é ignorado.
    await db
      .execute(
        sql`insert into whatsapp_status (wamid, status, erro) values (${s.wamid}, ${novo}, ${s.erro ?? null})
            on conflict (wamid) do update set status = excluded.status, erro = coalesce(excluded.erro, whatsapp_status.erro), atualizado_em = now()
            where excluded.status = 'falhou'
               or (case whatsapp_status.status when 'enviado' then 1 when 'entregue' then 2 when 'lido' then 3 else 0 end)
                < (case excluded.status when 'enviado' then 1 when 'entregue' then 2 when 'lido' then 3 else 0 end)`,
      )
      .catch(() => null)
  }
}

export async function mudarStatusCampanha(id: string, acao: 'pausar' | 'retomar' | 'cancelar') {
  const db = getDb()
  if (!db) return null
  const de = acao === 'pausar' ? ['enviando'] : acao === 'retomar' ? ['pausada'] : ['rascunho', 'enviando', 'pausada']
  const para = acao === 'pausar' ? 'pausada' : acao === 'retomar' ? 'enviando' : 'cancelada'
  const [linha] = await db
    .update(campanhas)
    .set({ status: para, ...(para === 'cancelada' ? { concluidoEm: new Date() } : {}) })
    .where(and(eq(campanhas.id, id), sql`${campanhas.status} in (${sql.join(de.map((s) => sql`${s}`), sql`, `)})`))
    .returning()
  return linha ?? null
}

/** Lista com os números de cada campanha. */
export async function listarCampanhas() {
  const db = getDb()
  if (!db) return null
  return db
    .select({
      id: campanhas.id,
      nome: campanhas.nome,
      modelo: campanhas.modelo,
      categoria: campanhas.categoria,
      status: campanhas.status,
      total: campanhas.total,
      criadoPor: campanhas.criadoPor,
      criadoEm: campanhas.criadoEm,
      iniciadoEm: campanhas.iniciadoEm,
      enviados: sql<number>`(select count(*) from campanha_envios e where e.campanha_id = campanhas.id and e.status in ('enviado','entregue','lido'))::int`,
      entregues: sql<number>`(select count(*) from campanha_envios e where e.campanha_id = campanhas.id and e.status in ('entregue','lido'))::int`,
      lidos: sql<number>`(select count(*) from campanha_envios e where e.campanha_id = campanhas.id and e.status = 'lido')::int`,
      falhas: sql<number>`(select count(*) from campanha_envios e where e.campanha_id = campanhas.id and e.status = 'falhou')::int`,
      responderam: sql<number>`(select count(*) from campanha_envios e join leads l on l.id = e.lead_id where e.campanha_id = campanhas.id and l.respondeu_whatsapp_em > e.enviado_em)::int`,
    })
    .from(campanhas)
    .orderBy(desc(campanhas.criadoEm))
    .limit(50)
}

export async function detalheCampanha(id: string, filtro: 'todos' | 'falhas' = 'todos') {
  const db = getDb()
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const lista = await listarCampanhas()
  const resumo = lista?.find((c) => c.id === id)
  if (!resumo) return null
  const [campanha] = await db.select().from(campanhas).where(eq(campanhas.id, id))
  const colunas = {
    telefone: campanhaEnvios.telefone,
    nome: campanhaEnvios.nome,
    status: campanhaEnvios.status,
    erro: campanhaEnvios.erro,
    enviadoEm: campanhaEnvios.enviadoEm,
    leadId: campanhaEnvios.leadId,
    invalido: sql<boolean>`(${leads.numeroInvalidoEm} is not null or ${leads.optOutEm} is not null)`,
  }
  const daCampanha = eq(campanhaEnvios.campanhaId, id)
  const soFalhas = and(daCampanha, eq(campanhaEnvios.status, 'falhou'))
  const [envios, falhas] = await Promise.all([
    db
      .select(colunas)
      .from(campanhaEnvios)
      .leftJoin(leads, eq(leads.id, campanhaEnvios.leadId))
      .where(filtro === 'falhas' ? soFalhas : daCampanha)
      .orderBy(desc(campanhaEnvios.atualizadoEm))
      .limit(filtro === 'falhas' ? 2000 : 200),
    // Todas as falhas (só o necessário) para o resumo por motivo.
    db
      .select({ erro: campanhaEnvios.erro, leadId: campanhaEnvios.leadId, invalido: colunas.invalido })
      .from(campanhaEnvios)
      .leftJoin(leads, eq(leads.id, campanhaEnvios.leadId))
      .where(soFalhas)
      .limit(5000),
  ])
  return { ...resumo, textoModelo: campanha.textoModelo, variaveis: campanha.variaveis, filtros: limparFiltros(campanha.filtros), envios, falhasLista: falhas }
}

/** Campanhas que estão enviando (para o cron continuar mesmo com o painel fechado). */
export async function campanhasEnviando() {
  const db = getDb()
  if (!db) return []
  return db.select({ id: campanhas.id }).from(campanhas).where(eq(campanhas.status, 'enviando'))
}

/** Coloca a mensagem da campanha na memória do assistente do WhatsApp (contexto da próxima resposta). */
async function lembrarNaConversa(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, '')
  const historico = await carregarConversa(numero)
  // O histórico precisa começar por uma fala da pessoa (limparHistorico corta o que vem antes):
  // por isso uma linha de contexto antes da mensagem enviada.
  await salvarConversa(numero, [
    ...historico,
    { role: 'user', content: '(Contexto interno: o Hub Capture enviou a mensagem a seguir para esta pessoa por uma campanha no WhatsApp.)' },
    { role: 'assistant', content: texto },
  ])
}
