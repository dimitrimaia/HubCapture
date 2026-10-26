import { normalizeCadastroLead, validateCadastroLead } from '@/lib/cadastro'
import { registrarErro } from '@/lib/auditoria'
import { salvarLead } from '@/lib/leads'
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

  const lead = normalizeCadastroLead(body)
  const errors = validateCadastroLead(lead)
  const whatsapp = toE164(lead.whatsapp)
  if (!whatsapp) errors.whatsapp ??= 'Informe o WhatsApp com DDD.'
  if (Object.keys(errors).length > 0 || !whatsapp) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  // Banco (painel da equipe) e planilha (cópia de segurança) em paralelo.
  const [banco, planilha] = await Promise.allSettled([salvarLead({ nome: lead.nome, whatsapp, consentimento: lead.consentimento, rastreio: lead.rastreio }),
    forwardLead('cadastro', {
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      consentimento: lead.consentimento,
      utm_source: lead.rastreio?.utmSource ?? '',
      utm_medium: lead.rastreio?.utmMedium ?? '',
      utm_campaign: lead.rastreio?.utmCampaign ?? '',
      ref: lead.rastreio?.ref ?? '',
    }),
  ])
  if (banco.status === 'rejected') await registrarErro('cadastro', banco.reason)
  const id = banco.status === 'fulfilled' ? banco.value : null
  const salvouPlanilha = planilha.status === 'fulfilled' && planilha.value

  if (!id && !salvouPlanilha) {
    return Response.json({ ok: false, error: 'Não foi possível enviar agora. Tente novamente.' }, { status: 502 })
  }
  return Response.json({ ok: true, id })
}
