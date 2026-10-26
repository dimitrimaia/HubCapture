import 'server-only'
import { and, eq, gt, sql } from 'drizzle-orm'
import { auditoria, getDb } from '@/db'
import { SITE_URL } from './site'

/**
 * Alerta de erro por e-mail (Resend, plano grátis: 3.000 e-mails/mês).
 * Variáveis: RESEND_API_KEY e ALERTA_EMAIL (para onde vai). ALERTA_REMETENTE é opcional:
 * sem domínio verificado no Resend, use o padrão onboarding@resend.dev (só entrega para o
 * e-mail da sua conta Resend, que é o caso do admin).
 * No máximo 1 e-mail por hora para cada origem (planilha, chat, whatsapp…), em todas as instâncias.
 */

const INTERVALO_MS = 60 * 60 * 1000
const ultimoEnvio = new Map<string, number>()

export function alertaConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.ALERTA_EMAIL)
}

async function jaAvisouNaUltimaHora(origem: string) {
  const local = ultimoEnvio.get(origem)
  if (local && Date.now() - local < INTERVALO_MS) return true
  const db = getDb()
  if (!db) return false
  const [linha] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(auditoria)
    .where(and(eq(auditoria.tipo, 'alerta_enviado'), eq(auditoria.detalhe, origem), gt(auditoria.criadoEm, sql`now() - interval '1 hour'`)))
  return (linha?.n ?? 0) > 0
}

/** Manda o alerta (ou não, se já mandou nesta hora). Nunca lança erro. */
export async function alertarErro(origem: string, mensagem: string) {
  if (!alertaConfigurado()) return false
  try {
    if (await jaAvisouNaUltimaHora(origem)) return false
    ultimoEnvio.set(origem, Date.now())
    // Registra ANTES de enviar: outra instância que olhar agora já não manda de novo.
    const db = getDb()
    if (db) await db.insert(auditoria).values({ tipo: 'alerta_enviado', detalhe: origem })
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        // Mesma origem e hora → o Resend descarta repetições.
        'Idempotency-Key': `alerta-${origem}-${Math.floor(Date.now() / INTERVALO_MS)}`,
      },
      body: JSON.stringify({
        from: process.env.ALERTA_REMETENTE || 'Hub Capture <onboarding@resend.dev>',
        to: [process.env.ALERTA_EMAIL],
        subject: `[Hub Capture] Erro em ${origem}`,
        text: `Aconteceu um erro em "${origem}":\n\n${mensagem}\n\nDetalhes e últimos erros: ${SITE_URL}/equipe/sistema\n\nVocê recebe no máximo 1 aviso por hora para cada tipo de erro.`,
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!resposta.ok) console.error('[alerta] Resend respondeu', resposta.status, (await resposta.text()).slice(0, 200))
    return resposta.ok
  } catch (error) {
    console.error('[alerta]', error)
    return false
  }
}
