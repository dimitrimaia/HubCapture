import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Verificação em duas etapas (TOTP, RFC 6238): códigos de 6 dígitos que mudam a cada 30 s,
 * compatíveis com Google Authenticator, Microsoft Authenticator, 1Password, Authy etc.
 */

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32(buffer: Buffer) {
  let bits = 0
  let valor = 0
  let saida = ''
  for (const byte of buffer) {
    valor = (valor << 8) | byte
    bits += 8
    while (bits >= 5) {
      saida += ALFABETO[(valor >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) saida += ALFABETO[(valor << (5 - bits)) & 31]
  return saida
}

function deBase32(texto: string) {
  const limpo = texto.replace(/[\s=-]/g, '').toUpperCase()
  let bits = 0
  let valor = 0
  const bytes: number[] = []
  for (const letra of limpo) {
    const indice = ALFABETO.indexOf(letra)
    if (indice === -1) continue
    valor = (valor << 5) | indice
    bits += 5
    if (bits >= 8) {
      bytes.push((valor >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

export function novoSegredoTotp() {
  return base32(randomBytes(20))
}

function codigoNoPasso(segredo: string, passo: number) {
  const contador = Buffer.alloc(8)
  contador.writeBigUInt64BE(BigInt(passo))
  const hmac = createHmac('sha1', deBase32(segredo)).update(contador).digest()
  const deslocamento = hmac[hmac.length - 1] & 0xf
  const numero = (hmac.readUInt32BE(deslocamento) & 0x7fffffff) % 1_000_000
  return numero.toString().padStart(6, '0')
}

/** Aceita o código atual e o vizinho (±30 s) para tolerar relógio de celular atrasado. */
export function codigoTotpValido(segredo: string, codigo: string, agora = Date.now()) {
  const digitado = codigo.replace(/\D/g, '')
  if (digitado.length !== 6) return false
  const passo = Math.floor(agora / 30000)
  return [-1, 0, 1].some((delta) => {
    const esperado = codigoNoPasso(segredo, passo + delta)
    return timingSafeEqual(Buffer.from(esperado), Buffer.from(digitado))
  })
}

/** Endereço otpauth:// que vira o QR code lido pelo app autenticador. */
export function uriTotp(segredo: string, usuario: string) {
  const rotulo = encodeURIComponent(`Hub Capture:${usuario}`)
  return `otpauth://totp/${rotulo}?secret=${segredo}&issuer=${encodeURIComponent('Hub Capture')}&algorithm=SHA1&digits=6&period=30`
}
