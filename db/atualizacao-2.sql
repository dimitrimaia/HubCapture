-- Hub Capture · atualização 2 (painel admin, colab, bots). Para quem JÁ rodou o setup.sql.
-- Cole no Supabase → SQL Editor → Run (uma vez). Guia: docs/painel.md

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
-- RLS sem políticas: só o site (DATABASE_URL) acessa.
ALTER TABLE "usuarios_equipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "configuracoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "erros_sistema" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "colabs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mensagens_auto" ENABLE ROW LEVEL SECURITY;
