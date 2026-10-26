import 'server-only'
import { and, desc, eq, gt, sql } from 'drizzle-orm'
import { auditoria, errosSistema, getDb } from '@/db'
import { alertarErro } from './alerta'

type Ator = { id?: string | null; nome?: string | null } | null

/** Registra um evento do painel. Nunca derruba a ação principal se o registro falhar. */
export async function registrarAuditoria(tipo: string, ator: Ator, dados: { ip?: string; detalhe?: string } = {}) {
  const db = getDb()
  if (!db) return
  await db
    .insert(auditoria)
    .values({ tipo, usuarioId: ator?.id ?? null, usuarioNome: ator?.nome ?? null, ip: dados.ip ?? null, detalhe: dados.detalhe?.slice(0, 500) ?? null })
    .catch((error) => console.error('[auditoria]', error))
}

/** Guarda um erro para a página "Saúde do sistema" (além do log da Vercel). */
export async function registrarErro(origem: string, erro: unknown) {
  const mensagem = (erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro))
    // Nunca guarda credenciais que venham em URLs.
    .replace(/\/\/[^@\s/]+@/g, '//***@')
    .slice(0, 600)
  console.error(`[${origem}]`, erro)
  const db = getDb()
  await Promise.all([db?.insert(errosSistema).values({ origem, mensagem }).catch(() => {}), alertarErro(origem, mensagem)])
}

/** Quantas falhas de login recentes (por IP ou por usuário) para bloquear força bruta em todas as instâncias. */
export async function falhasLoginRecentes({ ip, usuario }: { ip: string; usuario?: string }) {
  const db = getDb()
  if (!db) return 0
  const desde = sql`now() - interval '15 minutes'`
  const [porIp] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(auditoria)
    .where(and(eq(auditoria.tipo, 'login_falhou'), eq(auditoria.ip, ip), gt(auditoria.criadoEm, desde)))
  let porUsuario = 0
  if (usuario) {
    const [linha] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(auditoria)
      .where(and(eq(auditoria.tipo, 'login_falhou'), eq(auditoria.detalhe, usuario), gt(auditoria.criadoEm, desde)))
    porUsuario = linha?.n ?? 0
  }
  return Math.max(porIp?.n ?? 0, porUsuario)
}

export async function ultimosEventos(limite = 60) {
  const db = getDb()
  if (!db) return []
  return db.select().from(auditoria).orderBy(desc(auditoria.criadoEm)).limit(limite)
}

export async function ultimosErros(limite = 50) {
  const db = getDb()
  if (!db) return []
  return db.select().from(errosSistema).orderBy(desc(errosSistema.criadoEm)).limit(limite)
}
