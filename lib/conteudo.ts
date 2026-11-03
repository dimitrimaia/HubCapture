import type { TutorialStep } from './tutorials'

/**
 * Blocos do site editáveis por administradores direto na página (modo "Editar página").
 * Os padrões ficam no código; a versão editada fica na tabela `configuracoes`.
 * Este arquivo roda também no navegador: nada de banco aqui.
 */

export type ConteudoHero = {
  titulo: string
  destaque: string
  subtitulo: string
  textoTrabalho: string
  textoCasa: string
  valorTrabalho: string
  valorCasa: string
  destaques: string[]
}

export type Pergunta = { question: string; answer: string }

export const HERO_PADRAO: ConteudoHero = {
  titulo: 'Filmou,',
  destaque: 'ganhou.',
  subtitulo: 'Ganhe dinheiro gravando vídeos com o app Hub Capture.',
  textoTrabalho:
    'No app Hub Capture, da Hub Data, você grava atividades profissionais reais no seu trabalho, com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX.',
  textoCasa:
    'No app Hub Capture, da Hub Data, você grava tarefas do dia a dia em casa — cozinhar, organizar, lavar — com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX.',
  valorTrabalho: 'R$ 50',
  valorCasa: 'R$ 35',
  destaques: ['Cadastro gratuito', 'Starter Kit grátis', 'Saque via PIX'],
}

export type ConteudoComoFunciona = { titulo: string; subtitulo: string; passos: { titulo: string; descricao: string }[]; botao: string }

export type ConteudoHubcap = {
  chamada: string
  titulo: string
  destaque: string
  texto: string
  vantagens: string[]
  botao: string
  link: string
  rodape: string
}

export type ConteudoComunidade = { titulo: string; texto: string; beneficios: string[]; botao: string; instagramTexto: string }

export const COMO_FUNCIONA_PADRAO: ConteudoComoFunciona = {
  titulo: 'Comece a ganhar em 3 passos simples',
  subtitulo: 'Sem equipamento caro, sem experiência com vídeo. Só o seu celular e as tarefas que você já faz.',
  passos: [
    {
      titulo: 'Cadastro gratuito',
      descricao: 'Crie sua conta em minutos e peça o Starter Kit: faixa de cabeça e suporte para o celular, enviados sem custo até você.',
    },
    {
      titulo: 'Capture o mundo real',
      descricao: 'Prenda o celular na cabeça e grave tarefas cotidianas do começo ao fim — arrumar a casa, cozinhar, consertar, montar.',
    },
    {
      titulo: 'Receba com segurança',
      descricao: 'Cada vídeo passa por verificação de qualidade. As horas aprovadas são creditadas no painel e pagas via PIX.',
    },
  ],
  botao: 'Fazer meu cadastro gratuito',
}

export const HUBCAP_PADRAO: ConteudoHubcap = {
  chamada: 'Para gravar sem segurar o celular',
  titulo: 'O kit da Hub tem fila.',
  destaque: 'O boné da HubCap resolve enquanto isso.',
  texto:
    'O Suporte Oficial HubCap prende o celular na cabeça e só as suas mãos aparecem — que é exatamente o que a Hub Data aprova. Dá para começar a gravar hoje, sem esperar o kit chegar.',
  vantagens: ['Chega bem mais rápido que o kit', 'Celular firme e estável', 'Só as suas mãos aparecem'],
  botao: 'Ver o boné com suporte para celular',
  link: '',
  rodape: 'Produto oficial · compra segura pelo Mercado Livre.',
}

export const COMUNIDADE_PADRAO: ConteudoComunidade = {
  titulo: 'Entre na comunidade Hub Capture e fale direto comigo',
  texto:
    'Um grupo para quem grava na Hub Data: contato direto com o Dimitri, respostas rápidas para suas dúvidas, dicas para aprovar mais vídeos e suporte no começo.',
  beneficios: ['Tire dúvidas direto comigo', 'Suporte mais rápido', 'Avisos de novas tarefas e sorteios'],
  botao: 'Entrar na comunidade',
  instagramTexto: 'Bastidores, tutoriais rápidos, resultados de quem já grava e os sorteios do código VEMHUB.',
}

export const BLOCOS = {
  conteudo_hero: 'Topo da página',
  conteudo_como_funciona: 'Como funciona',
  tutoriais: 'Tutoriais em vídeo',
  conteudo_comunidade: 'Comunidade',
  conteudo_hubcap: 'Boné HubCap',
  faq: 'Perguntas frequentes',
} as const
export type Bloco = keyof typeof BLOCOS

/**
 * Aceita link do YouTube (watch, youtu.be, shorts, embed, live) ou só o ID.
 * Devolve o ID de 11 caracteres, ou null se não reconhecer.
 */
export function idDoYoutube(entrada: string) {
  const texto = entrada.trim()
  if (/^[\w-]{11}$/.test(texto)) return texto
  try {
    const url = new URL(texto.startsWith('http') ? texto : `https://${texto}`)
    const host = url.hostname.replace(/^(www|m)\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = url.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
      id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?]+)/)?.[1] ?? null
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

/** Link digitado no editor → campos do passo. MP4 precisa ser https. */
export function videoDoLink(link: string): Pick<TutorialStep, 'youtubeId' | 'videoUrl'> | null {
  const texto = link.trim()
  if (!texto) return {}
  const youtube = idDoYoutube(texto)
  if (youtube) return { youtubeId: youtube }
  if (/^https:\/\/[^\s]+\.(mp4|webm|mov)(\?[^\s]*)?$/i.test(texto)) return { videoUrl: texto }
  return null
}

export function linkDoVideo(passo: Pick<TutorialStep, 'youtubeId' | 'videoUrl'>) {
  if (passo.videoUrl) return passo.videoUrl
  return passo.youtubeId ? `https://youtu.be/${passo.youtubeId}` : ''
}

const texto = (valor: unknown, max: number) => (typeof valor === 'string' ? valor.trim().slice(0, max) : '')

export function validarHero(valor: unknown): ConteudoHero | null {
  if (!valor || typeof valor !== 'object') return null
  const v = valor as Record<string, unknown>
  const hero: ConteudoHero = {
    titulo: texto(v.titulo, 40),
    destaque: texto(v.destaque, 40),
    subtitulo: texto(v.subtitulo, 120),
    textoTrabalho: texto(v.textoTrabalho, 400),
    textoCasa: texto(v.textoCasa, 400),
    valorTrabalho: texto(v.valorTrabalho, 12),
    valorCasa: texto(v.valorCasa, 12),
    destaques: Array.isArray(v.destaques) ? v.destaques.map((d) => texto(d, 40)).filter(Boolean).slice(0, 5) : [],
  }
  const obrigatorios = [hero.titulo, hero.subtitulo, hero.textoTrabalho, hero.textoCasa, hero.valorTrabalho, hero.valorCasa]
  return obrigatorios.every(Boolean) ? hero : null
}

export function validarTutoriais(valor: unknown): TutorialStep[] | null {
  if (!Array.isArray(valor) || valor.length === 0 || valor.length > 20) return null
  const passos: TutorialStep[] = []
  for (const item of valor) {
    if (!item || typeof item !== 'object') return null
    const p = item as Record<string, unknown>
    const title = texto(p.title, 120)
    const description = texto(p.description, 1500)
    if (title.length < 3 || description.length < 10) return null
    const youtubeId = typeof p.youtubeId === 'string' && p.youtubeId ? idDoYoutube(p.youtubeId) : null
    const videoUrl = typeof p.videoUrl === 'string' && p.videoUrl ? videoDoLink(p.videoUrl)?.videoUrl : undefined
    if ((p.youtubeId && !youtubeId) || (p.videoUrl && !videoUrl)) return null
    passos.push({ title, description, ...(youtubeId ? { youtubeId } : {}), ...(videoUrl ? { videoUrl } : {}) })
  }
  return passos
}

export function validarFaq(valor: unknown): Pergunta[] | null {
  if (!Array.isArray(valor) || valor.length === 0 || valor.length > 40) return null
  const lista = valor.map((item) => ({
    question: texto((item as Pergunta | null)?.question, 200),
    answer: texto((item as Pergunta | null)?.answer, 2000),
  }))
  return lista.every((p) => p.question.length >= 5 && p.answer.length >= 10) ? lista : null
}

const lista = (valor: unknown, max: number, tamanho: number) =>
  Array.isArray(valor) ? valor.map((v) => texto(v, tamanho)).filter(Boolean).slice(0, max) : []

export function validarComoFunciona(valor: unknown): ConteudoComoFunciona | null {
  if (!valor || typeof valor !== 'object') return null
  const v = valor as Record<string, unknown>
  const passos = Array.isArray(v.passos)
    ? v.passos.map((p) => ({ titulo: texto((p as Record<string, unknown>)?.titulo, 60), descricao: texto((p as Record<string, unknown>)?.descricao, 300) }))
    : []
  const bloco = { titulo: texto(v.titulo, 120), subtitulo: texto(v.subtitulo, 300), passos, botao: texto(v.botao, 40) }
  const ok = bloco.titulo && bloco.botao && passos.length >= 2 && passos.length <= 4 && passos.every((p) => p.titulo.length >= 3 && p.descricao.length >= 10)
  return ok ? bloco : null
}

/** Link do botão: vazio (usa o oficial do código) ou https. */
function linkSeguro(valor: unknown) {
  const link = texto(valor, 300)
  if (!link) return ''
  try {
    return new URL(link).protocol === 'https:' ? link : null
  } catch {
    return null
  }
}

export function validarHubcap(valor: unknown): ConteudoHubcap | null {
  if (!valor || typeof valor !== 'object') return null
  const v = valor as Record<string, unknown>
  const link = linkSeguro(v.link)
  if (link === null) return null
  const bloco: ConteudoHubcap = {
    chamada: texto(v.chamada, 60),
    titulo: texto(v.titulo, 80),
    destaque: texto(v.destaque, 100),
    texto: texto(v.texto, 500),
    vantagens: lista(v.vantagens, 3, 50),
    botao: texto(v.botao, 50),
    link,
    rodape: texto(v.rodape, 120),
  }
  return bloco.titulo && bloco.texto && bloco.botao ? bloco : null
}

export function validarComunidade(valor: unknown): ConteudoComunidade | null {
  if (!valor || typeof valor !== 'object') return null
  const v = valor as Record<string, unknown>
  const bloco: ConteudoComunidade = {
    titulo: texto(v.titulo, 120),
    texto: texto(v.texto, 500),
    beneficios: lista(v.beneficios, 3, 50),
    botao: texto(v.botao, 40),
    instagramTexto: texto(v.instagramTexto, 300),
  }
  return bloco.titulo && bloco.texto && bloco.botao ? bloco : null
}
