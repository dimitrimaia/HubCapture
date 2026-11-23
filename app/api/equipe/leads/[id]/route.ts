import { registrarAuditoria } from '@/lib/auditoria'
import { exigirSessaoApi } from '@/lib/equipe'
import { excluirLead } from '@/lib/leads'

/** Remove um cadastro (só administrador). Usado na tela de duplicados. */
export async function DELETE(request: Request, ctx: RouteContext<'/api/equipe/leads/[id]'>) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const removido = await excluirLead(id).catch(() => null)
  if (!removido) return Response.json({ ok: false, erro: 'Cadastro não encontrado.' }, { status: 404 })
  // Auditoria sem o número completo (LGPD): só nome e final do telefone.
  await registrarAuditoria('lead_excluido', sessao, { detalhe: `${removido.nome} (…${removido.whatsapp.slice(-4)})` })
  return Response.json({ ok: true })
}
