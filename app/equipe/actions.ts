'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { falhasLoginRecentes, registrarAuditoria } from '@/lib/auditoria'
import { chaveInstalacaoCorreta, encerrarSessao, equipeConfigurada, lerSessao, salvarSessao } from '@/lib/equipe'
import { ipDoPedido } from '@/lib/ip'
import { HASH_FALSO, senhaConfere, validarNovaSenha } from '@/lib/senha'
import { codigoTotpValido } from '@/lib/totp'
import { buscarPorUsuario, contarUsuarios, criarUsuario, normalizarUsuario, registrarLogin, usuarioValido } from '@/lib/usuarios'

/** `usuario` e `pedirCodigo` voltam para o formulário: o React limpa os campos após cada envio. */
export type EstadoLogin = { erro?: string; usuario?: string; pedirCodigo?: boolean }

const LIMITE_FALHAS = 10

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const usuario = normalizarUsuario(String(formData.get('usuario') ?? ''))
  const senha = String(formData.get('senha') ?? '')
  const codigo = String(formData.get('codigo') ?? '')
  const ip = ipDoPedido(await headers())

  if ((await falhasLoginRecentes({ ip, usuario }).catch(() => 0)) >= LIMITE_FALHAS) {
    return { erro: 'Muitas tentativas erradas. Espere 15 minutos.', usuario }
  }

  const conta = await buscarPorUsuario(usuario).catch(() => null)
  // Sempre calcula um hash, mesmo sem conta: o tempo de resposta não revela quais logins existem.
  const senhaOk = await senhaConfere(senha, conta?.senhaHash ?? HASH_FALSO)
  if (!conta || !senhaOk || !conta.ativo) {
    await registrarAuditoria('login_falhou', null, { ip, detalhe: usuario })
    return { erro: conta && !conta.ativo && senhaOk ? 'Conta desativada. Fale com um administrador.' : 'Usuário ou senha incorretos.', usuario }
  }

  if (conta.totpSegredo) {
    if (!codigo) return { pedirCodigo: true, usuario }
    if (!codigoTotpValido(conta.totpSegredo, codigo)) {
      await registrarAuditoria('login_falhou', null, { ip, detalhe: usuario })
      return { erro: 'Código do autenticador incorreto.', pedirCodigo: true, usuario }
    }
  }

  await registrarLogin(conta.id)
  await registrarAuditoria('login', conta, { ip })
  await salvarSessao(conta.id, conta.sessaoVersao)
  redirect(conta.trocarSenha ? '/equipe/conta?trocar=1' : '/equipe/fila')
}

export type EstadoInstalacao = { erro?: string; nome?: string; usuario?: string }

/** Cria o primeiro administrador. Só funciona enquanto não existe nenhum usuário. */
export async function criarPrimeiroAdmin(_estado: EstadoInstalacao, formData: FormData): Promise<EstadoInstalacao> {
  const nome = String(formData.get('nome') ?? '').trim()
  const usuario = normalizarUsuario(String(formData.get('usuario') ?? ''))
  const senha = String(formData.get('senha') ?? '')
  const chave = String(formData.get('chave') ?? '')
  const ip = ipDoPedido(await headers())
  const volta = { nome, usuario }

  if (!equipeConfigurada()) return { ...volta, erro: 'Configure EQUIPE_SENHA (8+ caracteres) na Vercel primeiro.' }
  if ((await falhasLoginRecentes({ ip }).catch(() => 0)) >= LIMITE_FALHAS) return { ...volta, erro: 'Muitas tentativas. Espere 15 minutos.' }
  if ((await contarUsuarios()) !== 0) return { erro: 'O administrador já foi criado. Entre com seu usuário.' }
  if (!chaveInstalacaoCorreta(chave)) {
    await registrarAuditoria('login_falhou', null, { ip, detalhe: 'instalacao' })
    return { ...volta, erro: 'Chave de instalação incorreta (é o valor de EQUIPE_SENHA na Vercel).' }
  }
  if (nome.length < 2) return { ...volta, erro: 'Informe seu nome.' }
  if (!usuarioValido(usuario)) return { ...volta, erro: 'Usuário: 3 a 80 caracteres, sem espaços (pode ser seu e-mail).' }
  const problema = validarNovaSenha(senha)
  if (problema) return { ...volta, erro: problema }

  const criado = await criarUsuario({ nome, usuario, papel: 'admin', senha })
  if (!criado) return { ...volta, erro: 'Esse usuário já existe.' }
  await registrarAuditoria('usuario_criado', criado.usuario, { ip, detalhe: 'primeiro admin' })
  await salvarSessao(criado.usuario.id, criado.usuario.sessaoVersao)
  redirect('/equipe/conta?bemvindo=1')
}

export async function sair() {
  const sessao = await lerSessao()
  if (sessao) await registrarAuditoria('logout', sessao)
  await encerrarSessao()
  redirect('/equipe/login')
}
