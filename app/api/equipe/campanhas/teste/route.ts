import { registrarAuditoria } from '@/lib/auditoria'
import { parametrosPara, type Variavel } from '@/lib/campanhas'
import { exigirSessaoApi } from '@/lib/equipe'
import { toE164 } from '@/lib/phone'
import { enviarModelo } from '@/lib/whatsapp'

/** Manda o modelo para UM número (o seu) antes de disparar para todos. */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const telefone = toE164(String(body.telefone ?? ''))
  if (!telefone || typeof body.modelo !== 'string') return Response.json({ ok: false, erro: 'Informe o modelo e um WhatsApp com DDD.' }, { status: 400 })
  const variaveis = (Array.isArray(body.variaveis) ? body.variaveis : []) as Variavel[]
  try {
    await enviarModelo(telefone, body.modelo, parametrosPara(variaveis, sessao.nome), String(body.idioma ?? 'pt_BR'))
    await registrarAuditoria('campanha_teste', sessao, { detalhe: body.modelo })
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, erro: error instanceof Error ? error.message : 'A Meta recusou o envio.' })
  }
}
