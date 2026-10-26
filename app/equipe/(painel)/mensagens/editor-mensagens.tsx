'use client'

import { ArrowDown, ArrowUp, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { MARCADORES, type ModeloMensagem, preencherMensagem } from '@/lib/mensagens'
import type { RespostaPronta } from '@/lib/respostas-prontas'
import { cn } from '@/lib/utils'
import { type EstadoMensagens, restaurarMensagens, salvarMensagens } from './actions'

type Detalhe<T> = { valor: T; editado: boolean; atualizadoEm: string | null; atualizadoPor: string | null }

const campo =
  'w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary'

function Rodape({
  estado,
  salvando,
  editado,
  atualizadoEm,
  atualizadoPor,
  onSalvar,
  onRestaurar,
}: {
  estado: EstadoMensagens
  salvando: boolean
  editado: boolean
  atualizadoEm: string | null
  atualizadoPor: string | null
  onSalvar: () => void
  onRestaurar: () => void
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
      <button
        type="button"
        onClick={onSalvar}
        disabled={salvando}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {salvando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        Salvar
      </button>
      {editado && (
        <button
          type="button"
          onClick={() => window.confirm('Voltar aos textos padrão? As edições serão perdidas.') && onRestaurar()}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Restaurar padrão
        </button>
      )}
      <span className="text-xs text-muted-foreground">
        {editado && atualizadoEm
          ? `Editado por ${atualizadoPor} em ${new Date(atualizadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })}`
          : 'Usando o texto padrão'}
      </span>
      {estado.erro && <p role="alert" className="w-full text-sm text-destructive">{estado.erro}</p>}
      {estado.ok && <p role="status" className="w-full text-sm text-primary">{estado.ok}</p>}
    </div>
  )
}

function EditorModelos({ chave, titulo, descricao, detalhe }: { chave: 'modelos_cadastro' | 'modelos_colab'; titulo: string; descricao: string; detalhe: Detalhe<ModeloMensagem[]> }) {
  const [modelos, setModelos] = useState(detalhe.valor)
  const [estado, setEstado] = useState<EstadoMensagens>({})
  const [salvando, iniciar] = useTransition()

  function mudar(i: number, dados: Partial<ModeloMensagem>) {
    setModelos((atual) => atual.map((m, j) => (j === i ? { ...m, ...dados } : m)))
  }
  function mover(i: number, delta: number) {
    setModelos((atual) => {
      const copia = [...atual]
      const [item] = copia.splice(i, 1)
      copia.splice(i + delta, 0, item)
      return copia
    })
  }

  return (
    <section className="rounded-3xl border border-border bg-card/60 p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      <p className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
        Marcadores:
        {MARCADORES.map((m) => (
          <code key={m} className="rounded bg-foreground/[0.06] px-1.5 py-0.5">
            {m}
          </code>
        ))}
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {modelos.map((modelo, i) => (
          <li key={i} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-primary">#{i + 1}</span>
              <input
                value={modelo.rotulo}
                onChange={(e) => mudar(i, { rotulo: e.target.value })}
                aria-label={`Nome da mensagem ${i + 1}`}
                placeholder="Nome (ex.: Boas-vindas)"
                className={cn(campo, 'h-9 flex-1')}
              />
              <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30">
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Descer" disabled={i === modelos.length - 1} onClick={() => mover(i, 1)} className="flex size-9 items-center justify-center rounded-full border border-border disabled:opacity-30">
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Remover"
                disabled={modelos.length === 1}
                onClick={() => setModelos((atual) => atual.filter((_, j) => j !== i))}
                className="flex size-9 items-center justify-center rounded-full border border-border text-destructive disabled:opacity-30"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
            <textarea value={modelo.texto} onChange={(e) => mudar(i, { texto: e.target.value })} rows={3} aria-label={`Texto da mensagem ${i + 1}`} className={cn(campo, 'mt-2 resize-y')} />
            <p className="mt-2 rounded-xl bg-foreground/[0.04] p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Prévia: </span>
              {preencherMensagem(modelo.texto, { nome: 'Maria', atendente: 'Dimitri' })}
            </p>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setModelos((atual) => [...atual, { id: `modelo-${Date.now().toString(36)}`, rotulo: '', texto: '' }])}
        disabled={modelos.length >= 12}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-dashed border-foreground/20 px-4 text-sm"
      >
        <Plus className="size-4" aria-hidden="true" />
        Adicionar mensagem
      </button>
      <Rodape
        estado={estado}
        salvando={salvando}
        editado={detalhe.editado}
        atualizadoEm={detalhe.atualizadoEm}
        atualizadoPor={detalhe.atualizadoPor}
        onSalvar={() => iniciar(async () => setEstado(await salvarMensagens(chave, modelos)))}
        onRestaurar={() =>
          iniciar(async () => {
            setEstado(await restaurarMensagens(chave))
            window.location.reload()
          })
        }
      />
    </section>
  )
}

function EditorRespostas({ detalhe }: { detalhe: Detalhe<RespostaPronta[]> }) {
  const [itens, setItens] = useState(detalhe.valor.map((r) => ({ ...r, gatilhosTexto: r.gatilhos.join('\n') })))
  const [estado, setEstado] = useState<EstadoMensagens>({})
  const [salvando, iniciar] = useTransition()

  function mudar(i: number, dados: Partial<(typeof itens)[number]>) {
    setItens((atual) => atual.map((r, j) => (j === i ? { ...r, ...dados } : r)))
  }

  return (
    <section className="rounded-3xl border border-border bg-card/60 p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Respostas prontas do chat</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Saem na hora e não gastam a cota do Gemini. Valem quando a pergunta (sem acentos e pontuação) é igual a um dos gatilhos. Use{' '}
        <code className="rounded bg-foreground/[0.06] px-1">{'{tutorial_completo}'}</code> para inserir o passo a passo. Links:{' '}
        <code className="rounded bg-foreground/[0.06] px-1">[texto](https://…)</code>.
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {itens.map((item, i) => (
          <li key={i} className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Gatilhos (um por linha)
              <textarea value={item.gatilhosTexto} onChange={(e) => mudar(i, { gatilhosTexto: e.target.value })} rows={5} className={cn(campo, 'resize-y')} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Resposta
              <textarea value={item.resposta} onChange={(e) => mudar(i, { resposta: e.target.value })} rows={5} className={cn(campo, 'resize-y')} />
            </label>
            <button
              type="button"
              onClick={() => setItens((atual) => atual.filter((_, j) => j !== i))}
              className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-border px-3 text-xs text-destructive md:col-span-2"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remover
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setItens((atual) => [...atual, { id: `resposta-${Date.now().toString(36)}`, gatilhos: [], gatilhosTexto: '', resposta: '' }])}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-dashed border-foreground/20 px-4 text-sm"
      >
        <Plus className="size-4" aria-hidden="true" />
        Adicionar resposta
      </button>
      <Rodape
        estado={estado}
        salvando={salvando}
        editado={detalhe.editado}
        atualizadoEm={detalhe.atualizadoEm}
        atualizadoPor={detalhe.atualizadoPor}
        onSalvar={() =>
          iniciar(async () =>
            setEstado(
              await salvarMensagens(
                'respostas_prontas',
                itens.map(({ id, gatilhosTexto, resposta }) => ({ id, gatilhos: gatilhosTexto.split('\n'), resposta })),
              ),
            ),
          )
        }
        onRestaurar={() =>
          iniciar(async () => {
            setEstado(await restaurarMensagens('respostas_prontas'))
            window.location.reload()
          })
        }
      />
    </section>
  )
}

export function EditorMensagens({
  cadastro,
  colab,
  respostas,
}: {
  cadastro: Detalhe<ModeloMensagem[]>
  colab: Detalhe<ModeloMensagem[]>
  respostas: Detalhe<RespostaPronta[]>
}) {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <EditorModelos
        chave="modelos_cadastro"
        titulo="Chamadas de Cadastro"
        descricao="A Fila de chamadas usa as 3 primeiras, na ordem: 1º contato, 2º contato e 3º contato."
        detalhe={cadastro}
      />
      <EditorModelos chave="modelos_colab" titulo="Chamadas de Colab" descricao="Mensagens para os influencers inscritos." detalhe={colab} />
      <EditorRespostas detalhe={respostas} />
    </div>
  )
}
