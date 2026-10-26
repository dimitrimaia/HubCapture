import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb, usuariosEquipe } from '@/db'

/**
 * Acesso ao painel /equipe com contas individuais (lib/usuarios.ts).
 *
 * - Cookie httpOnly assinado (HMAC) com o id do usuário, a versão da sessão e a validade.
 * - A cada pedido o usuário é relido do banco: conta desativada, troca de papel ou
 *   "encerrar sessões" (que aumenta sessao_versao) cortam o acesso na hora.
 * - EQUIPE_SENHA é a CHAVE DE INSTALAÇÃO: só serve para criar o primeiro admin e
 *   para assinar os cookies (trocá-la desloga todo mundo). EQUIPE_SEGREDO, se existir,
 *   assina os cookies no lugar dela.
 */

export const COOKIE_EQUIPE = 'hub_equipe'
/**
 * Aviso sem segredo (legível pelo navegador) de que existe uma sessão: só com ele o site público
 * pergunta a /api/equipe/eu quem está logado. Visitantes comuns não fazem esse pedido.
 */
export const COOKIE_AVISO = 'hub_equipe_on'
const VALIDADE_S = 7 * 24 * 60 * 60

export type Papel = 'admin' | 'equipe'
export type SessaoEquipe = { id: string; nome: string; usuario: string; papel: Papel; trocarSenha: boolean; doisFatores: boolean }

function chaveInstalacao() {
  return process.env.EQUIPE_SENHA ?? ''
}

export function equipeConfigurada() {
  return chaveInstalacao().length >= 8
}

function chaveAssinatura() {
  const segredo = process.env.EQUIPE_SEGREDO || chaveInstalacao()
  return createHash('sha256').update(`hubcapture-equipe:${segredo}`).digest()
}

function assinar(dados: string) {
  return createHmac('sha256', chaveAssinatura()).update(dados).digest('base64url')
}

function iguais(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function chaveInstalacaoCorreta(tentativa: string) {
  return equipeConfigurada() && iguais(tentativa, chaveInstalacao())
}

function criarToken(id: string, versao: number) {
  const dados = Buffer.from(JSON.stringify({ u: id, v: versao, e: Math.floor(Date.now() / 1000) + VALIDADE_S })).toString('base64url')
  return `${dados}.${assinar(dados)}`
}

function lerToken(token?: string) {
  if (!token || !equipeConfigurada()) return null
  const [dados, assinatura] = token.split('.')
  if (!dados || !assinatura || !iguais(assinatura, assinar(dados))) return null
  try {
    const { u, v, e } = JSON.parse(Buffer.from(dados, 'base64url').toString())
    if (typeof u !== 'string' || typeof v !== 'number' || typeof e !== 'number' || e < Date.now() / 1000) return null
    return { id: u, versao: v }
  } catch {
    return null
  }
}

/** Sessão atual, conferida no banco. null = não logado, conta desativada ou sessão encerrada. */
export async function lerSessao(): Promise<SessaoEquipe | null> {
  const token = lerToken((await cookies()).get(COOKIE_EQUIPE)?.value)
  const db = getDb()
  if (!token || !db) return null
  const [usuario] = await db.select().from(usuariosEquipe).where(eq(usuariosEquipe.id, token.id)).catch(() => [])
  if (!usuario || !usuario.ativo || usuario.sessaoVersao !== token.versao) return null
  return {
    id: usuario.id,
    nome: usuario.nome,
    usuario: usuario.usuario,
    papel: usuario.papel === 'admin' ? 'admin' : 'equipe',
    trocarSenha: usuario.trocarSenha,
    doisFatores: Boolean(usuario.totpSegredo),
  }
}

export async function salvarSessao(id: string, versao: number) {
  ;(await cookies()).set(COOKIE_EQUIPE, criarToken(id, versao), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: VALIDADE_S,
  })
  ;(await cookies()).set(COOKIE_AVISO, '1', { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: VALIDADE_S })
}

export async function encerrarSessao() {
  const jar = await cookies()
  jar.delete(COOKIE_EQUIPE)
  jar.delete(COOKIE_AVISO)
}

/** Para páginas: manda para o login (ou para trocar a senha) e bloqueia quem não tem o papel exigido. */
export async function exigirSessaoPagina(papel?: Papel) {
  const sessao = await lerSessao()
  if (!sessao) redirect('/equipe/login')
  if (papel === 'admin' && sessao.papel !== 'admin') redirect('/equipe/fila')
  return sessao
}

/** Para as rotas /api/equipe/*: exige sessão válida, o papel pedido e que o pedido venha do próprio site. */
export async function exigirSessaoApi(request: Request, papel?: Papel) {
  const origem = request.headers.get('origin')
  if (origem && new URL(origem).host !== request.headers.get('host')) return null
  const sessao = await lerSessao()
  if (!sessao || (papel === 'admin' && sessao.papel !== 'admin')) return null
  return sessao
}

/* ───────────── Liberação de exportação (pede a senha de novo; LGPD) ───────────── */

const COOKIE_EXPORTAR = 'hub_exportar'
const EXPORTAR_S = 10 * 60

/** Libera exportações por 10 minutos para este usuário (cookie assinado, httpOnly). */
export async function liberarExportacao(sessao: SessaoEquipe) {
  const dados = Buffer.from(JSON.stringify({ u: sessao.id, e: Math.floor(Date.now() / 1000) + EXPORTAR_S })).toString('base64url')
  ;(await cookies()).set(COOKIE_EXPORTAR, `${dados}.${assinar(`exportar:${dados}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/equipe',
    maxAge: EXPORTAR_S,
  })
}

export async function exportacaoLiberada(sessao: SessaoEquipe) {
  const token = (await cookies()).get(COOKIE_EXPORTAR)?.value
  if (!token) return false
  const [dados, assinatura] = token.split('.')
  if (!dados || !assinatura || !iguais(assinatura, assinar(`exportar:${dados}`))) return false
  try {
    const { u, e } = JSON.parse(Buffer.from(dados, 'base64url').toString())
    return u === sessao.id && typeof e === 'number' && e > Date.now() / 1000
  } catch {
    return false
  }
}
