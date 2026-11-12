import 'server-only'
import {
  APP_STORE_URL,
  HUBCAP_URL,
  INSTAGRAM_URL,
  PLAY_STORE_URL,
  REFERRAL_CODE,
  SIGNUP_URL,
  SITE_URL,
  WHATSAPP_COMMUNITY_URL,
} from './site'
import { obterConfig } from './configuracoes'
import { normalizarPergunta, respostaPronta } from './respostas-prontas'
import type { Pergunta } from './conteudo'
import type { TutorialStep } from './tutorials'

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

function conhecimento(faqs: Pergunta[], tutorialSteps: TutorialStep[]) {
  const perguntas = faqs.map((faq) => `P: ${faq.question}\nR: ${faq.answer}`).join('\n\n')
  const passos = tutorialSteps.map((passo, i) => `${i + 1}. ${passo.title}: ${passo.description}`).join('\n')
  return `## Perguntas frequentes\n${perguntas}\n\n## Tutorial passo a passo\n${passos}\n\n## Links oficiais
- Cadastro com o código ${REFERRAL_CODE} (já aplicado): ${SIGNUP_URL}
- Site Hub Capture (guias, tutoriais e perguntas frequentes): https://hubcapture.app
- App Hub Capture no Google Play (Android): ${PLAY_STORE_URL}
- App Hub Capture na App Store (iPhone): ${APP_STORE_URL}
- Suporte HubCap (boné com suporte para celular, pago, chega mais rápido que o Starter Kit): ${HUBCAP_URL}
- Comunidade do Hub Capture no WhatsApp: ${WHATSAPP_COMMUNITY_URL}
- Instagram: ${INSTAGRAM_URL}
- Tutoriais em vídeo: ${SITE_URL}/tutoriais`
}

function instrucoes(canal: Canal, base: { faqs: Pergunta[]; passos: TutorialStep[] }) {
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
   Na primeira resposta da conversa (e quando a pessoa quiser conferir informações), cite também o site https://hubcapture.app, onde há guias, tutoriais e perguntas frequentes.
5. NUNCA peça senha, código de verificação, dados bancários, chave PIX, documentos ou dados pessoais. Se a pessoa oferecer, diga para não compartilhar.
6. Fora do assunto (Hub Capture, Hub Data, Minute, cadastro, gravações, pagamentos, kit/HubCap, comunidade), recuse com gentileza e volte ao tema.
7. Não invente links: use apenas os da lista de links oficiais.

## Conhecimento
${conhecimento(base.faqs, base.passos)}`
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

export type Tentativa = { modelo: string; ok: boolean; status?: number; erro?: string; ms: number }
export type Diagnostico = { ok: boolean; modelo: string | null; status?: number; erro?: string; tentativas: Tentativa[] }

/**
 * Cache das PRIMEIRAS perguntas (sem conversa antes): a mesma pergunta de outra pessoa sai do
 * cache por 24 h sem gastar a cota do Gemini. Fica na memória da instância da Vercel; perguntas
 * no meio de uma conversa dependem do contexto e sempre vão para o Gemini.
 */
const CACHE_MS = 24 * 60 * 60 * 1000
const CACHE_MAX = 500
const cacheRespostas = new Map<string, { texto: string; em: number }>()

function chaveCache(historico: MensagemChat[], canal: Canal) {
  if (historico.length !== 1 || historico[0].role !== 'user') return null
  const pergunta = normalizarPergunta(historico[0].content)
  return pergunta.length >= 3 ? `${canal}:${pergunta}` : null
}

/** Gera a resposta do assistente. Lança AssistenteIndisponivel sem chave ou se o Gemini falhar. */
export async function gerarResposta(historico: MensagemChat[], canal: Canal): Promise<string> {
  if (historico.length === 1 && historico[0].role === 'user') {
    const pronta = respostaPronta(historico[0].content, await obterConfig('respostas_prontas'), await obterConfig('tutoriais'))
    if (pronta) return pronta
  }
  const chave = chaveCache(historico, canal)
  const guardada = chave ? cacheRespostas.get(chave) : undefined
  if (guardada && Date.now() - guardada.em < CACHE_MS) return guardada.texto

  const resultado = await chamarGemini(historico, canal)
  if (resultado.ok && chave && !resultado.texto.startsWith('Não consegui responder isso agora')) {
    if (cacheRespostas.size >= CACHE_MAX) cacheRespostas.delete(cacheRespostas.keys().next().value!)
    cacheRespostas.set(chave, { texto: resultado.texto, em: Date.now() })
  }
  if (!resultado.ok) {
    const resumo = resultado.tentativas.map((t) => `${t.modelo}: ${t.status ?? ''} ${t.erro}`).join(' | ')
    throw new AssistenteIndisponivel(`Gemini falhou (${resumo || resultado.erro})`)
  }
  return resultado.texto
}

/** Teste rápido para o painel da equipe: mostra o resultado de cada modelo tentado. */
export async function testarAssistente(): Promise<Diagnostico> {
  const resultado = await chamarGemini([{ role: 'user', content: 'Responda só: ok' }], 'site')
  const { ok, modelo, tentativas } = resultado
  return resultado.ok ? { ok, modelo, tentativas } : { ok, modelo, tentativas, status: resultado.status, erro: resultado.erro }
}

type Resultado =
  | { ok: true; texto: string; modelo: string; tentativas: Tentativa[] }
  | { ok: false; modelo: string | null; status?: number; erro: string; tentativas: Tentativa[] }

/** Tempo por modelo e tempo total (a rota do chat tem 60 s na Vercel). */
const TIMEOUT_POR_MODELO_MS = 12000
const PRAZO_TOTAL_MS = 40000

async function chamarGemini(historico: MensagemChat[], canal: Canal): Promise<Resultado> {
  const tentativas: Tentativa[] = []
  const nome = variavelDaChave()
  if (!nome) return { ok: false, modelo: null, erro: 'Nenhuma chave configurada (GEMINI_API_KEY) nesta implantação.', tentativas }
  const chave = process.env[nome]!.trim()

  // ASSISTENTE_API_BASE só existe para testes locais (servidor falso); em produção fica vazio.
  const base = process.env.ASSISTENTE_API_BASE || 'https://generativelanguage.googleapis.com'
  const [faqs, passos] = await Promise.all([obterConfig('faq'), obterConfig('tutoriais')])
  const corpoBase = {
    systemInstruction: { parts: [{ text: instrucoes(canal, { faqs, passos }) }] },
    contents: historico.map((mensagem) => ({
      role: mensagem.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: mensagem.content }],
    })),
  }
  // Raciocínio "low" deixa os modelos 3.x bem mais rápidos. Se o modelo recusar o campo, repete sem ele.
  // O limite é folgado porque o raciocínio interno também conta nos tokens de saída.
  const comRaciocinioBaixo = JSON.stringify({
    ...corpoBase,
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: 'low' } },
  })
  const semRaciocinio = JSON.stringify({ ...corpoBase, generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } })

  const inicio = Date.now()
  for (const modelo of modelosParaTentar()) {
    let corpo = comRaciocinioBaixo
    for (let repeticao = 0; repeticao < 2; repeticao++) {
      const restante = PRAZO_TOTAL_MS - (Date.now() - inicio)
      if (restante < 2000) break
      const t0 = Date.now()
      let resposta: Response
      try {
        resposta = await fetch(`${base}/v1beta/models/${encodeURIComponent(modelo)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
          body: corpo,
          cache: 'no-store',
          signal: AbortSignal.timeout(Math.min(TIMEOUT_POR_MODELO_MS, restante)),
        })
      } catch (error) {
        const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
        tentativas.push({ modelo, ok: false, erro: timeout ? 'demorou demais (timeout)' : `falha de rede: ${String(error)}`, ms: Date.now() - t0 })
        break // tenta o próximo modelo
      }

      const dados = await resposta.json().catch(() => null)
      if (!resposta.ok) {
        const mensagem = String(dados?.error?.message ?? JSON.stringify(dados)).slice(0, 300)
        tentativas.push({ modelo, ok: false, status: resposta.status, erro: mensagem, ms: Date.now() - t0 })
        if (resposta.status === 400 && /thinking/i.test(mensagem) && corpo !== semRaciocinio) {
          corpo = semRaciocinio
          continue // mesmo modelo, sem o ajuste de raciocínio
        }
        // Chave inválida, sem permissão ou cota esgotada valem para todos os modelos: para aqui.
        if ([400, 401, 403, 429].includes(resposta.status)) {
          return { ok: false, modelo, status: resposta.status, erro: mensagem, tentativas }
        }
        break // 404 (modelo desligado), 5xx (instável): tenta o próximo
      }

      modeloQueFunciona = modelo
      tentativas.push({ modelo, ok: true, ms: Date.now() - t0 })
      const texto: string = (dados?.candidates?.[0]?.content?.parts ?? [])
        .filter((parte: { thought?: boolean }) => !parte.thought)
        .map((parte: { text?: string }) => parte.text ?? '')
        .join('')
        .trim()
      return {
        ok: true,
        modelo,
        tentativas,
        texto:
          texto ||
          `Não consegui responder isso agora. Se quiser, fale com a gente na comunidade do WhatsApp: ${WHATSAPP_COMMUNITY_URL}`,
      }
    }
  }
  const ultima = tentativas.at(-1)
  return { ok: false, modelo: ultima?.modelo ?? null, status: ultima?.status, erro: ultima?.erro ?? 'Nenhum modelo respondeu.', tentativas }
}
