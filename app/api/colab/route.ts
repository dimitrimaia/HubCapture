import { normalizeColabLead, validateColabLead } from '@/lib/colab'
import { registrarErro } from '@/lib/auditoria'
import { salvarColab } from '@/lib/colabs'
import { toE164 } from '@/lib/phone'
import { forwardLead } from '@/lib/webhook'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 })
  }

  // Honeypot: bots preenchem o campo escondido; respondemos sucesso sem salvar.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return Response.json({ ok: true })
  }

  const lead = normalizeColabLead(body)
  const errors = validateColabLead(lead)
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  // Banco (aba Colab do painel) e planilha de influencers (cópia) em paralelo.
  const whatsapp = toE164(lead.whatsapp) ?? `+55${lead.whatsapp}`
  const [banco, planilha] = await Promise.allSettled([
    salvarColab({ nome: lead.nome, perfil: lead.perfil, seguidores: lead.seguidores, email: lead.email, whatsapp }),
    forwardLead('colab', lead),
  ])
  if (banco.status === 'rejected') await registrarErro('colab', banco.reason)
  const salvouBanco = banco.status === 'fulfilled' && banco.value !== null
  const salvouPlanilha = planilha.status === 'fulfilled' && planilha.value
  if (!salvouBanco && !salvouPlanilha) {
    return Response.json({ ok: false, error: 'Não foi possível enviar agora. Tente novamente.' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
