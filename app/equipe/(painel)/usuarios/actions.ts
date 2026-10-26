'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from '@/lib/auditoria'
import { exigirSessaoPagina, type Papel } from '@/lib/equipe'
import { ipDoPedido } from '@/lib/ip'
import {
  atualizarUsuario,
  buscarPorId,
  criarUsuario,
  normalizarUsuario,
  outrosAdminsAtivos,
  redefinirSenha,
  usuarioValido,
} from '@/lib/usuarios'

export type EstadoUsuarios = { ok?: string; erro?: string; senhaTemporaria?: string; para?: string }

async function admin() {
  return exigirSessaoPagina('admin')
}

export async function criarConta(_estado: EstadoUsuarios, formData: FormData): Promise<EstadoUsuarios> {
  const sessao = await admin()
  const nome = String(formData.get('nome') ?? '').trim()
  const usuario = normalizarUsuario(String(formData.get('usuario') ?? ''))
  const papel: Papel = formData.get('papel') === 'admin' ? 'admin' : 'equipe'
  if (nome.length < 2) return { erro: 'Informe o nome.' }
  if (!usuarioValido(usuario)) return { erro: 'Usuário: 3 a 80 caracteres, sem espaços (pode ser o e-mail).' }

  const criado = await criarUsuario({ nome, usuario, papel })
  if (!criado) return { erro: 'Esse usuário já existe.' }
  await registrarAuditoria('usuario_criado', sessao, { ip: ipDoPedido(await headers()), detalhe: `${usuario} (${papel})` })
  revalidatePath('/equipe/usuarios')
  return { ok: `Conta de ${nome} criada.`, senhaTemporaria: criado.senhaTemporaria ?? undefined, para: usuario }
}

/** Ações por usuário: papel, ativar/desativar, nova senha, tirar 2FA, encerrar sessões. */
export async function gerenciarConta(_estado: EstadoUsuarios, formData: FormData): Promise<EstadoUsuarios> {
  const sessao = await admin()
  const id = String(formData.get('id') ?? '')
  const acao = String(formData.get('acao') ?? '')
  const alvo = await buscarPorId(id)
  if (!alvo) return { erro: 'Usuário não encontrado.' }
  const proprio = alvo.id === sessao.id
  const ip = ipDoPedido(await headers())

  let resultado: EstadoUsuarios
  switch (acao) {
    case 'tornar-admin':
    case 'tornar-equipe': {
      const papel: Papel = acao === 'tornar-admin' ? 'admin' : 'equipe'
      if (papel === 'equipe' && (proprio || (await outrosAdminsAtivos(alvo.id)) === 0)) {
        return { erro: proprio ? 'Você não pode tirar o seu próprio acesso de admin.' : 'Precisa sobrar pelo menos um admin ativo.' }
      }
      await atualizarUsuario(alvo.id, { papel }, { encerrarSessoes: true })
      resultado = { ok: `${alvo.nome} agora é ${papel === 'admin' ? 'administrador' : 'equipe'}.` }
      break
    }
    case 'desativar':
      if (proprio) return { erro: 'Você não pode desativar a própria conta.' }
      if (alvo.papel === 'admin' && (await outrosAdminsAtivos(alvo.id)) === 0) return { erro: 'Precisa sobrar pelo menos um admin ativo.' }
      await atualizarUsuario(alvo.id, { ativo: false }, { encerrarSessoes: true })
      resultado = { ok: `${alvo.nome} foi desativado e desconectado.` }
      break
    case 'ativar':
      await atualizarUsuario(alvo.id, { ativo: true })
      resultado = { ok: `${alvo.nome} foi reativado.` }
      break
    case 'nova-senha': {
      const temporaria = await redefinirSenha(alvo.id)
      resultado = { ok: `Senha de ${alvo.nome} redefinida.`, senhaTemporaria: temporaria ?? undefined, para: alvo.usuario }
      break
    }
    case 'tirar-2fa':
      await atualizarUsuario(alvo.id, { totpSegredo: null }, { encerrarSessoes: true })
      resultado = { ok: `Verificação em duas etapas de ${alvo.nome} removida. Peça para ligar de novo.` }
      break
    case 'encerrar-sessoes':
      await atualizarUsuario(alvo.id, {}, { encerrarSessoes: true })
      resultado = { ok: `Sessões de ${alvo.nome} encerradas.` }
      break
    default:
      return { erro: 'Ação inválida.' }
  }
  await registrarAuditoria(`usuario_${acao}`, sessao, { ip, detalhe: alvo.usuario })
  revalidatePath('/equipe/usuarios')
  return resultado
}
