import 'server-only'
import {
  APP_STORE_URL,
  faqs,
  HUBCAP_URL,
  INSTAGRAM_URL,
  PLAY_STORE_URL,
  REFERRAL_CODE,
  SIGNUP_URL,
  SITE_URL,
  WHATSAPP_COMMUNITY_URL,
} from './site'
import { tutorialSteps } from './tutorials'

/**
 * Assistente do Hub Capture (chat do site e atendimento no WhatsApp), com o Gemini pela API REST.
 * Variáveis: GEMINI_API_KEY (obrigatória; também aceita GOOGLE_GENERATIVE_AI_API_KEY ou GOOGLE_API_KEY)
 * e ASSISTENTE_MODELO (opcional; sem ela, tenta MODELOS_PADRAO em ordem).
 * Guia e limites do nível gratuito: docs/assistente.md.
 */

export type MensagemChat = { role: 'user' | 'assistant'; content: string }
export type Canal = 'site' | 'whatsapp'

export const LIMITE_MENSAGENS = 20
export const LIMITE_CARACTERES = 1000

/**
 * Modelos tentados em ordem quando o Google responde 404 (modelo desligado ou indisponível para a chave).
 * O gemini-2.5-flash foi desligado em 16/10/2026; "gemini-flash-latest" é o apelido do Google que
 * sempre aponta para o Flash mais novo. O primeiro que funcionar fica guardado até a instância reiniciar.
 */
const MODELOS_PADRAO = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite']
const TIMEOUT_MS = 25000

export class AssistenteIndisponivel extends Error {}

const NOMES_CHAVE = ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY'] as const

/** Qual variável tem a chave (a integração da Vercel com o Google cria GOOGLE_GENERATIVE_AI_API_KEY). */
export function variavelDaChave() {
  return NOMES_CHAVE.find((nome) => process.env[nome]?.trim()) ?? null
}

export function assistenteConfigurado() {
  return variavelDaChave() !== null
}

let modeloQueFunciona: string | null = null

function modelosParaTentar() {
  const escolhido = process.env.ASSISTENTE_MODELO?.trim()
  const lista = [modeloQueFunciona, escolhido, ...MODELOS_PADRAO].filter((m): m is string => Boolean(m))
  return [...new Set(lista)]
}

function conhecimento() {
  const perguntas = faqs.map((faq) => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n')
  const passos = tutorialSteps.map((passo, i) => `${i + 1}. ${passo.title}: ${passo.description}`).join('\n')
  return `## Perguntas frequentes\n${perguntas}\n\n## Tutorial passo a passo\n${passos}\n\n## Links oficiais
- Cadastro com o código ${REFERRAL_CODE} (já aplicado): ${SIGNUP_URL}
- App Hub Capture no Google Play (Android): ${PLAY_STORE_URL}
- App Hub Capture na App Store (iPhone): ${APP_STORE_URL}
- Suporte Oficial HubCap (boné com suporte para celular, pago, chega mais rápido que o Starter Kit): ${HUBCAP_URL}
- Comunidade do Hub Capture no WhatsApp: ${WHATSAPP_COMMUNITY_URL}
- Instagram: ${INSTAGRAM_URL}
- Tutoriais em vídeo: ${SITE_URL}/tutoriais`
}

function instrucoes(canal: Canal) {
  const formato =
    canal === 'whatsapp'
      ? 'Você responde pelo WhatsApp: mensagens curtas (até 3 parágrafos), sem títulos nem tabelas; links escritos por extenso.'
      : 'Você responde no chat do site: respostas curtas (até 3 parágrafos ou uma lista curta), em markdown simples (negrito, listas e links no formato [texto](url)).'

  return `Você é o assistente do site Hub Capture (hubcapture.app), um site de divulgação do programa da Hub (Hub Data) com o código de convite ${REFERRAL_CODE}. Fale sempre em português do Brasil, com tom simpático e direto.

${formato}

Regras obrigatórias:
1. Use SOMENTE as informações da seção "Conhecimento" abaixo. Se a resposta não estiver lá, diga que não tem essa informação e sugira a comunidade do WhatsApp (${WHATSAPP_COMMUNITY_URL}).
2. Você NÃO fala em nome da Hub Data e não é suporte oficial da Hub. Se perguntarem, explique que é o assistente do site de divulgação Hub Capture.
3. Não prometa valores, ganhos, prazos de pagamento, de entrega do kit ou de aprovação. Ao citar valores, deixe claro que são máximos ("até"), variam por tarefa e não são garantidos.
4. Sempre que fizer sentido (cadastro, como começar, como ganhar), inclua o link de cadastro com o código ${REFERRAL_CODE}: ${SIGNUP_URL}
5. NUNCA peça senha, código de verificação, dados bancários, chave PIX, documentos ou dados pessoais. Se a pessoa oferecer, diga para não compartilhar.
6. Fora do assunto (Hub Capture, Hub Data, Minute, cadastro, gravações, pagamentos, kit/HubCap, comunidade), recuse com gentileza e volte ao tema.
7. Não invente links: use apenas os da lista de links oficiais.

## Conhecimento
${conhecimento()}`
}

/** Limpa o histórico vindo do navegador ou da memória: papéis válidos, tamanhos limitados, começa pela pessoa. */
export function limparHistorico(entrada: unknown): MensagemChat[] {
  if (!Array.isArray(entrada)) return []
  const validas = entrada
    .filter(
      (item): item is MensagemChat =>
        Boolean(item) &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        item.content.trim().length > 0,
    )
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, LIMITE_CARACTERES) }))
    .slice(-LIMITE_MENSAGENS)
  const inicio = validas.findIndex((item) => item.role === 'user')
  return inicio === -1 ? [] : validas.slice(inicio)
}

export type Diagnostico = { ok: boolean; modelo: string | null; status?: number; erro?: string }

/** Gera a resposta do assistente. Lança AssistenteIndisponivel sem chave ou se o Gemini falhar. */
export async function gerarResposta(historico: MensagemChat[], canal: Canal): Promise<string> {
  const resultado = await chamarGemini(historico, canal)
  if (!resultado.ok) throw new AssistenteIndisponivel(`Gemini (${resultado.modelo ?? 'sem modelo'}): ${resultado.erro}`)
  return resultado.texto
}

/** Teste rápido para o painel da equipe: mostra o erro real do Google, se houver. */
export async function testarAssistente(): Promise<Diagnostico> {
  const resultado = await chamarGemini([{ role: 'user', content: 'Responda só: ok' }], 'site')
  return resultado.ok ? { ok: true, modelo: resultado.modelo } : resultado
}

type Resultado = { ok: true; texto: string; modelo: string } | { ok: false; modelo: string | null; status?: number; erro: string }

async function chamarGemini(historico: MensagemChat[], canal: Canal): Promise<Resultado> {
  const nome = variavelDaChave()
  if (!nome) return { ok: false, modelo: null, erro: 'Nenhuma chave configurada (GEMINI_API_KEY) nesta implantação.' }
  const chave = process.env[nome]!.trim()

  // ASSISTENTE_API_BASE só existe para testes locais (servidor falso); em produção fica vazio.
  const base = process.env.ASSISTENTE_API_BASE || 'https://generativelanguage.googleapis.com'
  const corpo = JSON.stringify({
    systemInstruction: { parts: [{ text: instrucoes(canal) }] },
    contents: historico.map((mensagem) => ({
      role: mensagem.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: mensagem.content }],
    })),
    // Sem thinkingConfig: os modelos 3.x recusam o formato antigo. O limite é folgado porque o
    // "raciocínio" interno desses modelos também conta nos tokens de saída.
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  })

  let ultimo: Resultado = { ok: false, modelo: null, erro: 'Nenhum modelo disponível.' }
  for (const modelo of modelosParaTentar()) {
    let resposta: Response
    try {
      resposta = await fetch(`${base}/v1beta/models/${encodeURIComponent(modelo)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
        body: corpo,
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (error) {
      return { ok: false, modelo, erro: `Falha de rede com o Gemini: ${String(error)}` }
    }

    const dados = await resposta.json().catch(() => null)
    if (!resposta.ok) {
      const mensagem = String(dados?.error?.message ?? JSON.stringify(dados)).slice(0, 300)
      ultimo = { ok: false, modelo, status: resposta.status, erro: mensagem }
      // 404 = modelo desligado/indisponível: tenta o próximo. Outros erros (chave, cota) valem para todos.
      if (resposta.status === 404) continue
      return ultimo
    }

    modeloQueFunciona = modelo
    const texto: string = (dados?.candidates?.[0]?.content?.parts ?? [])
      .filter((parte: { thought?: boolean }) => !parte.thought)
      .map((parte: { text?: string }) => parte.text ?? '')
      .join('')
      .trim()
    return {
      ok: true,
      modelo,
      texto:
        texto ||
        `Não consegui responder isso agora. Se quiser, fale com a gente na comunidade do WhatsApp: ${WHATSAPP_COMMUNITY_URL}`,
    }
  }
  return ultimo
}
