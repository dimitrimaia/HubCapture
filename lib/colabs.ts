import 'server-only'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { colabs, getDb } from '@/db'

export type Colab = typeof colabs.$inferSelect
export const STATUS_COLAB = ['novo', 'conversando', 'parceiro', 'recusado'] as const
export type StatusColab = (typeof STATUS_COLAB)[number]

/** Salva (ou atualiza, se o WhatsApp já existe) a inscrição de influencer. */
export async function salvarColab(dados: { nome: string; perfil: string; seguidores: string; email: string; whatsapp: string; origem?: string }) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db
    .insert(colabs)
    .values({ ...dados, origem: dados.origem ?? 'site' })
    .onConflictDoUpdate({
      target: colabs.whatsapp,
      set: { nome: dados.nome, perfil: dados.perfil, seguidores: dados.seguidores, email: dados.email, atualizadoEm: new Date() },
    })
    .returning({ id: colabs.id })
  return linha.id
}

function condicoesColabs({ status, busca }: { status?: string; busca?: string }) {
  const condicoes = []
  if (status && (STATUS_COLAB as readonly string[]).includes(status)) condicoes.push(eq(colabs.status, status))
  const termo = busca?.trim()
  if (termo) condicoes.push(or(ilike(colabs.nome, `%${termo}%`), ilike(colabs.perfil, `%${termo}%`), ilike(colabs.whatsapp, `%${termo.replace(/\D/g, '') || termo}%`)))
  return condicoes.length ? and(...condicoes) : undefined
}

/** Página da tabela de Colab: itens + total com os mesmos filtros. */
export async function listarColabs(f: { status?: string; busca?: string; pagina?: number; porPagina?: number }) {
  const db = getDb()
  if (!db) return null
  const porPagina = f.porPagina ?? 25
  const onde = condicoesColabs(f)
  const [itens, [contagem]] = await Promise.all([
    db
      .select()
      .from(colabs)
      .where(onde)
      .orderBy(desc(colabs.criadoEm))
      .limit(porPagina)
      .offset(((f.pagina ?? 1) - 1) * porPagina),
    db.select({ n: sql<number>`count(*)::int` }).from(colabs).where(onde),
  ])
  return { itens, total: contagem?.n ?? 0 }
}

/** Para exportar em CSV: mesmos filtros, sem paginação. */
export async function todosColabsFiltrados(f: { status?: string; busca?: string }) {
  const db = getDb()
  if (!db) return null
  return db.select().from(colabs).where(condicoesColabs(f)).orderBy(desc(colabs.criadoEm)).limit(20_000)
}

export async function resumoColabs() {
  const db = getDb()
  if (!db) return null
  const linhas = await db.select({ status: colabs.status, n: sql<number>`count(*)::int` }).from(colabs).groupBy(colabs.status)
  const resumo: Record<string, number> = { total: 0 }
  for (const linha of linhas) {
    resumo[linha.status] = linha.n
    resumo.total += linha.n
  }
  return resumo
}

export async function atualizarColab(id: string, dados: Partial<{ status: StatusColab; observacao: string; chamadoPor: string }>) {
  const db = getDb()
  if (!db) return null
  const { chamadoPor, ...resto } = dados
  const [linha] = await db
    .update(colabs)
    .set({ ...resto, ...(chamadoPor ? { chamadoPor, chamadoEm: new Date() } : {}), atualizadoEm: new Date() })
    .where(eq(colabs.id, id))
    .returning()
  return linha ?? null
}

export async function importarColabs(lista: { nome: string; perfil: string; seguidores: string; email: string; whatsapp: string; criadoEm?: Date }[]) {
  const db = getDb()
  if (!db) return null
  let novos = 0
  for (let i = 0; i < lista.length; i += 200) {
    const inseridos = await db
      .insert(colabs)
      .values(lista.slice(i, i + 200).map((item) => ({ ...item, origem: 'planilha', criadoEm: item.criadoEm ?? new Date() })))
      .onConflictDoNothing({ target: colabs.whatsapp })
      .returning({ id: colabs.id })
    novos += inseridos.length
  }
  return { novos, existentes: lista.length - novos }
}
