'use server'

import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from '@/lib/auditoria'
import { restaurarConfig, salvarConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { validarModelos } from '@/lib/mensagens'
import { validarRespostas } from '@/lib/respostas-prontas'

export type EstadoMensagens = { ok?: string; erro?: string }

type Chave = 'modelos_cadastro' | 'modelos_colab' | 'respostas_prontas'

export async function salvarMensagens(chave: Chave, valor: unknown): Promise<EstadoMensagens> {
  const sessao = await exigirSessaoPagina('admin')
  if (chave === 'respostas_prontas') {
    const lista = validarRespostas(valor)
    if (!lista) return { erro: 'Cada resposta precisa de pelo menos um gatilho e um texto.' }
    await salvarConfig(chave, lista, sessao.nome)
  } else {
    const modelos = validarModelos(valor)
    if (!modelos) return { erro: 'Cada mensagem precisa de um nome e de um texto (mínimo 10 caracteres). Máximo 12 mensagens.' }
    await salvarConfig(chave, modelos, sessao.nome)
  }
  await registrarAuditoria('config_salva', sessao, { detalhe: chave })
  revalidatePath('/equipe', 'layout')
  return { ok: 'Salvo. Já vale para toda a equipe e para o chat.' }
}

export async function restaurarMensagens(chave: Chave): Promise<EstadoMensagens> {
  const sessao = await exigirSessaoPagina('admin')
  await restaurarConfig(chave)
  await registrarAuditoria('config_restaurada', sessao, { detalhe: chave })
  revalidatePath('/equipe', 'layout')
  return { ok: 'Textos padrão restaurados.' }
}
