import { normalizeCadastroLead, validateCadastroLead } from '@/lib/cadastro'
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
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  if (!(await forwardLead('cadastro', lead))) {
    return Response.json({ ok: false, error: 'Não foi possível enviar agora. Tente novamente.' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
