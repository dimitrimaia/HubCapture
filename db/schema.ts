import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/** Quem deixou nome e WhatsApp em /cadastro (ou veio importado da planilha). Um por número. */
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    /** Sempre no formato +55DDDNÚMERO (ver lib/phone.ts → toE164). */
    whatsapp: text('whatsapp').notNull().unique(),
    origem: text('origem').notNull().default('site'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
    /** Último botão tocado na tela de próximo passo: cadastrar | whatsapp | comunidade. */
    ultimaAcao: text('ultima_acao'),
    ultimaAcaoEm: timestamp('ultima_acao_em', { withTimezone: true }),
    chamadoEm: timestamp('chamado_em', { withTimezone: true }),
    chamadoPor: text('chamado_por'),
    chamadoModelo: text('chamado_modelo'),
    chamadas: integer('chamadas').notNull().default(0),
    /** Marcado pela equipe ao confirmar a conta criada (aba Indicações do painel Hub). */
    convertidoEm: timestamp('convertido_em', { withTimezone: true }),
    convertidoPor: text('convertido_por'),
    respondeuWhatsappEm: timestamp('respondeu_whatsapp_em', { withTimezone: true }),
  },
  (tabela) => [index('leads_criado_em_idx').on(tabela.criadoEm)],
)

/** Histórico de tudo que aconteceu com cada lead (formulário, botões, chamados, conversão). */
export const leadEventos = pgTable(
  'lead_eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    detalhe: text('detalhe'),
    por: text('por'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [index('lead_eventos_lead_idx').on(tabela.leadId)],
)

/** Conversa do atendimento no WhatsApp, por número; expira 24 h após a última mensagem. */
export const whatsappConversas = pgTable('whatsapp_conversas', {
  telefone: text('telefone').primaryKey(),
  mensagens: jsonb('mensagens').$type<{ role: 'user' | 'assistant'; content: string }[]>().notNull(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
})

/** IDs de mensagens já processadas: a Meta reenvia o webhook e não queremos responder duas vezes. */
export const whatsappMensagens = pgTable('whatsapp_mensagens', {
  id: text('id').primaryKey(),
  recebidoEm: timestamp('recebido_em', { withTimezone: true }).notNull().defaultNow(),
})
