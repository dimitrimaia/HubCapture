import { codigoVisitanteValido, hashVisitante, novasParaVisitante } from '@/lib/atendimento'
import { ipDoPedido } from '@/lib/ip'
import { criarLimite } from '@/lib/limite'

// O chat aberto pergunta a cada poucos segundos se a equipe respondeu.
const permitir = criarLimite({ maximo: 300, janelaMs: 10 * 60 * 1000 })

/** Respostas da equipe para este visitante desde `depois` (ISO). Só quem tem o código secreto lê. */
export async function GET(request: Request) {
  if (!permitir(ipDoPedido(request.headers))) return Response.json({ ok: false }, { status: 429 })
  const params = new URL(request.url).searchParams
  const visitante = params.get('visitante')
  if (!codigoVisitanteValido(visitante)) return Response.json({ ok: false }, { status: 400 })
  const depois = new Date(params.get('depois') ?? 0)
  const dados = await novasParaVisitante(hashVisitante(visitante), Number.isNaN(depois.getTime()) ? new Date(0) : depois).catch(() => null)
  if (!dados) return Response.json({ ok: true, status: 'bot', mensagens: [] }, { headers: { 'Cache-Control': 'no-store' } })
  return Response.json(
    { ok: true, ...dados, mensagens: dados.mensagens.map((m) => ({ id: m.id, autorNome: m.autorNome, texto: m.texto, em: m.criadoEm.toISOString() })) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
