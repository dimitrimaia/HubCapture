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
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens_atendimento" ADD CONSTRAINT "mensagens_atendimento_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "atendimentos_ultima_idx" ON "atendimentos" USING btree ("ultima_mensagem_em");--> statement-breakpoint
CREATE INDEX "mensagens_atendimento_idx" ON "mensagens_atendimento" USING btree ("atendimento_id","criado_em");