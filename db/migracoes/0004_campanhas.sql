CREATE TABLE "campanha_envios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campanha_id" uuid NOT NULL,
	"lead_id" uuid,
	"telefone" text NOT NULL,
	"nome" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"wamid" text,
	"erro" text,
	"enviado_em" timestamp with time zone,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campanha_envios_unico" UNIQUE("campanha_id","telefone")
);
--> statement-breakpoint
CREATE TABLE "campanhas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"modelo" text NOT NULL,
	"idioma" text DEFAULT 'pt_BR' NOT NULL,
	"categoria" text,
	"texto_modelo" text,
	"variaveis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"filtros" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'rascunho' NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"criado_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"iniciado_em" timestamp with time zone,
	"concluido_em" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "campanha_envios" ADD CONSTRAINT "campanha_envios_campanha_id_campanhas_id_fk" FOREIGN KEY ("campanha_id") REFERENCES "public"."campanhas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campanha_envios" ADD CONSTRAINT "campanha_envios_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campanha_envios_status_idx" ON "campanha_envios" USING btree ("campanha_id","status");--> statement-breakpoint
CREATE INDEX "campanha_envios_wamid_idx" ON "campanha_envios" USING btree ("wamid");