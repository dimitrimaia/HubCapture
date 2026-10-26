-- Hub Capture: instalação do zero. Cole este arquivo inteiro no Supabase → SQL Editor → Run (uma vez).
-- Já rodou uma versão anterior? Use db/atualizacao-2.sql em vez deste.
-- Gerado de db/migracoes/0000_inicial.sql + 0001_painel_admin.sql + RLS. Guia: docs/banco-de-dados.md

CREATE TABLE "lead_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"detalhe" text,
	"por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"whatsapp" text NOT NULL,
	"origem" text DEFAULT 'site' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ultima_acao" text,
	"ultima_acao_em" timestamp with time zone,
	"chamado_em" timestamp with time zone,
	"chamado_por" text,
	"chamado_modelo" text,
	"chamadas" integer DEFAULT 0 NOT NULL,
	"convertido_em" timestamp with time zone,
	"convertido_por" text,
	"respondeu_whatsapp_em" timestamp with time zone,
	CONSTRAINT "leads_whatsapp_unique" UNIQUE("whatsapp")
);

CREATE TABLE "whatsapp_conversas" (
	"telefone" text PRIMARY KEY NOT NULL,
	"mensagens" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "whatsapp_mensagens" (
	"id" text PRIMARY KEY NOT NULL,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "lead_eventos" ADD CONSTRAINT "lead_eventos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "lead_eventos_lead_idx" ON "lead_eventos" USING btree ("lead_id");
CREATE INDEX "leads_criado_em_idx" ON "leads" USING btree ("criado_em");

CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"usuario_id" uuid,
	"usuario_nome" text,
	"ip" text,
	"detalhe" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "colabs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"perfil" text NOT NULL,
	"seguidores" text,
	"email" text,
	"whatsapp" text NOT NULL,
	"origem" text DEFAULT 'site' NOT NULL,
	"status" text DEFAULT 'novo' NOT NULL,
	"observacao" text,
	"chamado_em" timestamp with time zone,
	"chamado_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colabs_whatsapp_unique" UNIQUE("whatsapp")
);

CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_por" text
);

CREATE TABLE "erros_sistema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" text NOT NULL,
	"mensagem" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "mensagens_auto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"etapa" integer NOT NULL,
	"modelo" text NOT NULL,
	"status" text NOT NULL,
	"wamid" text,
	"erro" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mensagens_auto_lead_etapa" UNIQUE("lead_id","etapa")
);

CREATE TABLE "usuarios_equipe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"usuario" text NOT NULL,
	"senha_hash" text NOT NULL,
	"papel" text DEFAULT 'equipe' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"totp_segredo" text,
	"sessao_versao" integer DEFAULT 1 NOT NULL,
	"trocar_senha" boolean DEFAULT false NOT NULL,
	"ultimo_login_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_equipe_usuario_unique" UNIQUE("usuario")
);

ALTER TABLE "leads" ADD COLUMN "consentimento_whatsapp" boolean DEFAULT false NOT NULL;
ALTER TABLE "leads" ADD COLUMN "opt_out_em" timestamp with time zone;
ALTER TABLE "leads" ADD COLUMN "numero_invalido_em" timestamp with time zone;
ALTER TABLE "mensagens_auto" ADD CONSTRAINT "mensagens_auto_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "auditoria_criado_em_idx" ON "auditoria" USING btree ("criado_em");
CREATE INDEX "auditoria_tipo_ip_idx" ON "auditoria" USING btree ("tipo","ip");
CREATE INDEX "colabs_criado_em_idx" ON "colabs" USING btree ("criado_em");
CREATE INDEX "erros_sistema_criado_em_idx" ON "erros_sistema" USING btree ("criado_em");
-- RLS ligado e SEM políticas: a API pública do Supabase (chave anon/publishable) não lê nem grava
-- nada. O site conecta pelo DATABASE_URL como dono das tabelas, que ignora o RLS.
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_eventos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_conversas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_mensagens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios_equipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "configuracoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "erros_sistema" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "colabs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mensagens_auto" ENABLE ROW LEVEL SECURITY;
-- Atualização 3: etiquetas, notas e rastreio UTM.
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "nota" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "etiquetas" text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_source" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_medium" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_campaign" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "ref" text;
CREATE INDEX IF NOT EXISTS "leads_etiquetas_idx" ON "leads" USING gin ("etiquetas");

-- Atualização 4: central de atendimento.
CREATE TABLE "atendimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canal" text NOT NULL,
	"contato" text NOT NULL,
	"nome" text,
	"lead_id" uuid,
	"status" text DEFAULT 'bot' NOT NULL,
	"atendente_id" uuid,
	"atendente_nome" text,
	"nao_lidas" integer DEFAULT 0 NOT NULL,
	"ultima_mensagem" text,
	"ultima_mensagem_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ultima_do_cliente_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "atendimentos_canal_contato" UNIQUE("canal","contato")
);

CREATE TABLE "mensagens_atendimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"autor" text NOT NULL,
	"autor_nome" text,
	"texto" text NOT NULL,
	"chave" text,
	"wamid" text,
	"erro" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mensagens_atendimento_chave" UNIQUE("atendimento_id","chave")
);

ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "mensagens_atendimento" ADD CONSTRAINT "mensagens_atendimento_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "atendimentos_ultima_idx" ON "atendimentos" USING btree ("ultima_mensagem_em");
CREATE INDEX "mensagens_atendimento_idx" ON "mensagens_atendimento" USING btree ("atendimento_id","criado_em");ALTER TABLE "atendimentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mensagens_atendimento" ENABLE ROW LEVEL SECURITY;
