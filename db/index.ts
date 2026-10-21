import 'server-only'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type Db = PostgresJsDatabase<typeof schema>

let instancia: Db | null | undefined

/**
 * Banco (Supabase Postgres). Retorna null quando DATABASE_URL não está configurada:
 * o site continua funcionando só com a planilha, e o painel da equipe mostra como configurar.
 */
export function getDb(): Db | null {
  if (instancia !== undefined) return instancia
  const url = process.env.DATABASE_URL
  // prepare: false é exigido pelo pooler do Supabase em modo transação (porta 6543).
  instancia = url ? drizzle(postgres(url, { prepare: false, max: 3 }), { schema }) : null
  return instancia
}

export * from './schema'
