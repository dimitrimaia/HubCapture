'use server'

import type { Bloco } from '@/lib/conteudo'
import { blocoValido, salvarBloco } from '@/lib/conteudo-servidor'
import { lerSessao } from '@/lib/equipe'

/**
 * Salva um bloco do site. É Server Action (e não fetch) de propósito: com o revalidatePath aqui
 * dentro, a resposta já traz a página atualizada, sem corrida com o cache da página estática.
 */
export async function salvarBlocoAcao(bloco: Bloco, corpo: { valor?: unknown; restaurar?: boolean }) {
  const sessao = await lerSessao()
  if (!sessao || sessao.papel !== 'admin') return { ok: false as const, erro: 'Só administradores podem editar o site.' }
  if (!blocoValido(bloco)) return { ok: false as const, erro: 'Bloco inválido.' }
  return salvarBloco(sessao, bloco, { valor: corpo.valor, restaurar: corpo.restaurar === true })
}
