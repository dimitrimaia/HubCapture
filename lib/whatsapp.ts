import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * WhatsApp Cloud API (Meta). Variáveis:
 * WHATSAPP_TOKEN (token permanente do usuário do sistema), WHATSAPP_PHONE_NUMBER_ID,
 * WHATSAPP_APP_SECRET (chave secreta do app, para validar o webhook), WHATSAPP_VERIFY_TOKEN
 * (texto que você inventa e repete no painel da Meta) e WHATSAPP_API_VERSION (padrão v23.0).
 * Passo a passo: docs/whatsapp.md.
 */

export const LIMITE_WHATSAPP = 4096

export function whatsappConfigurado() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_APP_SECRET)
}

/** Confere o cabeçalho X-Hub-Signature-256 ("sha256=<hex>") com HMAC SHA-256 do corpo cru. */
export function assinaturaValida(corpo: string, cabecalho: string | null, segredo = process.env.WHATSAPP_APP_SECRET) {
  if (!segredo || !cabecalho?.startsWith('sha256=')) return false
  const recebida = Buffer.from(cabecalho.slice('sha256='.length), 'hex')
  const esperada = createHmac('sha256', segredo).update(corpo, 'utf8').digest()
  return recebida.length === esperada.length && timingSafeEqual(recebida, esperada)
}

export type MensagemRecebida = {
  id: string
  /** Número de quem escreveu, só dígitos com DDI (ex.: 5511912345678). */
  de: string
  nome?: string
  /** null quando não é texto (áudio, imagem, figurinha…). */
  texto: string | null
  tipo: string
}

type Webhook = {
  object?: string
  entry?: {
    changes?: {
      field?: string
      value?: {
        metadata?: { phone_number_id?: string }
        contacts?: { wa_id?: string; profile?: { name?: string } }[]
        messages?: {
          id: string
          from: string
          type: string
          text?: { body?: string }
          button?: { text?: string; payload?: string }
          interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string; description?: string } }
        }[]
        statuses?: unknown[]
      }
    }[]
  }[]
}

/** Extrai as mensagens do webhook (texto, botão, interativo). Atualizações de status são ignoradas. */
export function lerMensagens(payload: unknown, phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID): MensagemRecebida[] {
  const dados = payload as Webhook
  if (dados?.object !== 'whatsapp_business_account') return []
  const mensagens: MensagemRecebida[] = []

  for (const entrada of dados.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      const valor = mudanca.value
      if (mudanca.field !== 'messages' || !valor?.messages) continue
      // Ignora eventos de outro número do mesmo app (se houver).
      if (phoneNumberId && valor.metadata?.phone_number_id && valor.metadata.phone_number_id !== phoneNumberId) continue

      for (const mensagem of valor.messages) {
        const contato = valor.contacts?.find((c) => c.wa_id === mensagem.from)
        let texto: string | null = null
        if (mensagem.type === 'text') texto = mensagem.text?.body ?? null
        else if (mensagem.type === 'button') texto = mensagem.button?.text ?? mensagem.button?.payload ?? null
        else if (mensagem.type === 'interactive') {
          const resposta = mensagem.interactive?.button_reply ?? mensagem.interactive?.list_reply
          texto = resposta?.title ?? null
        }
        mensagens.push({
          id: mensagem.id,
          de: mensagem.from.replace(/\D/g, ''),
          nome: contato?.profile?.name,
          texto: texto?.trim() || null,
          tipo: mensagem.type,
        })
      }
    }
  }
  return mensagens
}

/**
 * Markdown → formatação do WhatsApp: **negrito** vira *negrito*, sem títulos,
 * links escritos por extenso e no máximo 4096 caracteres.
 */
export function paraWhatsapp(texto: string) {
  let saida = texto
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,6}\s+(.+)$/gm, '*$1*')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, rotulo: string, url: string) =>
      rotulo.trim() === url || rotulo.trim() === url.replace(/^https?:\/\//, '') ? url : `${rotulo}: ${url}`,
    )
    .replace(/^\s*[*•]\s+/gm, '- ')
    .replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
    .replace(/__([^_\n]+)__/g, '_$1_')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (saida.length > LIMITE_WHATSAPP) {
    const corte = saida.slice(0, LIMITE_WHATSAPP - 1)
    const fim = Math.max(corte.lastIndexOf('\n'), corte.lastIndexOf(' '))
    saida = `${corte.slice(0, fim > LIMITE_WHATSAPP * 0.8 ? fim : corte.length).trimEnd()}…`
  }
  return saida
}

function endpoint() {
  const versao = process.env.WHATSAPP_API_VERSION || 'v23.0'
  // WHATSAPP_API_BASE só existe para testes locais (servidor falso); em produção fica vazio.
  const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
  return `${base}/${versao}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
}

async function chamarApi(corpo: Record<string, unknown>) {
  const resposta = await fetch(endpoint(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...corpo }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  })
  if (!resposta.ok) {
    const erro = await resposta.text().catch(() => '')
    throw new Error(`WhatsApp API ${resposta.status}: ${erro.slice(0, 400)}`)
  }
  return resposta.json()
}

/** Envia texto (dentro da janela de 24 h aberta pela pessoa, sem custo). */
export function enviarTexto(para: string, texto: string) {
  return chamarApi({
    recipient_type: 'individual',
    to: para.replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: true, body: paraWhatsapp(texto) },
  })
}

/** Marca a mensagem como lida e mostra "digitando…" enquanto a resposta é gerada (até 25 s). */
export function marcarComoLida(mensagemId: string) {
  return chamarApi({ status: 'read', message_id: mensagemId, typing_indicator: { type: 'text' } })
}

/**
 * Envia um MODELO aprovado pela Meta (a única forma de a empresa escrever primeiro, fora da
 * janela de 24 h). É PAGO por mensagem entregue: ver docs/bots-whatsapp.md.
 * `parametros` preenche {{1}}, {{2}}… do corpo do modelo, na ordem.
 */
export async function enviarModelo(para: string, modelo: string, parametros: string[] = [], idioma = 'pt_BR') {
  const resposta = (await chamarApi({
    recipient_type: 'individual',
    to: para.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: modelo,
      language: { code: idioma },
      ...(parametros.length ? { components: [{ type: 'body', parameters: parametros.map((text) => ({ type: 'text', text })) }] } : {}),
    },
  })) as { messages?: { id?: string }[] }
  return resposta.messages?.[0]?.id ?? null
}

/** "SAIR", "parar", "stop"… = a pessoa não quer mais mensagens automáticas. */
export function pediuParaSair(texto: string) {
  return /^\s*(sair|parar|pare|stop|cancelar|descadastrar|remover)\s*[.!]*\s*$/i.test(texto)
}

/* ───────────── Campanhas: modelos aprovados e status de entrega ───────────── */

export type ModeloMeta = {
  nome: string
  idioma: string
  categoria: string
  /** Texto do corpo, com {{1}}, {{2}}… */
  texto: string
  variaveis: number
  /** Modelos com cabeçalho de mídia ou botões dinâmicos ainda não são suportados no disparo. */
  suportado: boolean
}

/**
 * Lista os modelos APROVADOS da conta do WhatsApp Business (precisa de WHATSAPP_WABA_ID:
 * Meta → WhatsApp Manager → Visão geral da conta → ID da conta).
 */
export async function listarModelosAprovados(): Promise<ModeloMeta[]> {
  const waba = process.env.WHATSAPP_WABA_ID
  if (!waba || !process.env.WHATSAPP_TOKEN) throw new Error('Configure WHATSAPP_WABA_ID e WHATSAPP_TOKEN na Vercel.')
  const versao = process.env.WHATSAPP_API_VERSION || 'v23.0'
  const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
  const url = `${base}/${versao}/${waba}/message_templates?status=APPROVED&limit=200&fields=name,language,category,components`
  const resposta = await fetch(url, { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) })
  if (!resposta.ok) throw new Error(`WhatsApp API ${resposta.status}: ${(await resposta.text().catch(() => '')).slice(0, 300)}`)
  const dados = (await resposta.json()) as {
    data?: { name: string; language: string; category: string; components?: { type: string; text?: string; format?: string; buttons?: { type: string; url?: string }[] }[] }[]
  }
  return (dados.data ?? []).map((m) => {
    const corpo = m.components?.find((c) => c.type === 'BODY')?.text ?? ''
    const cabecalho = m.components?.find((c) => c.type === 'HEADER')
    const botoes = m.components?.find((c) => c.type === 'BUTTONS')?.buttons ?? []
    const variaveis = new Set(corpo.match(/\{\{\d+\}\}/g) ?? []).size
    const cabecalhoVariavel = Boolean(cabecalho && (cabecalho.format !== 'TEXT' || /\{\{\d+\}\}/.test(cabecalho.text ?? '')))
    const botaoVariavel = botoes.some((b) => b.type === 'URL' && /\{\{\d+\}\}/.test(b.url ?? ''))
    return { nome: m.name, idioma: m.language, categoria: m.category, texto: corpo, variaveis, suportado: !cabecalhoVariavel && !botaoVariavel }
  })
}

export type StatusEntrega = { wamid: string; status: 'sent' | 'delivered' | 'read' | 'failed'; erro?: string }

/** Atualizações de status do webhook (enviada, entregue, lida, falhou), para acompanhar campanhas. */
export function lerStatuses(payload: unknown): StatusEntrega[] {
  const dados = payload as { object?: string; entry?: { changes?: { field?: string; value?: { statuses?: unknown[] } }[] }[] }
  if (dados?.object !== 'whatsapp_business_account') return []
  const lista: StatusEntrega[] = []
  for (const entrada of dados.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      for (const s of (mudanca.value?.statuses ?? []) as { id?: string; status?: string; errors?: { title?: string; message?: string; code?: number }[] }[]) {
        if (!s.id || !['sent', 'delivered', 'read', 'failed'].includes(s.status ?? '')) continue
        const e = s.errors?.[0]
        lista.push({
          wamid: s.id,
          status: s.status as StatusEntrega['status'],
          ...(e ? { erro: `${e.code ?? ''} ${e.title ?? e.message ?? ''}`.trim().slice(0, 300) } : {}),
        })
      }
    }
  }
  return lista
}
