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
  const url = limparUrlBanco(process.env.DATABASE_URL)
  // prepare: false é exigido pelo pooler do Supabase em modo transação (porta 6543).
  // connect_timeout curto: com URL errada o painel mostra o erro em segundos, não em 30 s.
  instancia = url ? drizzle(postgres(url, { prepare: false, max: 3, connect_timeout: 10 }), { schema }) : null
  return instancia
}

/**
 * Corrige os erros comuns ao colar a DATABASE_URL na Vercel: espaços, aspas, o prefixo
 * "DATABASE_URL=", colchetes deixados em volta da senha ([senha]) e senha com caracteres
 * especiais (@ # / ? & +) sem codificar, que deixam a URL inválida.
 */
export function limparUrlBanco(bruta?: string) {
  let url = (bruta ?? '').trim().replace(/^DATABASE_URL\s*=\s*/i, '').trim().replace(/^["']|["']$/g, '').trim()
  if (!url) return ''
  // usuario:senha@host:porta/banco — a senha vai até o ÚLTIMO @ (ela mesma pode ter @).
  const partes = /^(postgres(?:ql)?:\/\/)([^:/@]+):(.*)@([^@/]+(?::\d+)?\/[^\s]*)$/.exec(url)
  if (partes) {
    const [, protocolo, usuario, senhaBruta, resto] = partes
    let senha = senhaBruta
    if (senha.startsWith('[') && senha.endsWith(']')) senha = senha.slice(1, -1)
    try {
      senha = decodeURIComponent(senha)
    } catch {}
    url = `${protocolo}${usuario}:${encodeURIComponent(senha)}@${resto}`
  }
  return url
}

export * from './schema'
