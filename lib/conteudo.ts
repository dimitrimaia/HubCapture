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
  subtitulo: 'Ganhe dinheiro gravando vídeos com o celular.',
  textoTrabalho:
    'No app Hub Capture, da Hub Data, você grava atividades profissionais reais no seu trabalho, com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX.',
  textoCasa:
    'No app Hub Capture, da Hub Data, você grava tarefas do dia a dia em casa — cozinhar, organizar, lavar — com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX.',
  valorTrabalho: 'R$ 50',
  valorCasa: 'R$ 35',
  destaques: ['Cadastro gratuito', 'Starter Kit grátis', 'Saque via PIX'],
}

export const BLOCOS = {
  conteudo_hero: 'Topo da página',
  tutoriais: 'Tutoriais em vídeo',
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
