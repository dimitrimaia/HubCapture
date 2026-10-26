import { APP_STORE_URL, PLAY_STORE_URL, SIGNUP_URL, SITE_URL, TUTORIAIS_PATH, WHATSAPP_COMMUNITY_URL } from './site'
import { tutorialSteps } from './tutorials'

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
 * Tutorial completo, montado a partir de lib/tutorials.ts (mesma fonte da página /tutoriais):
 * índice com link para cada passo e a explicação de cada um. Atualiza sozinho com os passos.
 */
function tutorialCompleto() {
  const temVideo = tutorialSteps.some((passo) => passo.youtubeId || passo.videoUrl)
  const indice = tutorialSteps.map((passo, i) => `${i + 1}. [${passo.title}](${URL_TUTORIAIS}#passo-${i + 1})`).join('\n')
  const passos = tutorialSteps
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
const PRONTAS: Record<string, string> = {
  [normalizarPergunta('Como me cadastro?')]: `É rápido e grátis:

1. Abra o [cadastro com o código VEMHUB](${SIGNUP_URL}) (o código já vem aplicado).
2. Crie sua conta com nome, e-mail e senha.
3. Baixe o app **Hub Capture** ([Android](${PLAY_STORE_URL}) ou [iPhone](${APP_STORE_URL})) e entre com o mesmo e-mail.

Depois vem o kit, o app Minute e a primeira gravação: peça o **tutorial completo** aqui no chat ou veja a [página de tutoriais](${URL_TUTORIAIS}).`,

  [normalizarPergunta('Quanto paga por hora?')]: `Os valores são por **hora de gravação aprovada**:

- **Casa (Residencial):** até R$ 35/h
- **Trabalho (Comercial):** até R$ 50/h

São valores máximos, que variam por tarefa, e não há ganho garantido: só o tempo aprovado na verificação de qualidade conta. Para começar, faça o [cadastro com o VEMHUB](${SIGNUP_URL}).`,

  [normalizarPergunta('Como recebo o pagamento?')]: `As horas aprovadas entram no seu saldo no painel da Hub, e o saque é feito via **PIX** ou transferência bancária, conforme o calendário de pagamentos semanais mostrado na sua conta.

Você não paga nada para participar. Ainda não tem conta? [Cadastre-se com o VEMHUB](${SIGNUP_URL}).`,

  [normalizarPergunta('O que é o Minute?')]: `O **Minute** é um segundo app da Hub com **tarefas extras** pagas, que somam no mesmo saldo.

Para liberar: no painel do Hub Capture, abra **Gravar e ganhar → Vincule sua conta do Minute**, copie o e-mail e o código de convite pessoal, baixe o Minute pelos botões do painel e entre (ou cadastre-se **uma única vez**) com esse mesmo e-mail e código. Não crie uma segunda conta. A vinculação aparece em até ~20 min após a primeira gravação.

Dúvidas? Fale na [comunidade do WhatsApp](${WHATSAPP_COMMUNITY_URL}).`,
}

/** Formas comuns de pedir o tutorial (comparadas já normalizadas). */
const PEDIDOS_TUTORIAL = [
  'tutorial completo',
  'tutorial completo passo a passo',
  'tutorial',
  'passo a passo',
  'passo a passo completo',
  'como comecar',
  'por onde comeco',
  'quero o tutorial',
  'me manda o tutorial',
].map(normalizarPergunta)

export function respostaPronta(pergunta: string) {
  const chave = normalizarPergunta(pergunta)
  if (PEDIDOS_TUTORIAL.includes(chave)) return tutorialCompleto()
  return PRONTAS[chave] ?? null
}

