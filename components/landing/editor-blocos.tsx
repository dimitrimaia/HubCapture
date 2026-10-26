'use client'

import { AlertTriangle, ArrowDown, ArrowUp, CircleCheck, Loader2, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PainelLateral } from '@/app/equipe/(painel)/ui'
import {
  type Bloco,
  BLOCOS,
  type ConteudoComoFunciona,
  type ConteudoComunidade,
  type ConteudoHero,
  type ConteudoHubcap,
  linkDoVideo,
  type Pergunta,
  videoDoLink,
} from '@/lib/conteudo'
import type { TutorialStep } from '@/lib/tutorials'
import { cn } from '@/lib/utils'
import { salvarBlocoAcao } from './acoes-edicao'
import { VideoEmbed } from './video-embed'

/** Editor lateral dos blocos do site (só admins chegam aqui; o servidor confere de novo ao salvar). */

const campo =
  'w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary aria-invalid:border-destructive'

function Campo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
      {rotulo}
      {children}
      {ajuda && <span className="font-normal">{ajuda}</span>}
    </label>
  )
}

function Ordenar({ indice, total, onMover, onRemover }: { indice: number; total: number; onMover: (de: number, para: number) => void; onRemover: () => void }) {
  const botao = 'flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30'
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" aria-label="Subir" className={botao} disabled={indice === 0} onClick={() => onMover(indice, indice - 1)}>
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Descer" className={botao} disabled={indice === total - 1} onClick={() => onMover(indice, indice + 1)}>
        <ArrowDown className="size-4" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Remover" className={cn(botao, 'hover:text-destructive')} disabled={total === 1} onClick={onRemover}>
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function mover<T>(lista: T[], de: number, para: number) {
  const nova = [...lista]
  const [item] = nova.splice(de, 1)
  nova.splice(para, 0, item)
  return nova
}

type Carregado = { valor: unknown; editado: boolean; atualizadoEm: string | null; atualizadoPor: string | null }

export function EditorBloco({ bloco, onFechar, onSalvo }: { bloco: Bloco; onFechar: () => void; onSalvo: () => void }) {
  const [dados, setDados] = useState<Carregado | null>(null)
  const [valor, setValor] = useState<unknown>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch(`/api/equipe/conteudo?bloco=${bloco}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) throw new Error(d.erro)
        setDados(d)
        setValor(d.valor)
      })
      .catch((e) => setErro(e?.message || 'Não foi possível carregar. Você precisa estar logado como administrador.'))
  }, [bloco])

  async function enviar(corpo: { valor?: unknown; restaurar?: boolean }) {
    setSalvando(true)
    setErro(null)
    const resposta = await salvarBlocoAcao(bloco, corpo).catch(() => null)
    setSalvando(false)
    if (resposta?.ok) onSalvo()
    else setErro(resposta?.erro ?? 'Não foi possível salvar.')
  }

  return (
    <PainelLateral aberto onFechar={onFechar} titulo={`Editar: ${BLOCOS[bloco]}`}>
      {!dados ? (
        erro ? (
          <p className="text-sm text-destructive">{erro}</p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
          </p>
        )
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            enviar({ valor })
          }}
        >
          {dados.editado && dados.atualizadoEm && (
            <p className="text-xs text-muted-foreground">
              Última edição: {new Date(dados.atualizadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              {dados.atualizadoPor ? ` por ${dados.atualizadoPor}` : ''}
            </p>
          )}

          {bloco === 'conteudo_hero' && <FormHero valor={valor as ConteudoHero} onChange={setValor} />}
          {bloco === 'tutoriais' && <FormTutoriais valor={valor as TutorialStep[]} onChange={setValor} />}
          {bloco === 'faq' && <FormFaq valor={valor as Pergunta[]} onChange={setValor} />}
          {bloco === 'conteudo_como_funciona' && <FormComoFunciona valor={valor as ConteudoComoFunciona} onChange={setValor} />}
          {bloco === 'conteudo_hubcap' && <FormHubcap valor={valor as ConteudoHubcap} onChange={setValor} />}
          {bloco === 'conteudo_comunidade' && <FormComunidade valor={valor as ConteudoComunidade} onChange={setValor} />}

          {erro && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          )}

          <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
            <button type="submit" disabled={salvando} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {salvando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Salvar e publicar
            </button>
            <button type="button" onClick={onFechar} className="h-10 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">
              Cancelar
            </button>
            {dados.editado && (
              <button
                type="button"
                disabled={salvando}
                onClick={() => window.confirm('Voltar este bloco ao texto original do site?') && enviar({ restaurar: true })}
                className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Restaurar original
              </button>
            )}
          </div>
        </form>
      )}
    </PainelLateral>
  )
}

function FormHero({ valor, onChange }: { valor: ConteudoHero; onChange: (v: ConteudoHero) => void }) {
  const set = (dados: Partial<ConteudoHero>) => onChange({ ...valor, ...dados })
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Título">
          <input className={campo} value={valor.titulo} maxLength={40} onChange={(e) => set({ titulo: e.target.value })} />
        </Campo>
        <Campo rotulo="Destaque (verde)">
          <input className={campo} value={valor.destaque} maxLength={40} onChange={(e) => set({ destaque: e.target.value })} />
        </Campo>
      </div>
      <Campo rotulo="Subtítulo">
        <input className={campo} value={valor.subtitulo} maxLength={120} onChange={(e) => set({ subtitulo: e.target.value })} />
      </Campo>
      <Campo rotulo="Texto no modo trabalho">
        <textarea className={campo} rows={4} value={valor.textoTrabalho} maxLength={400} onChange={(e) => set({ textoTrabalho: e.target.value })} />
      </Campo>
      <Campo rotulo="Texto no modo casa">
        <textarea className={campo} rows={4} value={valor.textoCasa} maxLength={400} onChange={(e) => set({ textoCasa: e.target.value })} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Valor/h (trabalho)">
          <input className={campo} value={valor.valorTrabalho} maxLength={12} onChange={(e) => set({ valorTrabalho: e.target.value })} />
        </Campo>
        <Campo rotulo="Valor/h (casa)">
          <input className={campo} value={valor.valorCasa} maxLength={12} onChange={(e) => set({ valorCasa: e.target.value })} />
        </Campo>
      </div>
      <Campo rotulo="Destaques com ✓" ajuda="Um por linha, até 5.">
        <textarea
          className={campo}
          rows={3}
          value={valor.destaques.join('\n')}
          onChange={(e) => set({ destaques: e.target.value.split('\n').slice(0, 5) })}
        />
      </Campo>
    </>
  )
}

function FormTutoriais({ valor, onChange }: { valor: TutorialStep[]; onChange: (v: TutorialStep[]) => void }) {
  // O link digitado fica separado: só vira youtubeId/videoUrl quando é reconhecido.
  const [links, setLinks] = useState(() => valor.map(linkDoVideo))

  function set(indice: number, dados: Partial<TutorialStep>) {
    onChange(valor.map((p, i) => (i === indice ? { ...p, ...dados } : p)))
  }
  function setLink(indice: number, link: string) {
    setLinks((atual) => atual.map((l, i) => (i === indice ? link : l)))
    const video = videoDoLink(link)
    // Link não reconhecido: guarda como está para o servidor recusar com a mensagem certa.
    const { youtubeId: _y, videoUrl: _v, ...resto } = valor[indice]
    onChange(valor.map((p, i) => (i === indice ? { ...resto, ...(video ?? { videoUrl: link }) } : p)))
  }

  return (
    <>
      <a
        href="https://www.youtube.com/upload"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border text-sm hover:bg-foreground/5"
      >
        <Upload className="size-4" aria-hidden="true" />
        Enviar vídeo no YouTube Studio
      </a>
      <p className="text-xs text-muted-foreground">
        No YouTube Studio: <strong>Criar → Enviar vídeos</strong>, escolha a visibilidade <strong>Não listado</strong> (ou Público, que ajuda no
        Google) e copie o link. Hospedagem grátis e sem pesar o site.
      </p>
      <p className="text-sm text-muted-foreground">
        Os passos aparecem na página inicial, em /tutoriais e no tutorial do chat. Para o vídeo, cole o link do YouTube (pode ser{' '}
        <em>Não listado</em>) ou o link de um MP4.
      </p>
      <ol className="flex flex-col gap-4">
        {valor.map((passo, i) => {
          const link = links[i] ?? ''
          const invalido = Boolean(link.trim()) && !videoDoLink(link)
          return (
            <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold tracking-[0.15em] text-primary uppercase">Passo {i + 1}</span>
                <Ordenar
                  indice={i}
                  total={valor.length}
                  onMover={(de, para) => {
                    onChange(mover(valor, de, para))
                    setLinks((atual) => mover(atual, de, para))
                  }}
                  onRemover={() => {
                    onChange(valor.filter((_, j) => j !== i))
                    setLinks((atual) => atual.filter((_, j) => j !== i))
                  }}
                />
              </div>
              <Campo rotulo="Título">
                <input className={campo} value={passo.title} maxLength={120} onChange={(e) => set(i, { title: e.target.value })} />
              </Campo>
              <Campo rotulo="Descrição">
                <textarea className={campo} rows={4} value={passo.description} maxLength={1500} onChange={(e) => set(i, { description: e.target.value })} />
              </Campo>
              <Campo rotulo="Vídeo" ajuda={invalido ? 'Link não reconhecido. Use youtube.com/watch?v=…, youtu.be/…, /shorts/… ou um .mp4 em https.' : undefined}>
                <input
                  className={campo}
                  value={link}
                  aria-invalid={invalido || undefined}
                  placeholder="https://youtu.be/…"
                  inputMode="url"
                  onChange={(e) => setLink(i, e.target.value)}
                />
              </Campo>
              {!invalido && passo.youtubeId && (
                <InfoYoutube id={passo.youtubeId} usarTitulo={passo.title.trim() ? undefined : (titulo) => set(i, { title: titulo.slice(0, 120) })} />
              )}
              {!invalido && (passo.youtubeId || passo.videoUrl) && <VideoEmbed title={passo.title} youtubeId={passo.youtubeId} videoUrl={passo.videoUrl} />}
            </li>
          )
        })}
      </ol>
      {valor.length < 20 && (
        <button
          type="button"
          onClick={() => {
            onChange([...valor, { title: '', description: '' }])
            setLinks((atual) => [...atual, ''])
          }}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dashed border-border text-sm hover:bg-foreground/5"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar passo
        </button>
      )}
    </>
  )
}

function FormFaq({ valor, onChange }: { valor: Pergunta[]; onChange: (v: Pergunta[]) => void }) {
  const set = (indice: number, dados: Partial<Pergunta>) => onChange(valor.map((p, i) => (i === indice ? { ...p, ...dados } : p)))
  return (
    <>
      <p className="text-sm text-muted-foreground">As perguntas também alimentam o Google (resultado com FAQ) e o assistente do chat.</p>
      <ol className="flex flex-col gap-4">
        {valor.map((p, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pergunta {i + 1}</span>
              <Ordenar indice={i} total={valor.length} onMover={(de, para) => onChange(mover(valor, de, para))} onRemover={() => onChange(valor.filter((_, j) => j !== i))} />
            </div>
            <input className={campo} aria-label="Pergunta" value={p.question} maxLength={200} onChange={(e) => set(i, { question: e.target.value })} />
            <textarea className={campo} aria-label="Resposta" rows={4} value={p.answer} maxLength={2000} onChange={(e) => set(i, { answer: e.target.value })} />
          </li>
        ))}
      </ol>
      {valor.length < 40 && (
        <button
          type="button"
          onClick={() => onChange([...valor, { question: '', answer: '' }])}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dashed border-border text-sm hover:bg-foreground/5"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar pergunta
        </button>
      )}
    </>
  )
}

/** Lista curta de textos, um por linha (vantagens, benefícios). */
function CampoLista({ rotulo, valor, max, onChange }: { rotulo: string; valor: string[]; max: number; onChange: (v: string[]) => void }) {
  return (
    <Campo rotulo={rotulo} ajuda={`Um por linha, até ${max}.`}>
      <textarea className={campo} rows={max} value={valor.join('\n')} onChange={(e) => onChange(e.target.value.split('\n').slice(0, max))} />
    </Campo>
  )
}

function FormComoFunciona({ valor, onChange }: { valor: ConteudoComoFunciona; onChange: (v: ConteudoComoFunciona) => void }) {
  const set = (dados: Partial<ConteudoComoFunciona>) => onChange({ ...valor, ...dados })
  const setPasso = (i: number, dados: Partial<ConteudoComoFunciona['passos'][number]>) =>
    set({ passos: valor.passos.map((p, j) => (j === i ? { ...p, ...dados } : p)) })
  return (
    <>
      <Campo rotulo="Título">
        <input className={campo} value={valor.titulo} maxLength={120} onChange={(e) => set({ titulo: e.target.value })} />
      </Campo>
      <Campo rotulo="Subtítulo">
        <textarea className={campo} rows={2} value={valor.subtitulo} maxLength={300} onChange={(e) => set({ subtitulo: e.target.value })} />
      </Campo>
      <ol className="flex flex-col gap-4">
        {valor.passos.map((p, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-[0.15em] text-primary uppercase">Passo 0{i + 1}</span>
              <Ordenar
                indice={i}
                total={valor.passos.length}
                onMover={(de, para) => set({ passos: mover(valor.passos, de, para) })}
                onRemover={() => valor.passos.length > 2 && set({ passos: valor.passos.filter((_, j) => j !== i) })}
              />
            </div>
            <input className={campo} aria-label="Título do passo" value={p.titulo} maxLength={60} onChange={(e) => setPasso(i, { titulo: e.target.value })} />
            <textarea className={campo} aria-label="Descrição do passo" rows={3} value={p.descricao} maxLength={300} onChange={(e) => setPasso(i, { descricao: e.target.value })} />
          </li>
        ))}
      </ol>
      {valor.passos.length < 4 && (
        <button
          type="button"
          onClick={() => set({ passos: [...valor.passos, { titulo: '', descricao: '' }] })}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dashed border-border text-sm hover:bg-foreground/5"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar passo
        </button>
      )}
      <Campo rotulo="Texto do botão">
        <input className={campo} value={valor.botao} maxLength={40} onChange={(e) => set({ botao: e.target.value })} />
      </Campo>
    </>
  )
}

function FormHubcap({ valor, onChange }: { valor: ConteudoHubcap; onChange: (v: ConteudoHubcap) => void }) {
  const set = (dados: Partial<ConteudoHubcap>) => onChange({ ...valor, ...dados })
  return (
    <>
      <Campo rotulo="Chamada (acima do título)">
        <input className={campo} value={valor.chamada} maxLength={60} onChange={(e) => set({ chamada: e.target.value })} />
      </Campo>
      <Campo rotulo="Título">
        <input className={campo} value={valor.titulo} maxLength={80} onChange={(e) => set({ titulo: e.target.value })} />
      </Campo>
      <Campo rotulo="Destaque (verde)">
        <input className={campo} value={valor.destaque} maxLength={100} onChange={(e) => set({ destaque: e.target.value })} />
      </Campo>
      <Campo rotulo="Texto">
        <textarea className={campo} rows={4} value={valor.texto} maxLength={500} onChange={(e) => set({ texto: e.target.value })} />
      </Campo>
      <CampoLista rotulo="Vantagens" valor={valor.vantagens} max={3} onChange={(vantagens) => set({ vantagens })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Texto do botão">
          <input className={campo} value={valor.botao} maxLength={50} onChange={(e) => set({ botao: e.target.value })} />
        </Campo>
        <Campo rotulo="Link do botão" ajuda="Vazio = link oficial do Mercado Livre.">
          <input className={campo} value={valor.link} inputMode="url" placeholder="https://…" maxLength={300} onChange={(e) => set({ link: e.target.value })} />
        </Campo>
      </div>
      <Campo rotulo="Rodapé">
        <input className={campo} value={valor.rodape} maxLength={120} onChange={(e) => set({ rodape: e.target.value })} />
      </Campo>
    </>
  )
}

function FormComunidade({ valor, onChange }: { valor: ConteudoComunidade; onChange: (v: ConteudoComunidade) => void }) {
  const set = (dados: Partial<ConteudoComunidade>) => onChange({ ...valor, ...dados })
  return (
    <>
      <p className="text-sm text-muted-foreground">Os links da comunidade e do Instagram vêm da configuração do site e não mudam aqui.</p>
      <Campo rotulo="Título">
        <input className={campo} value={valor.titulo} maxLength={120} onChange={(e) => set({ titulo: e.target.value })} />
      </Campo>
      <Campo rotulo="Texto">
        <textarea className={campo} rows={4} value={valor.texto} maxLength={500} onChange={(e) => set({ texto: e.target.value })} />
      </Campo>
      <CampoLista rotulo="Benefícios" valor={valor.beneficios} max={3} onChange={(beneficios) => set({ beneficios })} />
      <Campo rotulo="Texto do botão">
        <input className={campo} value={valor.botao} maxLength={40} onChange={(e) => set({ botao: e.target.value })} />
      </Campo>
      <Campo rotulo="Texto do cartão do Instagram">
        <textarea className={campo} rows={3} value={valor.instagramTexto} maxLength={300} onChange={(e) => set({ instagramTexto: e.target.value })} />
      </Campo>
    </>
  )
}

/** Confere o vídeo no YouTube (título e canal) e avisa se está privado ou não existe. */
function InfoYoutube({ id, usarTitulo }: { id: string; usarTitulo?: (titulo: string) => void }) {
  const [info, setInfo] = useState<{ ok: boolean; titulo?: string; canal?: string; erro?: string } | null>(null)
  useEffect(() => {
    setInfo(null)
    const espera = setTimeout(() => {
      fetch(`/api/equipe/youtube?id=${id}`)
        .then((r) => r.json())
        .then(setInfo)
        .catch(() => setInfo({ ok: false, erro: 'Não foi possível conferir o vídeo agora.' }))
    }, 400)
    return () => clearTimeout(espera)
  }, [id])

  if (!info)
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Conferindo no YouTube…
      </p>
    )
  if (!info.ok)
    return (
      <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" /> {info.erro}
      </p>
    )
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <CircleCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 truncate">
        <strong className="text-foreground">{info.titulo}</strong> · {info.canal}
      </span>
      {usarTitulo && info.titulo && (
        <button type="button" onClick={() => usarTitulo(info.titulo!)} className="text-primary underline">
          usar como título
        </button>
      )}
    </p>
  )
}
