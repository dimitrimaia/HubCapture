import { LEAD_ACOES, type LeadAcao, registrarAcao } from '@/lib/leads'
import { toE164 } from '@/lib/phone'
import { forwardLead } from '@/lib/webhook'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Recebe o navigator.sendBeacon da tela de próximo passo do cadastro:
 * { id?, whatsapp?, nome?, acao: 'cadastrar' | 'whatsapp' | 'comunidade' }.
 * O sendBeacon manda o corpo como texto, por isso lemos text() e não json().
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = JSON.parse(await request.text())
  } catch {
    return new Response(null, { status: 400 })
  }

  const acao = body.acao as LeadAcao
  if (!LEAD_ACOES.includes(acao)) return new Response(null, { status: 400 })

  const id = typeof body.id === 'string' && UUID.test(body.id) ? body.id : null
  const lead = id
    ? await registrarAcao(id, acao).catch((error) => {
        console.error('[leads] Falha ao registrar a ação:', error)
        return null
      })
    : null
  const whatsapp = lead ? lead.whatsapp : typeof body.whatsapp === 'string' ? toE164(body.whatsapp) : null

  if (whatsapp) {
    await forwardLead('acao', {
      whatsapp: whatsapp.replace(/^\+55/, ''),
      nome: typeof body.nome === 'string' ? body.nome.slice(0, 120) : '',
      acao,
    })
  }
  return new Response(null, { status: 204 })
}
