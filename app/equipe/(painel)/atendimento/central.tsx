'use client'

import { AlertTriangle, ArrowLeft, Bot, CheckCheck, Globe, Hand, Headset, Loader2, RotateCcw, Search, SendHorizontal, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import { type ModeloMensagem, preencherMensagem } from '@/lib/mensagens'
import { cn } from '@/lib/utils'
import { dataCurta, haQuanto, Selo } from '../ui'

type Item = {
  id: string
  canal: 'site' | 'whatsapp'
  nome: string
  telefone: string | null
  status: 'bot' | 'aguardando' | 'humano' | 'resolvida'
  atendente: string | null
  meu: boolean
  naoLidas: number
  ultimaMensagem: string | null
  ultimaMensagemEm: string
  temCadastro: boolean
  janelaAberta: boolean
}
type Contagem = { fila: number; meus: number; meusNaoLidas: number; humano: number; bot24h: number } | null
type Detalhe = Omit<Item, 'naoLidas' | 'ultimaMensagem' | 'ultimaMensagemEm' | 'temCadastro'> & {
  whatsapp: string | null
  leadId: string | null
  criadoEm: string
  janelaFechaEm: string | null
}
type Mensagem = { id: string; autor: 'cliente' | 'bot' | 'atendente' | 'sistema'; autorNome: string | null; texto: string; erro: string | null; em: string }

const ABAS = [
  { id: 'fila', rotulo: 'Na fila' },
  { id: 'meus', rotulo: 'Minhas' },
  { id: 'humano', rotulo: 'Com a equipe' },
  { id: 'bot', rotulo: 'Com o robô' },
  { id: 'resolvida', rotulo: 'Resolvidas' },
  { id: 'todas', rotulo: 'Todas' },
] as const

const STATUS: Record<Item['status'], { rotulo: string; tom: 'neutro' | 'verde' | 'vermelho' | 'amarelo' }> = {
  bot: { rotulo: 'Robô', tom: 'neutro' },
  aguardando: { rotulo: 'Na fila', tom: 'vermelho' },
  humano: { rotulo: 'Com a equipe', tom: 'amarelo' },
  resolvida: { rotulo: 'Resolvida', tom: 'verde' },
}

function IconeCanal({ canal, className }: { canal: Item['canal']; className?: string }) {
  return canal === 'whatsapp' ? <WhatsappIcon className={cn('text-primary', className)} /> : <Globe className={cn('text-muted-foreground', className)} aria-hidden="true" />
}

function contagemDaAba(id: string, c: Contagem) {
  if (!c) return null
  if (id === 'fila') return c.fila
  if (id === 'meus') return c.meus
  if (id === 'humano') return c.humano
  return null
}

/** Atualiza a cada `ms` enquanto a aba do navegador está visível. */
function useAtualizar(fn: () => void, ms: number, deps: unknown[]) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    ref.current()
    const intervalo = setInterval(() => document.visibilityState === 'visible' && ref.current(), ms)
    const aoVoltar = () => document.visibilityState === 'visible' && ref.current()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function CentralAtendimento({ modelos, atendente, inicial }: { modelos: ModeloMensagem[]; atendente: string; inicial: string | null }) {
  const [aba, setAba] = useState<(typeof ABAS)[number]['id']>('fila')
  const [canal, setCanal] = useState('')
  const [busca, setBusca] = useState('')
  const [itens, setItens] = useState<Item[] | null>(null)
  const [contagem, setContagem] = useState<Contagem>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aberta, setAberta] = useState<string | null>(inicial)

  useAtualizar(
    async () => {
      const p = new URLSearchParams({ filtro: aba })
      if (canal) p.set('canal', canal)
      if (busca.trim()) p.set('q', busca.trim())
      const r = await fetch(`/api/equipe/atendimento?${p}`, { cache: 'no-store' }).catch(() => null)
      const dados = await r?.json().catch(() => null)
      if (!dados?.ok) return setErro(dados?.erro ?? 'Não foi possível carregar as conversas.')
      setErro(null)
      setItens(dados.itens)
      setContagem(dados.contagem)
    },
    5000,
    [aba, canal, busca],
  )

  // Título da aba do navegador avisa quantas pessoas estão esperando.
  useEffect(() => {
    const base = 'Atendimento | Hub Capture'
    document.title = contagem?.fila ? `(${contagem.fila}) ${base}` : base
  }, [contagem?.fila])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (aberta) url.searchParams.set('c', aberta)
    else url.searchParams.delete('c')
    window.history.replaceState(null, '', url)
  }, [aberta])

  return (
    <div className="mt-4 grid h-[calc(100dvh-11rem)] min-h-[30rem] overflow-hidden rounded-2xl border border-border bg-card/60 lg:h-[calc(100dvh-10rem)] lg:grid-cols-[22rem_minmax(0,1fr)]">
      {/* Lista */}
      <section aria-label="Conversas" className={cn('flex min-h-0 flex-col border-border lg:border-r', aberta && 'max-lg:hidden')}>
        <div className="flex flex-col gap-2 border-b border-border p-3">
          <nav aria-label="Filtro" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
            {ABAS.map((a) => {
              const n = contagemDaAba(a.id, contagem)
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  aria-pressed={aba === a.id}
                  className={cn(
                    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs transition-colors',
                    aba === a.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                  )}
                >
                  {a.rotulo}
                  {n ? (
                    <span className={cn('rounded-full px-1.5 text-[10px] font-bold tabular-nums', aba === a.id ? 'bg-primary-foreground/20' : a.id === 'fila' ? 'bg-destructive text-white' : 'bg-foreground/10')}>
                      {n}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Buscar conversa</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, número ou texto"
                className="h-9 w-full rounded-lg border border-input bg-background/60 pr-2 pl-8 text-sm outline-none focus-visible:border-primary"
              />
            </label>
            <select
              aria-label="Canal"
              value={canal}
              onChange={(e) => setCanal(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background/60 px-2 text-sm outline-none focus-visible:border-primary"
            >
              <option value="">Todos</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="site">Site</option>
            </select>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {erro ? (
            <p className="p-4 text-sm text-destructive">{erro}</p>
          ) : !itens ? (
            <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
            </p>
          ) : itens.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {aba === 'fila' ? 'Ninguém esperando atendimento agora. 🎉' : 'Nenhuma conversa aqui.'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {itens.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setAberta(item.id)}
                    aria-current={aberta === item.id ? 'true' : undefined}
                    className={cn('flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]', aberta === item.id && 'bg-primary/10')}
                  >
                    <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06]">
                      <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-card">
                        <IconeCanal canal={item.canal} className="size-3" />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-sm', item.naoLidas > 0 ? 'font-semibold' : 'font-medium')}>{item.nome}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{haQuanto(item.ultimaMensagemEm)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className={cn('min-w-0 flex-1 truncate text-xs', item.naoLidas > 0 ? 'text-foreground' : 'text-muted-foreground')}>{item.ultimaMensagem ?? '—'}</span>
                        {item.naoLidas > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground tabular-nums">
                            {item.naoLidas}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        <Selo tom={STATUS[item.status].tom}>{STATUS[item.status].rotulo}</Selo>
                        {item.atendente && item.status === 'humano' && <span className="text-[11px] text-muted-foreground">{item.meu ? 'com você' : `com ${item.atendente}`}</span>}
                        {!item.temCadastro && <span className="text-[11px] text-muted-foreground">· sem cadastro</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Conversa */}
      <section aria-label="Conversa" className={cn('flex min-h-0 min-w-0 flex-col', !aberta && 'max-lg:hidden')}>
        {aberta ? (
          <Conversa key={aberta} id={aberta} modelos={modelos} atendente={atendente} onVoltar={() => setAberta(null)} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <Headset className="size-8 text-primary/60" aria-hidden="true" />
            Escolha uma conversa à esquerda.
            <span className="max-w-sm text-xs">
              O robô responde sozinho até alguém da equipe <strong>assumir</strong> ou a pessoa pedir para falar com um humano (aí ela entra em <strong>Na fila</strong>).
            </span>
          </div>
        )}
      </section>
    </div>
  )
}

function Conversa({ id, modelos, atendente, onVoltar }: { id: string; modelos: ModeloMensagem[]; atendente: string; onVoltar: () => void }) {
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const quantas = useRef(0)

  async function carregar() {
    const r = await fetch(`/api/equipe/atendimento/${id}?lida=1`, { cache: 'no-store' }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    if (!dados?.ok) return setAviso('Não foi possível carregar a conversa.')
    setDetalhe(dados.atendimento)
    setMensagens(dados.mensagens)
  }
  useAtualizar(carregar, 3000, [id])

  // Desce para o fim quando chega mensagem nova.
  useEffect(() => {
    if (mensagens.length !== quantas.current) listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight })
    quantas.current = mensagens.length
  }, [mensagens.length])

  async function acao(nome: 'assumir' | 'devolver' | 'resolver') {
    await fetch(`/api/equipe/atendimento/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: nome }) }).catch(() => null)
    carregar()
  }

  async function enviar() {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return
    setEnviando(true)
    setAviso(null)
    const chave = crypto.randomUUID()
    const r = await fetch(`/api/equipe/atendimento/${id}/responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: conteudo, chave }),
    }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setEnviando(false)
    if (r?.ok) setTexto('')
    else setAviso(dados?.erro ?? 'Não foi possível enviar. Tente de novo.')
    carregar()
  }

  if (!detalhe) {
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
      </p>
    )
  }

  const bloqueada = !detalhe.janelaAberta
  const buscaCadastro = detalhe.whatsapp ? detalhe.whatsapp.slice(-8) : detalhe.nome

  return (
    <>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2.5 sm:px-4">
        <button type="button" onClick={onVoltar} aria-label="Voltar para a lista" className="-ml-1 flex size-9 items-center justify-center rounded-full hover:bg-foreground/5 lg:hidden">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-semibold">
            <IconeCanal canal={detalhe.canal} className="size-4 shrink-0" />
            <span className="truncate">{detalhe.nome}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {detalhe.telefone && <span className="font-mono">{detalhe.telefone}</span>}
            <span>{detalhe.canal === 'whatsapp' ? 'WhatsApp' : 'Chat do site'}</span>
            {detalhe.leadId ? (
              <Link href={`/equipe/leads?situacao=todos&q=${encodeURIComponent(buscaCadastro)}`} className="text-primary underline-offset-2 hover:underline">
                Ver cadastro
              </Link>
            ) : (
              <span>sem cadastro</span>
            )}
          </p>
        </div>
        <Selo tom={STATUS[detalhe.status].tom}>
          {detalhe.status === 'humano' && detalhe.atendente ? (detalhe.meu ? 'Com você' : `Com ${detalhe.atendente}`) : STATUS[detalhe.status].rotulo}
        </Selo>
        <div className="flex w-full gap-1.5 sm:w-auto">
          {!(detalhe.status === 'humano' && detalhe.meu) && (
            <button type="button" onClick={() => acao('assumir')} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground sm:flex-none">
              <Hand className="size-3.5" aria-hidden="true" />
              Assumir
            </button>
          )}
          {detalhe.status !== 'bot' && (
            <button type="button" onClick={() => acao('devolver')} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-foreground/5 sm:flex-none">
              <Bot className="size-3.5" aria-hidden="true" />
              Devolver ao robô
            </button>
          )}
          {detalhe.status !== 'resolvida' && (
            <button type="button" onClick={() => acao('resolver')} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs hover:bg-foreground/5 sm:flex-none">
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Resolver
            </button>
          )}
        </div>
      </header>

      <div ref={listaRef} className="min-h-0 flex-1 overflow-y-auto bg-background/30 px-3 py-4 sm:px-5">
        <ol className="flex flex-col gap-2">
          <li className="self-center text-[11px] text-muted-foreground">Conversa iniciada em {dataCurta(detalhe.criadoEm)}</li>
          {mensagens.map((m) =>
            m.autor === 'sistema' ? (
              <li key={m.id} className="self-center rounded-full bg-foreground/[0.05] px-3 py-1 text-center text-[11px] text-muted-foreground">
                {m.texto} · {dataCurta(m.em)}
              </li>
            ) : (
              <li
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  m.autor === 'cliente' && 'self-start rounded-bl-md bg-foreground/[0.07]',
                  m.autor === 'bot' && 'self-end rounded-br-md border border-border bg-card',
                  m.autor === 'atendente' && 'self-end rounded-br-md bg-primary/90 text-primary-foreground',
                )}
              >
                {m.autor !== 'cliente' && (
                  <p className={cn('mb-0.5 flex items-center gap-1 text-[11px] font-semibold', m.autor === 'bot' ? 'text-muted-foreground' : 'text-primary-foreground/80')}>
                    {m.autor === 'bot' ? <Bot className="size-3" aria-hidden="true" /> : <UserRound className="size-3" aria-hidden="true" />}
                    {m.autor === 'bot' ? 'Assistente' : (m.autorNome ?? 'Equipe')}
                  </p>
                )}
                <p className="break-words whitespace-pre-wrap">{m.texto}</p>
                <p className={cn('mt-0.5 text-right text-[10px]', m.autor === 'atendente' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{dataCurta(m.em)}</p>
                {m.erro && (
                  <p className="mt-1 flex items-center gap-1 rounded-lg bg-destructive/90 px-2 py-1 text-[11px] text-white">
                    <AlertTriangle className="size-3 shrink-0" aria-hidden="true" /> Não entregue: {m.erro}
                  </p>
                )}
              </li>
            ),
          )}
        </ol>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex flex-col gap-2 border-t border-border p-3"
      >
        {bloqueada ? (
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-2.5 text-xs">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            Passaram 24 h desde a última mensagem desta pessoa. O WhatsApp só deixa a empresa escrever com modelo aprovado (pago). Use a Fila de chamadas
            (seu WhatsApp) ou espere ela escrever de novo.
          </p>
        ) : (
          detalhe.janelaFechaEm && (
            <p className="text-[11px] text-muted-foreground">Pode responder grátis até {dataCurta(detalhe.janelaFechaEm)} (janela de 24 h do WhatsApp).</p>
          )
        )}
        {detalhe.status === 'bot' && !bloqueada && (
          <p className="text-[11px] text-muted-foreground">Ao responder, você assume a conversa e o robô para de responder até você devolver.</p>
        )}
        {aviso && (
          <p role="alert" className="text-xs text-destructive">
            {aviso}
          </p>
        )}
        <div className="flex items-end gap-2">
          {modelos.length > 0 && (
            <select
              aria-label="Resposta rápida"
              value=""
              disabled={bloqueada}
              onChange={(e) => {
                const modelo = modelos.find((m) => m.id === e.target.value)
                if (modelo) setTexto(preencherMensagem(modelo.texto, { nome: detalhe.nome, atendente }))
              }}
              className="h-11 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-background/60 text-center text-lg outline-none focus-visible:border-primary disabled:opacity-40"
              title="Respostas rápidas"
            >
              <option value="">⚡</option>
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.rotulo}
                </option>
              ))}
            </select>
          )}
          <label className="sr-only" htmlFor="resposta-atendimento">
            Resposta
          </label>
          <textarea
            id="resposta-atendimento"
            value={texto}
            disabled={bloqueada}
            onChange={(e) => setTexto(e.target.value.slice(0, 4000))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                enviar()
              }
            }}
            rows={1}
            placeholder={bloqueada ? 'Janela de 24 h fechada' : 'Escreva sua resposta…'}
            className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm leading-snug outline-none field-sizing-content focus-visible:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={bloqueada || enviando || !texto.trim()}
            aria-label="Enviar resposta"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {enviando ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <SendHorizontal className="size-5" aria-hidden="true" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground max-sm:hidden">Enter envia · Shift+Enter quebra linha · ⚡ respostas rápidas</p>
        {detalhe.status === 'resolvida' && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <RotateCcw className="size-3" aria-hidden="true" /> Se a pessoa escrever de novo, a conversa reabre com o robô.
          </p>
        )}
      </form>
    </>
  )
}
