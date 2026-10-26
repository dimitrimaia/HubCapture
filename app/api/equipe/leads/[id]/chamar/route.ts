import { exigirSessaoApi } from '@/lib/equipe'
import { marcarChamado } from '@/lib/leads'
import { forwardLead } from '@/lib/webhook'

export async function POST(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]/chamar'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))
  const modelo = typeof body.modelo === 'string' && /^[a-z0-9-]{1,40}$/i.test(body.modelo) ? body.modelo : 'outro'

  const lead = await marcarChamado(id, sessao.nome, modelo).catch((error) => {
    console.error('[equipe] Falha ao marcar chamado:', error)
    return null
  })
  if (!lead) return Response.json({ ok: false }, { status: 404 })

  // Cópia na aba "Acoes" da planilha: quem chamou e quando.
  await forwardLead('acao', { whatsapp: lead.whatsapp.replace(/^\+55/, ''), nome: lead.nome, acao: `chamado:${modelo}`, por: sessao.nome })
  return Response.json({ ok: true })
}
