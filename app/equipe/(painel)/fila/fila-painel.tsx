'use client'

import { Ban, Check, ChevronRight, MessageCircleReply, MousePointerClick, PartyPopper, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import type { ItemFila } from '@/lib/fila'
import { type ModeloMensagem, preencherMensagem } from '@/lib/mensagens'
import { formatE164, waLink } from '@/lib/phone'
import { cn } from '@/lib/utils'

const ROTULO_ETAPA = { 1: '1º contato', 2: '2º contato', 3: '3º contato' } as const

function haQuanto(iso: string) {
  const horas = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (horas < 1) return 'agora há pouco'
  if (horas < 24) return `há ${horas} h`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}

async function enviar(url: string, corpo: object) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), keepalive: true })
    .then((r) => r.ok)
    .catch(() => false)
}

export function FilaPainel({
  fila,
  modelos,
  atendente,
  chamadosHoje,
  limiteDiario,
}: {
  fila: ItemFila[]
  modelos: ModeloMensagem[]
  atendente: string
  chamadosHoje: number
  limiteDiario: number
}) {
  const [feitos, setFeitos] = useState<Set<string>>(new Set())
  const [pulados, setPulados] = useState<Set<string>>(new Set())
  const [hoje, setHoje] = useState(chamadosHoje)
  const [erro, setErro] = useState<string | null>(null)

  const pendentes = useMemo(() => fila.filter((item) => !feitos.has(item.id) && !pulados.has(item.id)), [fila, feitos, pulados])
  const atual = pendentes[0]
  const porEtapa = useMemo(() => {
    const contagem = { 1: 0, 2: 0, 3: 0 }
    for (const item of pendentes) contagem[item.etapa] += 1
    return contagem
  }, [pendentes])

  function concluir(id: string) {
    setFeitos((atual) => new Set(atual).add(id))
  }

  const modelo = atual ? (modelos[atual.etapa - 1] ?? modelos.at(-1)) : undefined
  const texto = atual && modelo ? preencherMensagem(modelo.texto, { nome: atual.nome, atendente }) : ''

  return (
    <div className="mt-6 flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([1, 2, 3] as const).map((etapa) => (
          <div key={etapa} className="rounded-2xl border border-border bg-card/60 p-4">
            <dt className="text-xs text-muted-foreground">{ROTULO_ETAPA[etapa]}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{porEtapa[etapa]}</dd>
          </div>
        ))}
        <div className={cn('rounded-2xl border p-4', hoje >= limiteDiario ? 'border-destructive/40 bg-destructive/10' : 'border-primary/35 bg-primary/10')}>
          <dt className="text-xs text-muted-foreground">Você chamou hoje</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{hoje}</dd>
        </div>
      </dl>

      {hoje >= limiteDiario && (
        <p className="flex gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          Você já chamou {hoje} pessoas hoje. Para o WhatsApp não restringir seu número, faça uma pausa ou divida a fila com outra pessoa da
          equipe.
        </p>
      )}
      {erro && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      {!atual ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
          <PartyPopper className="size-10 text-primary" aria-hidden="true" />
          <p className="text-lg font-semibold">Fila zerada por agora!</p>
          <p className="text-sm text-muted-foreground">
            {pulados.size > 0 ? `${pulados.size} pulados voltam quando você recarregar a página.` : 'Novos cadastros e retornos aparecem aqui automaticamente.'}
          </p>
        </div>
      ) : (
        <section aria-label="Próxima pessoa" className="rounded-3xl border border-primary/35 bg-card p-5 shadow-[0_0_60px_-24px] shadow-primary/40 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">
                {ROTULO_ETAPA[atual.etapa]} · {pendentes.length} na fila
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{atual.nome}</h2>
              <p className="font-mono text-muted-foreground">{formatE164(atual.whatsapp)}</p>
            </div>
            <p className="text-xs text-muted-foreground">cadastrou {haQuanto(atual.criadoEm)}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {atual.chamadoEm && (
              <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                Último contato {haQuanto(atual.chamadoEm)} por {atual.chamadoPor}
              </span>
            )}
            {atual.ultimaAcao === 'cadastrar' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                <MousePointerClick className="size-3" aria-hidden="true" /> Abriu o cadastro da Hub
              </span>
            )}
            {atual.respondeuWhatsapp && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1">
                <MessageCircleReply className="size-3" aria-hidden="true" /> Já escreveu para o atendimento
              </span>
            )}
          </div>

          <p className="mt-4 rounded-2xl bg-foreground/[0.04] p-4 text-sm leading-relaxed">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{modelo?.rotulo}</span>
            {texto}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
            <a
              href={waLink(atual.whatsapp, texto)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                const id = atual.id
                setHoje((n) => n + 1)
                // Pequeno atraso: a aba do WhatsApp abre antes de a fila trocar de pessoa.
                setTimeout(() => concluir(id), 600)
                enviar(`/api/equipe/leads/${id}/chamar`, { modelo: modelo?.id ?? 'fila' }).then((ok) => !ok && setErro('O chamado não foi registrado. Confira a conexão.'))
              }}
              className="glow inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground hover:brightness-110"
            >
              <WhatsappIcon className="size-5" />
              Abrir WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setPulados((atualSet) => new Set(atualSet).add(atual.id))}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-foreground/12 px-4 text-sm hover:bg-foreground/5"
            >
              Pular
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                const id = atual.id
                concluir(id)
                enviar(`/api/equipe/leads/${id}/convertido`, { convertido: true })
              }}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-foreground/12 px-4 text-sm hover:bg-foreground/5"
            >
              <Check className="size-4" aria-hidden="true" />
              Já converteu
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Marcar o número de ${atual.nome} como inválido? Ele sai da fila.`)) return
                const id = atual.id
                concluir(id)
                enviar(`/api/equipe/leads/${id}/invalido`, { invalido: true })
              }}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-foreground/12 px-4 text-sm text-muted-foreground hover:bg-foreground/5"
            >
              <Ban className="size-4" aria-hidden="true" />
              Número inválido
            </button>
          </div>
        </section>
      )}

      {pendentes.length > 1 && (
        <section aria-label="Próximos" className="rounded-2xl border border-border p-4">
          <p className="text-sm font-medium">Próximos</p>
          <ol className="mt-2 flex flex-col divide-y divide-border text-sm">
            {pendentes.slice(1, 8).map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-2">
                <span className="truncate">{item.nome}</span>
                <span className="shrink-0 text-muted-foreground">{ROTULO_ETAPA[item.etapa]}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
