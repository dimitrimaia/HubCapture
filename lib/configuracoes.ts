import 'server-only'
import { eq } from 'drizzle-orm'
import { configuracoes, getDb } from '@/db'
import { MODELOS_CADASTRO_PADRAO, MODELOS_COLAB_PADRAO, type ModeloMensagem } from './mensagens'
import { RESPOSTAS_PRONTAS_PADRAO, type RespostaPronta } from './respostas-prontas'
import {
  COMO_FUNCIONA_PADRAO,
  COMUNIDADE_PADRAO,
  type ConteudoComoFunciona,
  type ConteudoComunidade,
  type ConteudoHero,
  type ConteudoHubcap,
  HERO_PADRAO,
  HUBCAP_PADRAO,
  type Pergunta,
} from './conteudo'
import { faqs } from './site'
import { type TutorialStep, tutorialSteps } from './tutorials'

/**
 * Configurações editáveis pelo painel (/equipe/mensagens) e pelo modo "Editar página" do site, guardadas na tabela `configuracoes`.
 * Sem banco ou sem edição, vale o texto padrão do código. Cache de 60 s por instância para o
 * chat não consultar o banco a cada mensagem.
 */

type Chaves = {
  modelos_cadastro: ModeloMensagem[]
  modelos_colab: ModeloMensagem[]
  respostas_prontas: RespostaPronta[]
  conteudo_hero: ConteudoHero
  tutoriais: TutorialStep[]
  faq: Pergunta[]
  conteudo_como_funciona: ConteudoComoFunciona
  conteudo_hubcap: ConteudoHubcap
  conteudo_comunidade: ConteudoComunidade
}

const PADROES: Chaves = {
  modelos_cadastro: MODELOS_CADASTRO_PADRAO,
  modelos_colab: MODELOS_COLAB_PADRAO,
  respostas_prontas: RESPOSTAS_PRONTAS_PADRAO,
  conteudo_hero: HERO_PADRAO,
  tutoriais: tutorialSteps,
  faq: faqs,
  conteudo_como_funciona: COMO_FUNCIONA_PADRAO,
  conteudo_hubcap: HUBCAP_PADRAO,
  conteudo_comunidade: COMUNIDADE_PADRAO,
}

const CACHE_MS = 60_000
const cache = new Map<keyof Chaves, { valor: unknown; em: number }>()

/** `fresco`: ignora o cache da instância (páginas do site recém-editadas). */
export async function obterConfig<K extends keyof Chaves>(chave: K, { fresco = false } = {}): Promise<Chaves[K]> {
  const guardado = cache.get(chave)
  if (!fresco && guardado && Date.now() - guardado.em < CACHE_MS) return guardado.valor as Chaves[K]
  let valor: Chaves[K] = PADROES[chave]
  const db = getDb()
  if (db) {
    try {
      const [linha] = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave))
      if (linha?.valor) valor = linha.valor as Chaves[K]
    } catch (error) {
      console.error('[configuracoes]', error)
    }
  }
  cache.set(chave, { valor, em: Date.now() })
  return valor
}

/** Mostra também se o valor é o padrão (nunca editado) e quem editou por último. */
export async function obterConfigDetalhada<K extends keyof Chaves>(chave: K) {
  const db = getDb()
  const [linha] = db ? await db.select().from(configuracoes).where(eq(configuracoes.chave, chave)) : []
  return {
    valor: (linha?.valor as Chaves[K]) ?? PADROES[chave],
    padrao: PADROES[chave],
    editado: Boolean(linha),
    atualizadoEm: linha?.atualizadoEm?.toISOString() ?? null,
    atualizadoPor: linha?.atualizadoPor ?? null,
  }
}

export async function salvarConfig<K extends keyof Chaves>(chave: K, valor: Chaves[K], por: string) {
  const db = getDb()
  if (!db) throw new Error('Banco não configurado')
  await db
    .insert(configuracoes)
    .values({ chave, valor, atualizadoPor: por })
    .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date(), atualizadoPor: por } })
  cache.delete(chave)
}

/** Volta ao texto padrão do código. */
export async function restaurarConfig(chave: keyof Chaves) {
  const db = getDb()
  if (!db) throw new Error('Banco não configurado')
  await db.delete(configuracoes).where(eq(configuracoes.chave, chave))
  cache.delete(chave)
}

export type ChaveConfig = keyof Chaves
