'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { encerrarSessao, equipeConfigurada, loginBloqueado, registrarFalhaLogin, salvarSessao, senhaCorreta } from '@/lib/equipe'
import { ipDoPedido } from '@/lib/ip'

/** `nome` volta para o formulário: o React limpa os campos após cada envio e não queremos redigitar. */
export type EstadoLogin = { erro?: string; nome?: string }

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  if (!equipeConfigurada()) return { erro: 'Configure EQUIPE_SENHA (mínimo 8 caracteres) na Vercel.' }
  const nome = String(formData.get('nome') ?? '').trim().slice(0, 40)
  const senha = String(formData.get('senha') ?? '')
  const ip = ipDoPedido(await headers())
  if (loginBloqueado(ip)) return { erro: 'Muitas tentativas. Espere 15 minutos.', nome }
  if (nome.length < 2) return { erro: 'Informe seu nome (aparece em "chamado por").', nome }
  if (!senhaCorreta(senha)) {
    registrarFalhaLogin(ip)
    return { erro: 'Senha incorreta.', nome }
  }

  await salvarSessao(nome)
  redirect('/equipe/leads')
}

export async function sair() {
  await encerrarSessao()
  redirect('/equipe/login')
}
