import { sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

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
    /** Marcou "Aceito receber mensagens do Hub Capture no WhatsApp" (exigido para lembretes automáticos). */
    consentimentoWhatsapp: boolean('consentimento_whatsapp').notNull().default(false),
    /** Respondeu SAIR no WhatsApp: nunca mais recebe mensagem automática. */
    optOutEm: timestamp('opt_out_em', { withTimezone: true }),
    /** A equipe marcou o número como inválido/inexistente: sai da fila. */
    numeroInvalidoEm: timestamp('numero_invalido_em', { withTimezone: true }),
    /** Anotação livre da equipe (ex.: "pediu ajuda com o Minute"). */
    nota: text('nota'),
    /** Etiquetas da equipe (ex.: "voltar sexta"); filtráveis na tabela. */
    etiquetas: text('etiquetas').array().notNull().default(sql`'{}'::text[]`),
    /** Rastreio da primeira visita: links com ?utm_source=…&utm_campaign=… ou ?ref=influencer. */
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    ref: text('ref'),
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

/** Pessoas que entram no painel /equipe. Senha com scrypt; 2FA (TOTP) opcional. */
export const usuariosEquipe = pgTable('usuarios_equipe', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  /** Login (minúsculas). Pode ser um e-mail ou apelido. */
  usuario: text('usuario').notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  /** admin: tudo; equipe: fila, cadastros e colab. */
  papel: text('papel').notNull().default('equipe'),
  ativo: boolean('ativo').notNull().default(true),
  /** Segredo base32 do app autenticador; null = 2FA desligado. */
  totpSegredo: text('totp_segredo'),
  /** Aumenta para derrubar todas as sessões abertas do usuário. */
  sessaoVersao: integer('sessao_versao').notNull().default(1),
  /** true quando a senha foi definida por um admin e precisa ser trocada no próximo login. */
  trocarSenha: boolean('trocar_senha').notNull().default(false),
  ultimoLoginEm: timestamp('ultimo_login_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
})

/** Registro do que acontece no painel (logins, falhas, mudanças de config, usuários). Só recebe inserções. */
export const auditoria = pgTable(
  'auditoria',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tipo: text('tipo').notNull(),
    usuarioId: uuid('usuario_id'),
    usuarioNome: text('usuario_nome'),
    ip: text('ip'),
    detalhe: text('detalhe'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [index('auditoria_criado_em_idx').on(tabela.criadoEm), index('auditoria_tipo_ip_idx').on(tabela.tipo, tabela.ip)],
)

/** Configurações editáveis pelo painel (mensagens prontas, respostas do chat). Valor em JSON. */
export const configuracoes = pgTable('configuracoes', {
  chave: text('chave').primaryKey(),
  valor: jsonb('valor').notNull(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoPor: text('atualizado_por'),
})

/** Últimos erros do sistema (chat, WhatsApp, planilha, banco) para a página Saúde do sistema. */
export const errosSistema = pgTable(
  'erros_sistema',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    origem: text('origem').notNull(),
    mensagem: text('mensagem').notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [index('erros_sistema_criado_em_idx').on(tabela.criadoEm)],
)

/** Inscrições do formulário "Colab com Influencers" (ou importadas da planilha de influencers). */
export const colabs = pgTable(
  'colabs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    perfil: text('perfil').notNull(),
    seguidores: text('seguidores'),
    email: text('email'),
    whatsapp: text('whatsapp').notNull().unique(),
    origem: text('origem').notNull().default('site'),
    /** novo | conversando | parceiro | recusado */
    status: text('status').notNull().default('novo'),
    observacao: text('observacao'),
    chamadoEm: timestamp('chamado_em', { withTimezone: true }),
    chamadoPor: text('chamado_por'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [index('colabs_criado_em_idx').on(tabela.criadoEm)],
)

/** Mensagens automáticas (modelos pagos da Meta) enviadas a cada lead. Uma por etapa: evita repetição. */
export const mensagensAuto = pgTable(
  'mensagens_auto',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    etapa: integer('etapa').notNull(),
    modelo: text('modelo').notNull(),
    /** enviado | erro */
    status: text('status').notNull(),
    wamid: text('wamid'),
    erro: text('erro'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [unique('mensagens_auto_lead_etapa').on(tabela.leadId, tabela.etapa)],
)
