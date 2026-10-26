CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"usuario_id" uuid,
	"usuario_nome" text,
	"ip" text,
	"detalhe" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_por" text
);
--> statement-breakpoint
CREATE TABLE "erros_sistema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" text NOT NULL,
	"mensagem" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "consentimento_whatsapp" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "opt_out_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "numero_invalido_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensagens_auto" ADD CONSTRAINT "mensagens_auto_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditoria_criado_em_idx" ON "auditoria" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "auditoria_tipo_ip_idx" ON "auditoria" USING btree ("tipo","ip");--> statement-breakpoint
CREATE INDEX "colabs_criado_em_idx" ON "colabs" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "erros_sistema_criado_em_idx" ON "erros_sistema" USING btree ("criado_em");