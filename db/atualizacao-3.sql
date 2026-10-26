-- Hub Capture · atualização 3 (etiquetas, notas e rastreio UTM nos cadastros).
-- Para quem JÁ rodou o setup.sql e a atualizacao-2.sql. Cole no Supabase → SQL Editor → Run.
-- Pode rodar mais de uma vez sem problema.

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "nota" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "etiquetas" text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_source" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_medium" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_campaign" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "ref" text;
CREATE INDEX IF NOT EXISTS "leads_etiquetas_idx" ON "leads" USING gin ("etiquetas");
