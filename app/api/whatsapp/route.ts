import { after } from 'next/server'
import { registrarErro } from '@/lib/auditoria'
import { AssistenteIndisponivel, gerarResposta, limparHistorico } from '@/lib/assistente'
import { marcarRespondeuWhatsapp } from '@/lib/leads'
import { variantesE164 } from '@/lib/phone'
import { SIGNUP_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { marcarOptOut } from '@/lib/lembretes'
import { assinaturaValida, enviarTexto, lerMensagens, marcarComoLida, type MensagemRecebida, pediuParaSair, whatsappConfigurado } from '@/lib/whatsapp'
import { carregarConversa, mensagemNova, salvarConversa } from '@/lib/whatsapp-memoria'

export const maxDuration = 60

const SAIU = 'Pronto, você não vai mais receber mensagens automáticas do Hub Capture. Se mudar de ideia ou tiver dúvidas, é só escrever aqui.'
const SO_TEXTO = 'Por enquanto só consigo ler mensagens de texto 🙂 Pode escrever sua dúvida?'
const SEM_ASSISTENTE = `Recebi sua mensagem! Agora não consigo responder automaticamente. Enquanto isso, você pode criar sua conta com o código VEMHUB: ${SIGNUP_URL} ou tirar dúvidas na comunidade: ${WHATSAPP_COMMUNITY_URL}`

/** Verificação do webhook pela Meta: devolve hub.challenge se o hub.verify_token bater. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const token = process.env.WHATSAPP_VERIFY_TOKEN
  if (params.get('hub.mode') === 'subscribe' && token && params.get('hub.verify_token') === token) {
    return new Response(params.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

/** Mensagens recebidas: confere a assinatura, responde 200 na hora e gera a resposta depois (after). */
export async function POST(request: Request) {
  const corpo = await request.text()
  if (!assinaturaValida(corpo, request.headers.get('x-hub-signature-256'))) {
    return new Response('Assinatura inválida', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(corpo)
  } catch {
    return new Response(null, { status: 400 })
  }

  const mensagens = lerMensagens(payload)
  if (mensagens.length > 0) {
    // A Meta espera 200 rápido; se demorar, ela reenvia. A resposta é gerada depois.
    after(async () => {
      for (const mensagem of mensagens) {
        try {
          await atender(mensagem)
        } catch (error) {
          await registrarErro('whatsapp', error)
        }
      }
    })
  }
  return new Response(null, { status: 200 })
}

async function atender(mensagem: MensagemRecebida) {
  if (!(await mensagemNova(mensagem.id))) return // reenvio da Meta: já respondemos
  if (!whatsappConfigurado()) {
    console.warn('[whatsapp] Mensagem recebida, mas WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID não estão configurados.')
    return
  }

  await marcarComoLida(mensagem.id).catch((error) => console.warn('[whatsapp] marcar como lida:', error))
  await marcarRespondeuWhatsapp(variantesE164(mensagem.de)).catch((error) => console.warn('[whatsapp] lead:', error))

  if (!mensagem.texto) {
    await enviarTexto(mensagem.de, SO_TEXTO)
    return
  }

  if (pediuParaSair(mensagem.texto)) {
    await marcarOptOut(variantesE164(mensagem.de)).catch((error) => console.warn('[whatsapp] opt-out:', error))
    await enviarTexto(mensagem.de, SAIU)
    return
  }

  const historico = limparHistorico([...(await carregarConversa(mensagem.de)), { role: 'user', content: mensagem.texto }])
  let resposta: string
  try {
    resposta = await gerarResposta(historico, 'whatsapp')
  } catch (error) {
    if (!(error instanceof AssistenteIndisponivel)) throw error
    console.error('[whatsapp] Assistente indisponível:', error.message)
    resposta = SEM_ASSISTENTE
  }

  await enviarTexto(mensagem.de, resposta)
  await salvarConversa(mensagem.de, [...historico, { role: 'assistant', content: resposta }])
}
