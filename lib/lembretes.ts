import 'server-only'
import { and, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm'
import { getDb, leads, mensagensAuto } from '@/db'
import { registrarErro } from './auditoria'
import { primeiroNome } from './mensagens'
import { enviarModelo, whatsappConfigurado } from './whatsapp'

/**
 * Lembretes AUTOMÁTICOS pelo WhatsApp (modelos pagos da Meta). DESLIGADO por padrão.
 *
 * Liga com LEMBRETES_WHATSAPP=ligado + WhatsApp configurado + modelos aprovados em
 * WHATSAPP_MODELO_LEMBRETE_1 e WHATSAPP_MODELO_LEMBRETE_2. Quem chama esta rotina é a rota
 * /api/cron/lembretes (agendador externo a cada hora; ver docs/bots-whatsapp.md).
 *
 * Regras: só quem marcou o consentimento; nunca quem pediu SAIR, converteu ou tem número
 * inválido; no máximo 2 mensagens por pessoa (etapa 1: 1 h após o cadastro; etapa 2: 24 h
 * após a etapa 1, e só se a pessoa não respondeu). A tabela mensagens_auto garante que cada
 * etapa sai uma única vez, mesmo se a rotina rodar duas vezes ao mesmo tempo.
 */

const POR_EXECUCAO = 50
/** Cadastros mais antigos que isso não recebem a 1ª mensagem automática (evita "acordar" lista velha). */
const JANELA_DIAS = 7

export type ResultadoLembretes =
  | { situacao: 'desligado' | 'sem-banco' | 'sem-whatsapp' | 'sem-modelo'; detalhe?: string }
  | { situacao: 'ok'; enviados: number; erros: number; candidatos: number }

export function configuracaoLembretes() {
  return {
    ligado: process.env.LEMBRETES_WHATSAPP === 'ligado',
    modelo1: process.env.WHATSAPP_MODELO_LEMBRETE_1 || null,
    modelo2: process.env.WHATSAPP_MODELO_LEMBRETE_2 || null,
    idioma: process.env.WHATSAPP_MODELO_IDIOMA || 'pt_BR',
  }
}

export async function rodarLembretes(): Promise<ResultadoLembretes> {
  const config = configuracaoLembretes()
  if (!config.ligado) return { situacao: 'desligado', detalhe: 'Defina LEMBRETES_WHATSAPP=ligado para ativar.' }
  const db = getDb()
  if (!db) return { situacao: 'sem-banco' }
  if (!whatsappConfigurado()) return { situacao: 'sem-whatsapp', detalhe: 'Configure WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_APP_SECRET.' }
  if (!config.modelo1) return { situacao: 'sem-modelo', detalhe: 'Defina WHATSAPP_MODELO_LEMBRETE_1 com o nome do modelo aprovado.' }

  const elegivel = and(
    eq(leads.consentimentoWhatsapp, true),
    isNull(leads.optOutEm),
    isNull(leads.convertidoEm),
    isNull(leads.numeroInvalidoEm),
  )

  // Etapa 1: 1 h depois do cadastro, sem etapa 1 registrada.
  const etapa1 = await db
    .select({ id: leads.id, nome: leads.nome, whatsapp: leads.whatsapp })
    .from(leads)
    .where(
      and(
        elegivel,
        lte(leads.criadoEm, sql`now() - interval '1 hour'`),
        gte(leads.criadoEm, sql.raw(`now() - interval '${JANELA_DIAS} days'`)),
        sql`not exists (select 1 from ${mensagensAuto} m where m.lead_id = ${leads.id} and m.etapa = 1)`,
      ),
    )
    .limit(POR_EXECUCAO)

  // Etapa 2: 24 h depois da etapa 1 enviada, se a pessoa não respondeu desde então.
  const etapa2 = config.modelo2
    ? await db
        .select({ id: leads.id, nome: leads.nome, whatsapp: leads.whatsapp })
        .from(leads)
        .innerJoin(mensagensAuto, and(eq(mensagensAuto.leadId, leads.id), eq(mensagensAuto.etapa, 1), eq(mensagensAuto.status, 'enviado')))
        .where(
          and(
            elegivel,
            lte(mensagensAuto.criadoEm, sql`now() - interval '24 hours'`),
            sql`(${leads.respondeuWhatsappEm} is null or ${leads.respondeuWhatsappEm} < ${mensagensAuto.criadoEm})`,
            sql`not exists (select 1 from ${mensagensAuto} m2 where m2.lead_id = ${leads.id} and m2.etapa = 2)`,
          ),
        )
        .limit(POR_EXECUCAO)
    : []

  let enviados = 0
  let erros = 0
  const tarefas = [
    ...etapa1.map((lead) => ({ lead, etapa: 1, modelo: config.modelo1! })),
    ...etapa2.map((lead) => ({ lead, etapa: 2, modelo: config.modelo2! })),
  ].slice(0, POR_EXECUCAO)

  for (const { lead, etapa, modelo } of tarefas) {
    // Reserva a etapa ANTES de enviar: se outra execução já reservou, pula (nunca envia duas vezes).
    const [reserva] = await db
      .insert(mensagensAuto)
      .values({ leadId: lead.id, etapa, modelo, status: 'enviando' })
      .onConflictDoNothing()
      .returning({ id: mensagensAuto.id })
    if (!reserva) continue
    try {
      const wamid = await enviarModelo(lead.whatsapp, modelo, [primeiroNome(lead.nome)], config.idioma)
      await db.update(mensagensAuto).set({ status: 'enviado', wamid }).where(eq(mensagensAuto.id, reserva.id))
      enviados += 1
    } catch (error) {
      erros += 1
      await db.update(mensagensAuto).set({ status: 'erro', erro: String(error).slice(0, 500) }).where(eq(mensagensAuto.id, reserva.id))
      await registrarErro('lembretes', error)
    }
  }
  return { situacao: 'ok', enviados, erros, candidatos: tarefas.length }
}

/** Respondeu SAIR: nunca mais recebe mensagem automática. */
export async function marcarOptOut(numeros: string[]) {
  const db = getDb()
  if (!db || numeros.length === 0) return
  await db.update(leads).set({ optOutEm: new Date() }).where(and(inArray(leads.whatsapp, numeros), isNull(leads.optOutEm)))
}

export async function resumoLembretes() {
  const db = getDb()
  if (!db) return null
  const [linha] = await db
    .select({
      consentiram: sql<number>`(select count(*)::int from ${leads} where ${leads.consentimentoWhatsapp})`,
      sairam: sql<number>`(select count(*)::int from ${leads} where ${leads.optOutEm} is not null)`,
      enviados: sql<number>`(select count(*)::int from ${mensagensAuto} where ${mensagensAuto.status} = 'enviado')`,
      comErro: sql<number>`(select count(*)::int from ${mensagensAuto} where ${mensagensAuto.status} = 'erro')`,
    })
    .from(sql`(select 1) as x`)
  return linha
}
