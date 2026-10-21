import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE_EQUIPE = 'hub_equipe'
const VALIDADE_S = 7 * 24 * 60 * 60

export type SessaoEquipe = { nome: string }

function senha() {
  return process.env.EQUIPE_SENHA ?? ''
}

export function equipeConfigurada() {
  return senha().length >= 8
}

/** Chave derivada da senha: trocar EQUIPE_SENHA na Vercel derruba todas as sessões abertas. */
function chave() {
  return createHash('sha256').update(`hubcapture-equipe:${senha()}`).digest()
}

function assinar(dados: string) {
  return createHmac('sha256', chave()).update(dados).digest('base64url')
}

function iguais(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function senhaCorreta(tentativa: string) {
  return equipeConfigurada() && iguais(tentativa, senha())
}

export function criarToken(nome: string) {
  const dados = Buffer.from(JSON.stringify({ n: nome, e: Math.floor(Date.now() / 1000) + VALIDADE_S })).toString('base64url')
  return `${dados}.${assinar(dados)}`
}

export function lerToken(token?: string): SessaoEquipe | null {
  if (!token || !equipeConfigurada()) return null
  const [dados, assinatura] = token.split('.')
  if (!dados || !assinatura || !iguais(assinatura, assinar(dados))) return null
  try {
    const { n, e } = JSON.parse(Buffer.from(dados, 'base64url').toString())
    if (typeof n !== 'string' || typeof e !== 'number' || e < Date.now() / 1000) return null
    return { nome: n }
  } catch {
    return null
  }
}

export async function lerSessao() {
  return lerToken((await cookies()).get(COOKIE_EQUIPE)?.value)
}

export async function salvarSessao(nome: string) {
  ;(await cookies()).set(COOKIE_EQUIPE, criarToken(nome), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: VALIDADE_S,
  })
}

export async function encerrarSessao() {
  ;(await cookies()).delete(COOKIE_EQUIPE)
}

/** Para as rotas /api/equipe/*: exige sessão válida e que o pedido venha do próprio site. */
export async function exigirSessaoApi(request: Request) {
  const origem = request.headers.get('origin')
  if (origem && new URL(origem).host !== request.headers.get('host')) return null
  return lerSessao()
}

const falhas = new Map<string, number[]>()
const JANELA_FALHAS_MS = 15 * 60 * 1000

function falhasRecentes(ip: string) {
  const agora = Date.now()
  const recentes = (falhas.get(ip) ?? []).filter((t) => agora - t < JANELA_FALHAS_MS)
  falhas.set(ip, recentes)
  return recentes
}

/** Bloqueia o IP depois de 10 senhas erradas em 15 min (em memória da instância). Acertos não contam. */
export function loginBloqueado(ip: string) {
  return falhasRecentes(ip).length >= 10
}

export function registrarFalhaLogin(ip: string) {
  falhasRecentes(ip).push(Date.now())
}
