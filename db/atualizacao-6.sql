-- Hub Capture · atualização 6 (vistos do WhatsApp: enviada, entregue, lida).
-- Para quem já rodou as atualizações 2 a 5. Cole no Supabase → SQL Editor → Run (uma vez).
-- Pode rodar de novo sem problema.

CREATE TABLE IF NOT EXISTS "whatsapp_status" (
	"wamid" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"erro" text,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
