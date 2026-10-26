import 'server-only'
import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from './auditoria'
import { restaurarConfig, salvarConfig } from './configuracoes'
import { type Bloco, BLOCOS, validarComoFunciona, validarComunidade, validarFaq, validarHero, validarHubcap, validarTutoriais } from './conteudo'
import type { SessaoEquipe } from './equipe'

export function blocoValido(valor: unknown): valor is Bloco {
  return typeof valor === 'string' && valor in BLOCOS
}

const VALIDACOES: { [B in Bloco]: { validar: (v: unknown) => unknown; erro: string } } = {
  conteudo_hero: { validar: validarHero, erro: 'Preencha título, subtítulo, os dois textos e os dois valores.' },
  tutoriais: {
    validar: validarTutoriais,
    erro: 'Cada passo precisa de título (3+ letras) e descrição (10+). O vídeo deve ser um link do YouTube ou um MP4 em https.',
  },
  faq: { validar: validarFaq, erro: 'Cada pergunta precisa de 5+ letras e cada resposta de 10+.' },
  conteudo_como_funciona: { validar: validarComoFunciona, erro: 'Preencha título e botão, e de 2 a 4 passos (título 3+ letras, descrição 10+).' },
  conteudo_hubcap: { validar: validarHubcap, erro: 'Preencha título, texto e botão. O link precisa começar com https:// (ou fique vazio).' },
  conteudo_comunidade: { validar: validarComunidade, erro: 'Preencha título, texto e botão.' },
}

/**
 * Valida e salva um bloco (ou restaura o original), registra na auditoria e revalida as páginas.
 * Chamada pela Server Action do editor: assim a resposta já traz a página atualizada.
 */
export async function salvarBloco(sessao: SessaoEquipe, bloco: Bloco, corpo: { valor?: unknown; restaurar?: boolean }) {
  try {
    if (corpo.restaurar) {
      await restaurarConfig(bloco)
      await registrarAuditoria('conteudo_restaurado', sessao, { detalhe: bloco })
    } else {
      const { validar, erro } = VALIDACOES[bloco]
      const valor = validar(corpo.valor)
      if (!valor) return { ok: false as const, erro }
      // O validador devolve exatamente o tipo da chave.
      await salvarConfig(bloco, valor as never, sessao.nome)
      await registrarAuditoria('conteudo_salvo', sessao, { detalhe: bloco })
    }
  } catch {
    return { ok: false as const, erro: 'Não foi possível salvar (banco indisponível).' }
  }
  revalidatePath('/')
  if (bloco === 'tutoriais') revalidatePath('/tutoriais')
  return { ok: true as const }
}
