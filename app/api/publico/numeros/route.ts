import { timingSafeEqual } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { resumoLeads } from '@/lib/leads'

/**
 * Números agregados de leads para vitrines externas (ex.: dimitrimaia.com).
 * Só totais: nenhum nome, telefone ou dado pessoal sai daqui.
 * Protegido por NUMEROS_TOKEN (Authorization: Bearer <token>). Sem a variável, fica desligado.
 */
export const dynamic = 'force-dynamic'

function autorizado(req: Request) {
  const esperado = process.env.NUMEROS_TOKEN
  if (!esperado) return false
  const recebido = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  if (!process.env.NUMEROS_TOKEN) return Response.json({ erro: 'desligado' }, { status: 503 })
  if (!autorizado(req)) return Response.json({ erro: 'não autorizado' }, { status: 401 })

  const db = getDb()
  const resumo = await resumoLeads()
  if (!db || !resumo) return Response.json({ erro: 'banco indisponível' }, { status: 503 })

  // cadastros por dia (horário de Brasília), últimos 7 dias, incluindo dias sem cadastro
  const dias = await db.execute(sql`
    select to_char(d.dia, 'YYYY-MM-DD') as dia, count(l.id)::int as cadastros
    from generate_series(
      date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '6 days',
      date_trunc('day', now() at time zone 'America/Sao_Paulo'),
      interval '1 day'
    ) as d(dia)
    left join leads l on date_trunc('day', l.criado_em at time zone 'America/Sao_Paulo') = d.dia
    group by d.dia order by d.dia`)

  return Response.json(
    {
      atualizadoEm: new Date().toISOString(),
      cadastros: resumo.total,
      ultimas24h: resumo.ultimas24h,
      abriramCadastro: resumo.tocaramCadastrar,
      dias: ([...dias] as unknown as { dia: string; cadastros: number }[]).map((d) => ({ dia: d.dia, cadastros: Number(d.cadastros) })),
    },
    { headers: { 'Cache-Control': 'private, max-age=0, no-store' } },
  )
}
