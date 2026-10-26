'use client'

import { Bot, Loader2, MessageCircle, SendHorizontal, X } from 'lucide-react'
import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { waLink } from '@/lib/phone'
import { SITE_URL, WHATSAPP_ATENDIMENTO, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

type Mensagem = { role: 'user' | 'assistant'; content: string; erro?: boolean }

const CHAVE = 'hubcapture:chat'
const MAX_HISTORICO = 20
const MAX_CARACTERES = 1000

const SUGESTOES = ['Tutorial completo', 'Como me cadastro?', 'Quanto paga por hora?', 'Como recebo o pagamento?', 'O que é o Minute?']

const BOAS_VINDAS =
  'Oi! Sou o assistente do **Hub Capture** 👋 Tiro dúvidas sobre cadastro com o código VEMHUB, gravações, pagamentos e o app Minute. Como posso ajudar?'

function lerConversa(): Mensagem[] {
  try {
    const dados = JSON.parse(sessionStorage.getItem(CHAVE) ?? '[]')
    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

function salvarConversa(mensagens: Mensagem[]) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(mensagens.slice(-40)))
  } catch {}
}

/** Botão + janela do assistente. `acimaDaModeBar` sobe o botão no celular quando a barra Casa/Trabalho existe. */
export function ChatWidget({ acimaDaModeBar = false }: { acimaDaModeBar?: boolean }) {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const painelId = useId()
  const botaoRef = useRef<HTMLButtonElement>(null)
  const entradaRef = useRef<HTMLTextAreaElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMensagens(lerConversa())
  }, [])

  useEffect(() => {
    if (aberto) entradaRef.current?.focus()
  }, [aberto])

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensagens, enviando, aberto])

  useEffect(() => {
    if (!aberto) return
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAberto(false)
        botaoRef.current?.focus()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  async function enviar(conteudo: string) {
    const pergunta = conteudo.trim().slice(0, MAX_CARACTERES)
    if (!pergunta || enviando) return
    const comPergunta: Mensagem[] = [...mensagens, { role: 'user', content: pergunta }]
    setMensagens(comPergunta)
    salvarConversa(comPergunta)
    setTexto('')
    setEnviando(true)

    let resposta: Mensagem
    try {
      const historico = comPergunta
        .filter((mensagem) => !mensagem.erro)
        .slice(-MAX_HISTORICO)
        .map(({ role, content }) => ({ role, content }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historico }),
      })
      const dados = await response.json().catch(() => ({}))
      resposta = response.ok
        ? { role: 'assistant', content: String(dados.resposta) }
        : { role: 'assistant', content: textoErro(response.status, dados.erro), erro: true }
    } catch {
      resposta = { role: 'assistant', content: textoErro(0), erro: true }
    }

    const final = [...comPergunta, resposta]
    setMensagens(final)
    salvarConversa(final)
    setEnviando(false)
    entradaRef.current?.focus()
  }

  function aoTeclarEntrada(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      enviar(texto)
    }
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-expanded={aberto}
        aria-controls={painelId}
        aria-label={aberto ? 'Fechar o assistente' : 'Abrir o assistente de dúvidas'}
        className={cn(
          'glow fixed right-4 z-[52] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all outline-none hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring sm:right-6 sm:bottom-6',
          acimaDaModeBar ? 'bottom-[5.75rem]' : 'bottom-4',
          aberto && 'max-sm:hidden',
        )}
      >
        {aberto ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-6" aria-hidden="true" />}
      </button>

      {aberto && (
        <section
          id={painelId}
          role="dialog"
          aria-modal="false"
          aria-label="Assistente Hub Capture"
          className="fixed inset-x-2 top-2 bottom-2 z-[56] flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-black/40 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[23rem]"
        >
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">Assistente Hub Capture</p>
              <p className="truncate text-xs text-muted-foreground">Automático · não é a Hub Data</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAberto(false)
                botaoRef.current?.focus()
              }}
              aria-label="Fechar o assistente"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <div
            ref={listaRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            aria-live="polite"
            onClick={(event) => {
              // No celular a janela cobre a tela: fecha ao seguir um link do próprio site.
              const alvo = (event.target as HTMLElement).closest('a[data-interno]')
              if (alvo && window.matchMedia('(max-width: 639px)').matches) setAberto(false)
            }}
          >
            <ul className="flex flex-col gap-3">
              <Balao role="assistant" content={BOAS_VINDAS} />
              {mensagens.map((mensagem, i) => (
                <Balao key={i} {...mensagem} />
              ))}
              {enviando && (
                <li className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-foreground/[0.06] px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  digitando…
                </li>
              )}
            </ul>

            {mensagens.length === 0 && !enviando && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGESTOES.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => enviar(sugestao)}
                    className="rounded-full border border-primary/35 bg-primary/10 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary/15"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              enviar(texto)
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <label htmlFor={`${painelId}-entrada`} className="sr-only">
              Escreva sua dúvida
            </label>
            <textarea
              id={`${painelId}-entrada`}
              ref={entradaRef}
              value={texto}
              onChange={(event) => setTexto(event.target.value.slice(0, MAX_CARACTERES))}
              onKeyDown={aoTeclarEntrada}
              rows={1}
              placeholder="Escreva sua dúvida…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-base leading-snug text-foreground placeholder:text-muted-foreground/70 outline-none field-sizing-content focus-visible:border-primary"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              aria-label="Enviar"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <SendHorizontal className="size-5" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </>
  )
}

function textoErro(status: number, erro?: string) {
  const contato = WHATSAPP_ATENDIMENTO
    ? `fale com a gente no [WhatsApp](${waLink(WHATSAPP_ATENDIMENTO, 'Oi! Vim pelo site Hub Capture e tenho uma dúvida.')})`
    : `entre na [comunidade do WhatsApp](${WHATSAPP_COMMUNITY_URL})`
  if (status === 429) return `${erro ?? 'Muitas mensagens em pouco tempo.'} Se for urgente, ${contato}.`
  return `Não consegui responder agora. Tente de novo em instantes ou ${contato}.`
}

function Balao({ role, content, erro }: Mensagem) {
  const minha = role === 'user'
  return (
    <li
      className={cn(
        'max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
        minha
          ? 'self-end rounded-br-md bg-primary text-primary-foreground'
          : erro
            ? 'self-start rounded-bl-md border border-destructive/30 bg-destructive/10'
            : 'self-start rounded-bl-md bg-foreground/[0.06]',
      )}
    >
      {minha ? <p className="whitespace-pre-wrap">{content}</p> : <Markdown texto={content} />}
    </li>
  )
}

/** Markdown mínimo e seguro: parágrafos, listas, **negrito**, [links](https://...) e URLs soltas. */
function Markdown({ texto }: { texto: string }) {
  const blocos: { tipo: 'p' | 'ul' | 'ol'; linhas: string[] }[] = []
  for (const linha of texto.split('\n')) {
    const limpa = linha.trim().replace(/^#{1,6}\s+/, '')
    const item = /^[-*•]\s+(.*)/.exec(limpa)
    const numerado = /^\d+[.)]\s+(.*)/.exec(limpa)
    const ultimo = blocos.at(-1)
    if (!limpa) {
      blocos.push({ tipo: 'p', linhas: [] })
    } else if (item || numerado) {
      const tipo = item ? 'ul' : 'ol'
      const conteudo = (item ?? numerado)![1]
      if (ultimo?.tipo === tipo) ultimo.linhas.push(conteudo)
      else blocos.push({ tipo, linhas: [conteudo] })
    } else if (ultimo?.tipo === 'p') {
      ultimo.linhas.push(limpa)
    } else {
      blocos.push({ tipo: 'p', linhas: [limpa] })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {blocos
        .filter((bloco) => bloco.linhas.length > 0)
        .map((bloco, i) =>
          bloco.tipo === 'p' ? (
            <p key={i}>
              {bloco.linhas.map((linha, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  <Inline texto={linha} />
                </Fragment>
              ))}
            </p>
          ) : bloco.tipo === 'ul' ? (
            <ul key={i} className="ml-4 list-disc space-y-1">
              {bloco.linhas.map((linha, j) => (
                <li key={j}>
                  <Inline texto={linha} />
                </li>
              ))}
            </ul>
          ) : (
            <ol key={i} className="ml-4 list-decimal space-y-1">
              {bloco.linhas.map((linha, j) => (
                <li key={j}>
                  <Inline texto={linha} />
                </li>
              ))}
            </ol>
          ),
        )}
    </div>
  )
}

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<]*[^\s<.,;:!?)\]])/g

function Inline({ texto }: { texto: string }) {
  const partes = texto.split(TOKEN)
  return (
    <>
      {partes.map((parte, i) => {
        if (i % 2 === 0) return parte
        if (parte.startsWith('**')) return <strong key={i}>{parte.slice(2, -2)}</strong>
        const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(parte)
        const href = link ? link[2] : parte
        const rotulo = link ? link[1] : parte.replace(/^https?:\/\/(www\.)?/, '')
        // Links do próprio site abrem na mesma aba (ex.: /tutoriais#passo-3); os de fora, em nova aba.
        const interno = href.startsWith(SITE_URL)
        return (
          <a
            key={i}
            href={interno ? href.slice(SITE_URL.length) || '/' : href}
            {...(interno ? { 'data-interno': '' } : { target: '_blank', rel: 'noopener noreferrer' })}
            className="font-medium break-words text-primary underline underline-offset-2"
          >
            {rotulo}
          </a>
        )
      })}
    </>
  )
}
