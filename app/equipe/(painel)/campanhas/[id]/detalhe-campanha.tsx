'use client'

import { Loader2, Pause, Play, Rocket, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatE164 } from '@/lib/phone'
import { dataCurta, Selo } from '../../ui'

type Envio = { telefone: string; nome: string | null; status: string; erro: string | null; enviadoEm: string | null }
type Campanha = {
  id: string
  nome: string
  modelo: string
  categoria: string | null
  status: string
  total: number
  enviados: number
  entregues: number
  lidos: number
  falhas: number
  responderam: number
  textoModelo: string | null
  variaveis: { tipo: 'nome' | 'fixo'; valor?: string }[]
  envios: Envio[]
}

const STATUS: Record<string, { rotulo: string; tom: 'neutro' | 'verde' | 'vermelho' | 'amarelo' }> = {
  rascunho: { rotulo: 'Rascunho', tom: 'neutro' },
  enviando: { rotulo: 'Enviando', tom: 'amarelo' },
  pausada: { rotulo: 'Pausada', tom: 'vermelho' },
  concluida: { rotulo: 'Concluída', tom: 'verde' },
  cancelada: { rotulo: 'Cancelada', tom: 'neutro' },
}
const STATUS_ENVIO: Record<string, string> = {
  pendente: 'Na fila',
  enviando: 'Enviando',
  enviado: 'Enviada',
  entregue: 'Entregue',
  lido: 'Lida',
  falhou: 'Falhou',
}

export function DetalheCampanha({ id }: { id: string }) {
  const [c, setC] = useState<Campanha | null>(null)
  const [limite, setLimite] = useState(250)
  const [motivo, setMotivo] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const processando = useRef(false)

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/equipe/campanhas/${id}`, { cache: 'no-store' }).catch(() => null)
    const d = await r?.json().catch(() => null)
    if (d?.ok) {
      setC(d.campanha)
      setLimite(d.limiteDiario)
    }
  }, [id])

  useEffect(() => {
    carregar()
    const intervalo = setInterval(() => document.visibilityState === 'visible' && carregar(), 4000)
    return () => clearInterval(intervalo)
  }, [carregar])

  // Enquanto a tela está aberta e a campanha "enviando", vai mandando os lotes (o cron cobre o resto).
  useEffect(() => {
    if (c?.status !== 'enviando' || processando.current) return
    processando.current = true
    ;(async () => {
      while (processando.current) {
        const r = await fetch(`/api/equipe/campanhas/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'processar' }) }).catch(() => null)
        const d = await r?.json().catch(() => null)
        setMotivo(d?.motivo ?? null)
        await carregar()
        if (!d?.ok || d.motivo !== 'continua') break
      }
      processando.current = false
    })()
    return () => {
      processando.current = false
    }
  }, [c?.status, id, carregar])

  async function acao(nome: 'iniciar' | 'pausar' | 'retomar' | 'cancelar') {
    if (nome === 'iniciar' && !window.confirm(`Enviar para ${c?.total ? 'o público desta campanha' : 'todos do público'}? Essa ação não pode ser desfeita.`)) return
    if (nome === 'cancelar' && !window.confirm('Cancelar a campanha? Quem ainda não recebeu não vai receber.')) return
    setOcupado(true)
    await fetch(`/api/equipe/campanhas/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: nome }) }).catch(() => null)
    setOcupado(false)
    carregar()
  }

  if (!c) {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
      </p>
    )
  }

  const feitos = c.enviados + c.falhas
  const progresso = c.total ? Math.round((feitos / c.total) * 100) : 0
  const cartoes = [
    { rotulo: 'Público', valor: c.total },
    { rotulo: 'Enviadas', valor: c.enviados },
    { rotulo: 'Entregues', valor: c.entregues },
    { rotulo: 'Lidas', valor: c.lidos },
    { rotulo: 'Responderam', valor: c.responderam },
    { rotulo: 'Falhas', valor: c.falhas },
  ]

  return (
    <div className="mt-1 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span className="truncate">{c.nome}</span>
            <Selo tom={STATUS[c.status]?.tom ?? 'neutro'}>{STATUS[c.status]?.rotulo ?? c.status}</Selo>
          </h1>
          <p className="text-sm text-muted-foreground">
            Modelo {c.modelo} · {c.categoria}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.status === 'rascunho' && (
            <button type="button" disabled={ocupado} onClick={() => acao('iniciar')} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
              <Rocket className="size-4" aria-hidden="true" /> Iniciar disparo
            </button>
          )}
          {c.status === 'enviando' && (
            <button type="button" disabled={ocupado} onClick={() => acao('pausar')} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-foreground/5">
              <Pause className="size-4" aria-hidden="true" /> Pausar
            </button>
          )}
          {c.status === 'pausada' && (
            <button type="button" disabled={ocupado} onClick={() => acao('retomar')} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
              <Play className="size-4" aria-hidden="true" /> Retomar
            </button>
          )}
          {['rascunho', 'enviando', 'pausada'].includes(c.status) && (
            <button type="button" disabled={ocupado} onClick={() => acao('cancelar')} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground hover:bg-foreground/5">
              <X className="size-4" aria-hidden="true" /> Cancelar
            </button>
          )}
        </div>
      </div>

      {c.status === 'rascunho' && (
        <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
          Pronto para enviar. Ao iniciar, a lista de quem recebe é congelada e os envios saem em lotes, respeitando o limite de {limite} contatos por dia.
        </p>
      )}
      {motivo === 'limite diário' && (
        <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 text-sm">
          Limite de {limite} contatos nas últimas 24 h atingido. O restante sai automaticamente quando liberar (pelo agendador).
        </p>
      )}
      {c.status === 'pausada' && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Campanha pausada. Se foi pausada sozinha, a Meta recusou os envios (token, conta ou qualidade do número): veja as falhas abaixo e a Saúde do sistema.
        </p>
      )}

      <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card/60 sm:grid-cols-6">
        {cartoes.map((k) => (
          <div key={k.rotulo} className="border-border px-3 py-2.5 [&:not(:last-child)]:border-r max-sm:[&:nth-child(3n)]:border-r-0 max-sm:[&:nth-child(n+4)]:border-t">
            <dt className="text-[11px] text-muted-foreground">{k.rotulo}</dt>
            <dd className="text-lg font-semibold tabular-nums">{k.valor}</dd>
          </div>
        ))}
      </dl>
      {c.status !== 'rascunho' && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{progresso}% processado</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Envios recentes</h2>
          {c.envios.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Os envios aparecem aqui quando o disparo começar.</p>
          ) : (
            <div className="max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {c.envios.map((e) => (
                    <tr key={e.telefone}>
                      <td className="px-4 py-2">
                        <p className="font-medium">{e.nome ?? '—'}</p>
                        <p className="font-mono text-xs text-muted-foreground">{formatE164(e.telefone)}</p>
                      </td>
                      <td className="px-2 py-2">
                        <Selo tom={e.status === 'falhou' ? 'vermelho' : e.status === 'lido' || e.status === 'entregue' ? 'verde' : 'neutro'} titulo={e.erro ?? undefined}>
                          {STATUS_ENVIO[e.status] ?? e.status}
                        </Selo>
                        {e.erro && <p className="mt-0.5 max-w-xs truncate text-[11px] text-destructive">{e.erro}</p>}
                      </td>
                      <td className="px-4 py-2 text-right text-xs whitespace-nowrap text-muted-foreground">{dataCurta(e.enviadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-3">
          <section className="rounded-2xl border border-border bg-card/60 p-4">
            <h2 className="text-sm font-semibold">Mensagem</h2>
            <div className="mt-3 rounded-2xl rounded-tl-md bg-[#005c4b] p-3 text-sm whitespace-pre-wrap text-white">
              {(c.textoModelo ?? '').replace(/\{\{(\d+)\}\}/g, (_, n) => {
                const v = c.variaveis?.[Number(n) - 1]
                return v?.tipo === 'fixo' ? (v.valor ?? '') : 'Maria'
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Exemplo com o nome “Maria”: cada pessoa recebe com o próprio primeiro nome.</p>
          </section>
          <Link href="/equipe/atendimento" className="rounded-2xl border border-border bg-card/60 p-4 text-sm hover:border-primary/40">
            <strong>Respostas</strong>
            <span className="block text-muted-foreground">Quem responder aparece na aba Atendimento, com a mensagem da campanha no histórico.</span>
          </Link>
        </aside>
      </div>
    </div>
  )
}
