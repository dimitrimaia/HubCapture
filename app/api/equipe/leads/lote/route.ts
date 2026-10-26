import { registrarAuditoria } from '@/lib/auditoria'
import { exigirSessaoApi } from '@/lib/equipe'
import { acaoEmLote } from '@/lib/leads'

const ACOES = ['convertido', 'nao-convertido', 'invalido', 'valido'] as const
const UUID = /^[0-9a-f-]{36}$/i

export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const acao = ACOES.find((a) => a === body.acao)
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === 'string' && UUID.test(id)) : []
  if (!acao || ids.length === 0) return Response.json({ ok: false }, { status: 400 })
  const total = await acaoEmLote(ids, acao, sessao.nome)
  await registrarAuditoria('leads_lote', sessao, { detalhe: `${acao}: ${total}` })
  return Response.json({ ok: true, total })
}
