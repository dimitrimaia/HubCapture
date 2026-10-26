import 'server-only'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db'

/**
 * Funil da aba Resultados. Conta por COORTE: os cadastros de cada semana e quantos deles já foram
 * chamados, responderam e converteram (até hoje). Semanas começam na segunda, horário de Brasília.
 */

export const PERIODOS_RESULTADOS = [4, 12, 26] as const
export type SemanasResultados = (typeof PERIODOS_RESULTADOS)[number]

export type Etapas = { cadastros: number; chamados: number; responderam: number; convertidos: number }
export type Semana = Etapas & { semana: string }
export type Recorte = { chave: string; contatos: number; chamadas: number; responderam: number; convertidos: number }
export type Origem = Etapas & { origem: string }

export type Resultados = {
  semanas: Semana[]
  total: Etapas
  atendentes: Recorte[]
  mensagens: Recorte[]
  origens: Origem[]
}

export function lerSemanas(valor: string | undefined): SemanasResultados {
  const n = Number(valor)
  return (PERIODOS_RESULTADOS as readonly number[]).includes(n) ? (n as SemanasResultados) : 12
}

const n = (v: unknown) => Number(v ?? 0)

/** Segundas-feiras (AAAA-MM-DD) das últimas `quantas` semanas, da mais antiga para a atual. */
export function segundasFeiras(hoje: Date, quantas: number) {
  const sp = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const dia = (sp.getDay() + 6) % 7
  const segunda = new Date(Date.UTC(sp.getFullYear(), sp.getMonth(), sp.getDate() - dia))
  return Array.from({ length: quantas }, (_, i) => {
    const d = new Date(segunda)
    d.setUTCDate(d.getUTCDate() - 7 * (quantas - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

export async function resultados(semanas: SemanasResultados): Promise<Resultados | null> {
  const db = getDb()
  if (!db) return null
  const desde = sql.raw(`date_trunc('week', now() at time zone 'America/Sao_Paulo') - interval '${semanas - 1} weeks'`)
  const coorte = sql`(${desde}) at time zone 'America/Sao_Paulo'`

  const [porSemana, porAtendente, porMensagem, porOrigem] = await Promise.all([
    db.execute(sql`
      select to_char(date_trunc('week', criado_em at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD') as semana,
        count(*) as cadastros,
        count(*) filter (where chamadas > 0) as chamados,
        count(*) filter (where respondeu_whatsapp_em is not null) as responderam,
        count(*) filter (where convertido_em is not null) as convertidos
      from leads where criado_em >= ${coorte}
      group by 1 order by 1`),
    ...(['por', 'detalhe'] as const).map((coluna) =>
      db.execute(sql`
        select coalesce(e.${sql.raw(coluna)}, '—') as chave,
          count(*) as chamadas,
          count(distinct e.lead_id) as contatos,
          count(distinct e.lead_id) filter (where l.respondeu_whatsapp_em > e.criado_em) as responderam,
          count(distinct e.lead_id) filter (where l.convertido_em is not null) as convertidos
        from lead_eventos e join leads l on l.id = e.lead_id
        where e.tipo = 'chamado' and e.criado_em >= ${coorte}
        group by 1 order by contatos desc limit 20`),
    ),
    db.execute(sql`
      select case when ref is not null then 'ref: ' || ref
                  when utm_source is not null then utm_source
                  when origem = 'site' then 'site (direto)'
                  else origem end as origem,
        count(*) as cadastros,
        count(*) filter (where chamadas > 0) as chamados,
        count(*) filter (where respondeu_whatsapp_em is not null) as responderam,
        count(*) filter (where convertido_em is not null) as convertidos
      from leads where criado_em >= ${coorte}
      group by 1 order by cadastros desc limit 20`),
  ])

  const mapa = new Map([...porSemana].map((linha) => [String(linha.semana), linha]))
  const lista: Semana[] = segundasFeiras(new Date(), semanas).map((semana) => {
    const linha = mapa.get(semana)
    return { semana, cadastros: n(linha?.cadastros), chamados: n(linha?.chamados), responderam: n(linha?.responderam), convertidos: n(linha?.convertidos) }
  })
  const total = lista.reduce<Etapas>(
    (t, s) => ({ cadastros: t.cadastros + s.cadastros, chamados: t.chamados + s.chamados, responderam: t.responderam + s.responderam, convertidos: t.convertidos + s.convertidos }),
    { cadastros: 0, chamados: 0, responderam: 0, convertidos: 0 },
  )
  const recorte = (linhas: Iterable<Record<string, unknown>>): Recorte[] =>
    [...linhas].map((l) => ({ chave: String(l.chave), contatos: n(l.contatos), chamadas: n(l.chamadas), responderam: n(l.responderam), convertidos: n(l.convertidos) }))

  return {
    semanas: lista,
    total,
    atendentes: recorte(porAtendente),
    mensagens: recorte(porMensagem),
    origens: [...porOrigem].map((l) => ({
      origem: String(l.origem),
      cadastros: n(l.cadastros),
      chamados: n(l.chamados),
      responderam: n(l.responderam),
      convertidos: n(l.convertidos),
    })),
  }
}
