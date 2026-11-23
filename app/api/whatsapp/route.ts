import { after } from 'next/server'
import { registrarErro } from '@/lib/auditoria'
import { AssistenteIndisponivel, gerarResposta, limparHistorico } from '@/lib/assistente'
import { AVISO_HUMANO, pediuHumano, pedirHumano, registrarDoCliente, registrarMensagem } from '@/lib/atendimento'
import { marcarRespondeuWhatsapp } from '@/lib/leads'
import { variantesE164 } from '@/lib/phone'
import { SIGNUP_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { aplicarStatuses } from '@/lib/campanhas'
import { marcarOptOut } from '@/lib/lembretes'
import { assinaturaValida, baixarMidia, enviarTexto, lerMensagens, lerStatuses, marcarComoLida, type MensagemRecebida, pediuParaSair, whatsappConfigurado } from '@/lib/whatsapp'
import { carregarConversa, mensagemNova, salvarConversa } from '@/lib/whatsapp-memoria'

export const maxDuration = 60

const SAIU = 'Pronto, você não vai mais receber mensagens automáticas do Hub Capture. Se mudar de ideia ou tiver dúvidas, é só escrever aqui.'
const SO_TEXTO = 'Por enquanto só consigo ler mensagens de texto 🙂 Pode escrever sua dúvida?'
const SEM_ASSISTENTE = `Recebi sua mensagem! Agora não consigo responder automaticamente. Enquanto isso, você pode criar sua conta com o código VEMHUB: ${SIGNUP_URL} ou tirar dúvidas na comunidade: ${WHATSAPP_COMMUNITY_URL}`

/** Verificação do webhook pela Meta: devolve hub.challenge se o hub.verify_token bater. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  // trim: espaço ou quebra de linha colados sem querer na Vercel/Meta fazem a verificação falhar.
  const token = process.env.WHATSAPP_VERIFY_TOKEN?.trim()
  if (params.get('hub.mode') === 'subscribe' && token && params.get('hub.verify_token')?.trim() === token) {
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

  // Status de entrega das campanhas (enviada, entregue, lida, falhou).
  const statuses = lerStatuses(payload)
  if (statuses.length > 0) after(() => aplicarStatuses(statuses).catch((error) => registrarErro('campanhas', error)))

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

/** Envia e guarda na central de atendimento o que o assistente respondeu. */
async function responderComoBot(para: string, texto: string, atendimentoId: string | null) {
  const resposta = (await enviarTexto(para, texto)) as { messages?: { id?: string }[] } | undefined
  // Guarda o wamid para mostrar os vistos (entregue/lida) no painel.
  if (atendimentoId) await registrarMensagem(atendimentoId, 'bot', texto, { wamid: resposta?.messages?.[0]?.id }).catch(() => null)
}

const NOME_TIPO: Record<string, string> = { audio: 'áudio', image: 'imagem', video: 'vídeo', document: 'documento', sticker: 'figurinha' }

/** O que aparece na conversa do painel: a legenda/texto, ou o tipo entre colchetes. */
function textoParaPainel(mensagem: MensagemRecebida) {
  const tipo = NOME_TIPO[mensagem.tipo] ?? mensagem.tipo
  if (!mensagem.midia) return mensagem.texto ?? `[${tipo}]`
  const extra = mensagem.midia.legenda ?? mensagem.midia.arquivo ?? ''
  return extra ? `[${tipo}] ${extra}` : `[${tipo}]`
}

/** Baixa a foto da Meta para a IA ler (até 4 MB, só imagens). null se não der: a conversa segue sem ela. */
async function imagemParaIa(mediaId: string) {
  try {
    const arquivo = await baixarMidia(mediaId)
    if (!arquivo || !/^image\/(jpeg|png|webp|heic|heif)$/.test(arquivo.tipo)) return null
    const bytes = Buffer.from(await new Response(arquivo.corpo).arrayBuffer())
    if (bytes.length === 0 || bytes.length > 4 * 1024 * 1024) return null
    return { mime: arquivo.tipo, base64: bytes.toString('base64') }
  } catch (error) {
    console.warn('[whatsapp] imagem para a IA:', error)
    return null
  }
}

async function atender(mensagem: MensagemRecebida) {
  if (!(await mensagemNova(mensagem.id))) return // reenvio da Meta: já respondemos
  if (!whatsappConfigurado()) {
    console.warn('[whatsapp] Mensagem recebida, mas WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID não estão configurados.')
    return
  }

  await marcarRespondeuWhatsapp(variantesE164(mensagem.de)).catch((error) => console.warn('[whatsapp] lead:', error))

  // Central de atendimento: toda mensagem fica guardada (texto ou o tipo: áudio, imagem…).
  const atendimento = await registrarDoCliente({
    canal: 'whatsapp',
    contato: mensagem.de,
    nome: mensagem.nome,
    texto: textoParaPainel(mensagem),
    chave: mensagem.midia ? `midia:${mensagem.tipo}:${mensagem.midia.id}` : undefined,
  }).catch(async (error) => {
    await registrarErro('atendimento', error)
    return null
  })
  const id = atendimento?.id ?? null

  if (mensagem.texto && pediuParaSair(mensagem.texto)) {
    await marcarOptOut(variantesE164(mensagem.de)).catch((error) => console.warn('[whatsapp] opt-out:', error))
    await responderComoBot(mensagem.de, SAIU, id)
    return
  }

  // Uma pessoa da equipe está cuidando (ou vai cuidar): o assistente fica quieto.
  if (atendimento && (atendimento.status === 'aguardando' || atendimento.status === 'humano')) return

  await marcarComoLida(mensagem.id).catch((error) => console.warn('[whatsapp] marcar como lida:', error))

  // Foto/print: a IA lê a imagem (Gemini). Áudio, vídeo e documento ainda não.
  const imagem = mensagem.tipo === 'image' && mensagem.midia ? await imagemParaIa(mensagem.midia.id) : null
  if (!mensagem.texto && !imagem) {
    await responderComoBot(mensagem.de, SO_TEXTO, id)
    return
  }
  const textoDaPessoa = imagem
    ? `[Enviou uma imagem] ${mensagem.texto ?? 'Sem texto. Veja o que a imagem mostra e ajude.'}`
    : (mensagem.texto as string)

  if (atendimento && mensagem.texto && pediuHumano(mensagem.texto)) {
    await pedirHumano(atendimento.id)
    await responderComoBot(mensagem.de, AVISO_HUMANO, id)
    return
  }

  const historico = limparHistorico([...(await carregarConversa(mensagem.de)), { role: 'user', content: textoDaPessoa }])
  let resposta: string
  try {
    resposta = await gerarResposta(historico, 'whatsapp', imagem ?? undefined)
  } catch (error) {
    if (!(error instanceof AssistenteIndisponivel)) throw error
    console.error('[whatsapp] Assistente indisponível:', error.message)
    resposta = SEM_ASSISTENTE
  }

  await responderComoBot(mensagem.de, resposta, id)
  await salvarConversa(mensagem.de, [...historico, { role: 'assistant', content: resposta }])
}
