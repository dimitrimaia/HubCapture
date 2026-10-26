import 'server-only'
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (senha: string, sal: Buffer, tamanho: number, opcoes: object) => Promise<Buffer>

// N=16384, r=8 usa ~16 MB por verificação: lento para ataque de força bruta, rápido para um login.
const N = 16384
const R = 8
const P = 1
const TAMANHO = 64

export const SENHA_MINIMA = 10

/** Gera "scrypt:N:r:p:sal:hash" (base64). A senha em si nunca é guardada. */
export async function gerarHashSenha(senha: string) {
  const sal = randomBytes(16)
  const hash = await scrypt(senha.normalize('NFKC'), sal, TAMANHO, { N, r: R, p: P })
  return ['scrypt', N, R, P, sal.toString('base64'), hash.toString('base64')].join(':')
}

export async function senhaConfere(senha: string, guardado: string) {
  const [algoritmo, n, r, p, sal, hash] = guardado.split(':')
  if (algoritmo !== 'scrypt' || !sal || !hash) return false
  const esperado = Buffer.from(hash, 'base64')
  const calculado = await scrypt(senha.normalize('NFKC'), Buffer.from(sal, 'base64'), esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  })
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}

/** Hash de uma senha qualquer para gastar o mesmo tempo quando o usuário não existe (evita descobrir logins). */
export const HASH_FALSO = 'scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA==:' + Buffer.alloc(TAMANHO).toString('base64')

/** Senha temporária legível (sem 0/O, 1/l) para o admin repassar. */
export function senhaTemporaria() {
  const alfabeto = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(14)
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')
}

export function validarNovaSenha(senha: string) {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`
  if (senha.length > 200) return 'Senha longa demais.'
  return null
}
