import 'server-only'
import { and, asc, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm'
import { getDb, leadEventos, leads } from '@/db'

/**
 * Fila de chamadas (bot grátis, semi-automático): diz quem chamar hoje e com qual mensagem.
 * A pessoa da equipe só toca "Abrir WhatsApp" e envia a mensagem já escrita (wa.me).
 *
 * Cadência (usa os 3 primeiros modelos de /equipe/mensagens → Cadastro, na ordem):
 *   1º contato: quem nunca foi chamado (mais recentes primeiro)
 *   2º contato: DIAS_ETAPA_2 dias depois do 1º, se ainda não converteu
 *   3º contato: DIAS_ETAPA_3 dias depois do 2º, se ainda não converteu
 * Saem da fila: convertidos, número inválido e quem pediu para sair (SAIR).
 */
export const DIAS_ETAPA_2 = 2
export const DIAS_ETAPA_3 = 3
export const MAX_CONTATOS = 3
/** Acima disso por pessoa/dia, o painel avisa para pausar (risco de restrição do WhatsApp). */
export const LIMITE_DIARIO_SUGERIDO = 40

export type ItemFila = {
  id: string
  nome: string
  whatsapp: string
  etapa: 1 | 2 | 3
  criadoEm: string
  chamadoEm: string | null
  chamadoPor: string | null
  ultimaAcao: string | null
  respondeuWhatsapp: boolean
}

export async function montarFila(limite = 200): Promise<ItemFila[] | null> {
  const db = getDb()
  if (!db) return null
  const ativo = and(isNull(leads.convertidoEm), isNull(leads.numeroInvalidoEm), isNull(leads.optOutEm))
  const devido = or(
    eq(leads.chamadas, 0),
    and(eq(leads.chamadas, 1), lte(leads.chamadoEm, sql.raw(`now() - interval '${DIAS_ETAPA_2} days'`))),
    and(eq(leads.chamadas, 2), lte(leads.chamadoEm, sql.raw(`now() - interval '${DIAS_ETAPA_3} days'`))),
  )
  const linhas = await db
    .select()
    .from(leads)
    .where(and(ativo, devido))
    // 1º contato primeiro (os mais novos convertem mais); depois os retornos que venceram há mais tempo.
    .orderBy(asc(leads.chamadas), desc(sql`case when ${leads.chamadas} = 0 then ${leads.criadoEm} end`), asc(leads.chamadoEm))
    .limit(limite)

  return linhas.map((lead) => ({
    id: lead.id,
    nome: lead.nome,
    whatsapp: lead.whatsapp,
    etapa: (Math.min(lead.chamadas, MAX_CONTATOS - 1) + 1) as 1 | 2 | 3,
    criadoEm: lead.criadoEm.toISOString(),
    chamadoEm: lead.chamadoEm?.toISOString() ?? null,
    chamadoPor: lead.chamadoPor,
    ultimaAcao: lead.ultimaAcao,
    respondeuWhatsapp: Boolean(lead.respondeuWhatsappEm),
  }))
}

/** Quantos chamados esta pessoa fez hoje (dia de Brasília). */
export async function chamadosHoje(por: string) {
  const db = getDb()
  if (!db) return 0
  const [linha] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(leadEventos)
    .where(
      and(
        eq(leadEventos.tipo, 'chamado'),
        eq(leadEventos.por, por),
        gte(leadEventos.criadoEm, sql`date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'`),
      ),
    )
  return linha?.n ?? 0
}

/** Marca número inválido/inexistente: o lead sai da fila (pode ser desfeito na aba Cadastros). */
export async function marcarNumeroInvalido(id: string, por: string, invalido = true) {
  const db = getDb()
  if (!db) return null
  const [lead] = await db
    .update(leads)
    .set({ numeroInvalidoEm: invalido ? new Date() : null, atualizadoEm: new Date() })
    .where(eq(leads.id, id))
    .returning({ id: leads.id })
  if (lead) await db.insert(leadEventos).values({ leadId: id, tipo: invalido ? 'numero_invalido' : 'numero_valido', por })
  return lead ?? null
}
