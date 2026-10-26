import 'server-only'
import { and, asc, eq, ne, sql } from 'drizzle-orm'
import { getDb, usuariosEquipe } from '@/db'
import type { Papel } from './equipe'
import { gerarHashSenha, senhaTemporaria } from './senha'

export type UsuarioLista = {
  id: string
  nome: string
  usuario: string
  papel: Papel
  ativo: boolean
  doisFatores: boolean
  trocarSenha: boolean
  ultimoLoginEm: string | null
  criadoEm: string
}

export function normalizarUsuario(usuario: string) {
  return usuario.trim().toLowerCase().slice(0, 80)
}

export function usuarioValido(usuario: string) {
  return /^[a-z0-9._@+-]{3,80}$/.test(usuario)
}

export async function contarUsuarios() {
  const db = getDb()
  if (!db) return null
  const [linha] = await db.select({ n: sql<number>`count(*)::int` }).from(usuariosEquipe)
  return linha?.n ?? 0
}

export async function buscarPorUsuario(usuario: string) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db.select().from(usuariosEquipe).where(eq(usuariosEquipe.usuario, normalizarUsuario(usuario)))
  return linha ?? null
}

export async function buscarPorId(id: string) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db.select().from(usuariosEquipe).where(eq(usuariosEquipe.id, id))
  return linha ?? null
}

export async function listarUsuarios(): Promise<UsuarioLista[]> {
  const db = getDb()
  if (!db) return []
  const linhas = await db.select().from(usuariosEquipe).orderBy(asc(usuariosEquipe.nome))
  return linhas.map((u) => ({
    id: u.id,
    nome: u.nome,
    usuario: u.usuario,
    papel: u.papel === 'admin' ? 'admin' : 'equipe',
    ativo: u.ativo,
    doisFatores: Boolean(u.totpSegredo),
    trocarSenha: u.trocarSenha,
    ultimoLoginEm: u.ultimoLoginEm?.toISOString() ?? null,
    criadoEm: u.criadoEm.toISOString(),
  }))
}

/** Cria usuário. Sem senha informada, gera uma temporária (devolvida uma vez) e exige troca no 1º login. */
export async function criarUsuario(dados: { nome: string; usuario: string; papel: Papel; senha?: string }) {
  const db = getDb()
  if (!db) throw new Error('Banco não configurado')
  const temporaria = dados.senha ? null : senhaTemporaria()
  const [criado] = await db
    .insert(usuariosEquipe)
    .values({
      nome: dados.nome.trim().slice(0, 60),
      usuario: normalizarUsuario(dados.usuario),
      papel: dados.papel,
      senhaHash: await gerarHashSenha(dados.senha ?? temporaria!),
      trocarSenha: Boolean(temporaria),
    })
    .onConflictDoNothing({ target: usuariosEquipe.usuario })
    .returning()
  return criado ? { usuario: criado, senhaTemporaria: temporaria } : null
}

export async function atualizarUsuario(
  id: string,
  dados: Partial<{ ativo: boolean; papel: Papel; senhaHash: string; trocarSenha: boolean; totpSegredo: string | null; nome: string }>,
  opcoes: { encerrarSessoes?: boolean } = {},
) {
  const db = getDb()
  if (!db) return null
  const [linha] = await db
    .update(usuariosEquipe)
    .set({ ...dados, ...(opcoes.encerrarSessoes ? { sessaoVersao: sql`${usuariosEquipe.sessaoVersao} + 1` } : {}) })
    .where(eq(usuariosEquipe.id, id))
    .returning()
  return linha ?? null
}

export async function registrarLogin(id: string) {
  const db = getDb()
  if (!db) return
  await db.update(usuariosEquipe).set({ ultimoLoginEm: new Date() }).where(eq(usuariosEquipe.id, id))
}

/** Quantos admins ativos sobram fora este usuário (para nunca ficar sem nenhum admin). */
export async function outrosAdminsAtivos(id: string) {
  const db = getDb()
  if (!db) return 0
  const [linha] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(usuariosEquipe)
    .where(and(eq(usuariosEquipe.papel, 'admin'), eq(usuariosEquipe.ativo, true), ne(usuariosEquipe.id, id)))
  return linha?.n ?? 0
}

export async function redefinirSenha(id: string) {
  const temporaria = senhaTemporaria()
  const usuario = await atualizarUsuario(id, { senhaHash: await gerarHashSenha(temporaria), trocarSenha: true }, { encerrarSessoes: true })
  return usuario ? temporaria : null
}
