import { APP_STORE_URL, PLAY_STORE_URL, SIGNUP_URL, SITE_URL, TUTORIAIS_PATH, WHATSAPP_COMMUNITY_URL } from './site'
import { type TutorialStep, tutorialSteps } from './tutorials'

/** Deixa a pergunta comparável: minúsculas, sem acentos, sem pontuação, espaços únicos. */
export function normalizarPergunta(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const URL_TUTORIAIS = `${SITE_URL}${TUTORIAIS_PATH}`

/**
 * Tutorial completo, montado com os mesmos passos da página /tutoriais (editáveis no site):
 * índice com link para cada passo e a explicação de cada um. Atualiza sozinho com os passos.
 */
function tutorialCompleto(passosTutorial: TutorialStep[]) {
  const temVideo = passosTutorial.some((passo) => passo.youtubeId || passo.videoUrl)
  const indice = passosTutorial.map((passo, i) => `${i + 1}. [${passo.title}](${URL_TUTORIAIS}#passo-${i + 1})`).join('\n')
  const passos = passosTutorial
    .map((passo, i) => `**Passo ${i + 1}: ${passo.title}**\n${passo.description} [Ver o passo ${i + 1}](${URL_TUTORIAIS}#passo-${i + 1})`)
    .join('\n\n')
  const videos = temVideo
    ? `🎥 Cada passo tem vídeo na [página de tutoriais](${URL_TUTORIAIS}).`
    : `🎥 Os vídeos de cada passo estão chegando na [página de tutoriais](${URL_TUTORIAIS}).`

  return `Aqui está o passo a passo completo, do cadastro ao primeiro PIX:

${indice}

${passos}

${videos} Comece pelo [cadastro com o VEMHUB](${SIGNUP_URL}).`
}

/**
 * Respostas das perguntas sugeridas no chat: saem na hora e não gastam a cota do Gemini.
 * Mantenha alinhado com o FAQ (lib/site.ts). Chave = pergunta normalizada.
 */
/**
 * Respostas prontas do chat: saem na hora e não gastam a cota do Gemini.
 * Editáveis em /equipe/mensagens; esta é a lista padrão. Uma pergunta casa com a resposta quando,
 * normalizada (sem acentos, maiúsculas e pontuação), é IGUAL a um dos gatilhos.
 * Na resposta, {tutorial_completo} vira o passo a passo montado de lib/tutorials.ts.
 */
export type RespostaPronta = { id: string; gatilhos: string[]; resposta: string }

export const RESPOSTAS_PRONTAS_PADRAO: RespostaPronta[] = [
  {
    id: 'tutorial',
    gatilhos: ['Tutorial completo', 'tutorial', 'passo a passo', 'passo a passo completo', 'como começar', 'por onde começo', 'quero o tutorial', 'me manda o tutorial'],
    resposta: '{tutorial_completo}',
  },
  {
    id: 'cadastro',
    gatilhos: ['Como me cadastro?', 'como faço o cadastro', 'como me inscrevo', 'quero me cadastrar'],
    resposta: `É rápido e grátis:

1. Abra o [cadastro com o código VEMHUB](${SIGNUP_URL}) (o código já vem aplicado).
2. Crie sua conta com nome, e-mail e senha.
3. Baixe o app **Hub Capture** ([Android](${PLAY_STORE_URL}) ou [iPhone](${APP_STORE_URL})) e entre com o mesmo e-mail.

Depois vem o kit, o app Minute e a primeira gravação: peça o **tutorial completo** aqui no chat ou veja a [página de tutoriais](${URL_TUTORIAIS}).`,
  },
  {
    id: 'valores',
    gatilhos: ['Quanto paga por hora?', 'quanto paga', 'quanto ganha', 'quanto eu ganho'],
    resposta: `Os valores são por **hora de gravação aprovada**:

- **Casa (Residencial):** valor de cada tarefa no app
- **Trabalho (Comercial):** de R$ 10 a R$ 75/h, conforme a categoria

São valores máximos, que variam por tarefa, e não há ganho garantido: só o tempo aprovado na verificação de qualidade conta. Para começar, faça o [cadastro com o VEMHUB](${SIGNUP_URL}).`,
  },
  {
    id: 'pagamento',
    gatilhos: ['Como recebo o pagamento?', 'como recebo', 'como sacar', 'paga por pix'],
    resposta: `As horas aprovadas entram no seu saldo no painel da Hub, e o saque é feito via **PIX** ou transferência bancária, conforme o calendário de pagamentos semanais mostrado na sua conta.

Você não paga nada para participar. Ainda não tem conta? [Cadastre-se com o VEMHUB](${SIGNUP_URL}).`,
  },
  {
    id: 'minute',
    gatilhos: ['O que é o Minute?', 'minute', 'app minute', 'como vincular o minute'],
    resposta: `O **Minute** é um segundo app da Hub com **tarefas extras** pagas, que somam no mesmo saldo.

Para liberar: no painel do Hub Capture, abra **Gravar e ganhar → Vincule sua conta do Minute**, copie o e-mail e o código de convite pessoal, baixe o Minute pelos botões do painel e entre (ou cadastre-se **uma única vez**) com esse mesmo e-mail e código. Não crie uma segunda conta. A vinculação aparece em até ~20 min após a primeira gravação.

Dúvidas? Fale na [comunidade do WhatsApp](${WHATSAPP_COMMUNITY_URL}).`,
  },
]

export function respostaPronta(pergunta: string, lista: RespostaPronta[] = RESPOSTAS_PRONTAS_PADRAO, passos: TutorialStep[] = tutorialSteps) {
  const chave = normalizarPergunta(pergunta)
  if (!chave) return null
  const achada = lista.find((item) => item.gatilhos.some((gatilho) => normalizarPergunta(gatilho) === chave))
  return achada ? achada.resposta.replaceAll('{tutorial_completo}', tutorialCompleto(passos)) : null
}

/** Valida a lista vinda do editor do painel. */
export function validarRespostas(entrada: unknown): RespostaPronta[] | null {
  if (!Array.isArray(entrada) || entrada.length > 40) return null
  const lista = entrada.map((item, i) => ({
    id: String(item?.id || `resposta-${i + 1}`).replace(/[^a-z0-9-]/gi, '').slice(0, 40) || `resposta-${i + 1}`,
    gatilhos: (Array.isArray(item?.gatilhos) ? item.gatilhos : String(item?.gatilhos ?? '').split('\n'))
      .map((g: unknown) => String(g).trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 20),
    resposta: String(item?.resposta ?? '').trim().slice(0, 4000),
  }))
  if (lista.some((item) => item.gatilhos.length === 0 || item.resposta.length < 2)) return null
  return lista
}
