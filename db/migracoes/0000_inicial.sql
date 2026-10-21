CREATE TABLE "lead_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"detalhe" text,
	"por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "whatsapp_conversas" (
	"telefone" text PRIMARY KEY NOT NULL,
	"mensagens" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_mensagens" (
	"id" text PRIMARY KEY NOT NULL,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_eventos" ADD CONSTRAINT "lead_eventos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_eventos_lead_idx" ON "lead_eventos" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "leads_criado_em_idx" ON "leads" USING btree ("criado_em");