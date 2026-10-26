'use server'

import { headers } from 'next/headers'
import QRCode from 'qrcode'
import { registrarAuditoria } from '@/lib/auditoria'
import { exigirSessaoPagina, salvarSessao } from '@/lib/equipe'
import { ipDoPedido } from '@/lib/ip'
import { gerarHashSenha, senhaConfere, validarNovaSenha } from '@/lib/senha'
import { codigoTotpValido, novoSegredoTotp, uriTotp } from '@/lib/totp'
import { atualizarUsuario, buscarPorId } from '@/lib/usuarios'

export type EstadoConta = { ok?: string; erro?: string }

export async function trocarSenha(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const sessao = await exigirSessaoPagina()
  const atual = String(formData.get('atual') ?? '')
  const nova = String(formData.get('nova') ?? '')
  const confirmacao = String(formData.get('confirmacao') ?? '')

  const conta = await buscarPorId(sessao.id)
  if (!conta || !(await senhaConfere(atual, conta.senhaHash))) return { erro: 'Senha atual incorreta.' }
  const problema = validarNovaSenha(nova)
  if (problema) return { erro: problema }
  if (nova !== confirmacao) return { erro: 'A confirmação não bate com a nova senha.' }
  if (nova === atual) return { erro: 'A nova senha precisa ser diferente da atual.' }

  // Trocar a senha encerra as outras sessões; esta continua aberta com a versão nova.
  const atualizado = await atualizarUsuario(sessao.id, { senhaHash: await gerarHashSenha(nova), trocarSenha: false }, { encerrarSessoes: true })
  if (atualizado) await salvarSessao(atualizado.id, atualizado.sessaoVersao)
  await registrarAuditoria('senha_trocada', sessao, { ip: ipDoPedido(await headers()) })
  return { ok: 'Senha trocada. As sessões em outros aparelhos foram encerradas.' }
}

export type Preparo2FA = { segredo: string; qr: string } | { erro: string }

/** Gera um segredo novo e o QR code. Só vale depois de confirmar com um código (ativar2FA). */
export async function preparar2FA(): Promise<Preparo2FA> {
  const sessao = await exigirSessaoPagina()
  if (sessao.doisFatores) return { erro: 'A verificação em duas etapas já está ligada.' }
  const segredo = novoSegredoTotp()
  const qr = await QRCode.toDataURL(uriTotp(segredo, sessao.usuario), { margin: 1, width: 220 })
  return { segredo, qr }
}

export async function ativar2FA(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const sessao = await exigirSessaoPagina()
  const segredo = String(formData.get('segredo') ?? '')
  const codigo = String(formData.get('codigo') ?? '')
  if (!/^[A-Z2-7]{32}$/.test(segredo)) return { erro: 'Gere o QR code de novo.' }
  if (!codigoTotpValido(segredo, codigo)) return { erro: 'Código incorreto. Confira se o horário do celular está automático.' }
  await atualizarUsuario(sessao.id, { totpSegredo: segredo })
  await registrarAuditoria('2fa_ligado', sessao, { ip: ipDoPedido(await headers()) })
  return { ok: 'Verificação em duas etapas ligada. No próximo login vamos pedir o código do app.' }
}

export async function desativar2FA(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const sessao = await exigirSessaoPagina()
  const conta = await buscarPorId(sessao.id)
  if (!conta?.totpSegredo) return { erro: 'A verificação em duas etapas já está desligada.' }
  if (!codigoTotpValido(conta.totpSegredo, String(formData.get('codigo') ?? ''))) return { erro: 'Código incorreto.' }
  await atualizarUsuario(sessao.id, { totpSegredo: null })
  await registrarAuditoria('2fa_desligado', sessao, { ip: ipDoPedido(await headers()) })
  return { ok: 'Verificação em duas etapas desligada.' }
}

export async function encerrarOutrasSessoes(): Promise<EstadoConta> {
  const sessao = await exigirSessaoPagina()
  const atualizado = await atualizarUsuario(sessao.id, {}, { encerrarSessoes: true })
  if (atualizado) await salvarSessao(atualizado.id, atualizado.sessaoVersao)
  await registrarAuditoria('sessoes_encerradas', sessao, { ip: ipDoPedido(await headers()) })
  return { ok: 'Pronto: só este aparelho continua conectado.' }
}
