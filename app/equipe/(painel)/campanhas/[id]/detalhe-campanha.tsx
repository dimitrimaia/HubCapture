'use client'

import { AlertTriangle, Ban, Loader2, Pause, Play, Rocket, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { custoCampanha, explicarErro, formatarBrl, formatarUsd, ROTULO_ACAO, type AcaoFalha } from '@/lib/campanhas-info'
import { formatE164 } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { dataCurta, Selo } from '../../ui'

type Envio = { telefone: string; nome: string | null; status: string; erro: string | null; enviadoEm: string | null; leadId: string | null; invalido: boolean | null }
type Falha = { erro: string | null; leadId: string | null; invalido: boolean | null }
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
  falhasLista: Falha[]
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
  const [filtro, setFiltro] = useState<'todos' | 'falhas'>('todos')
  const [aviso, setAviso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/equipe/campanhas/${id}${filtro === 'falhas' ? '?filtro=falhas' : ''}`, { cache: 'no-store' }).catch(() => null)
    const d = await r?.json().catch(() => null)
    if (d?.ok) {
      setC(d.campanha)
      setLimite(d.limiteDiario)
    }
  }, [id, filtro])

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

  /** Tira os números das próximas campanhas e da Fila (marca como número inválido). */
  async function invalidar(leadIds: string[]) {
    const ids = [...new Set(leadIds)]
    if (!ids.length) return
    if (!window.confirm(`Tirar ${ids.length === 1 ? 'este número' : `${ids.length} números`} das próximas campanhas e da Fila? Dá para desfazer em Cadastros (filtro "Inválidos").`)) return
    setOcupado(true)
    const r = await fetch(`/api/equipe/campanhas/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'invalidar', leadIds: ids }) }).catch(() => null)
    const d = await r?.json().catch(() => null)
    setOcupado(false)
    setAviso(d?.ok ? `${d.total} ${d.total === 1 ? 'número marcado' : 'números marcados'} como inválido.` : 'Não foi possível marcar agora.')
    carregar()
  }

  if (!c) {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
      </p>
    )
  }

  const custo = custoCampanha(c.categoria, c.entregues)
  // Falhas agrupadas pelo motivo, com quem ainda pode ser tirado das próximas campanhas.
  const motivos = Object.values(
    c.falhasLista.reduce<Record<string, { titulo: string; detalhe: string; acao: AcaoFalha; codigo: string; total: number; pendentes: string[] }>>((acc, f) => {
      const e = explicarErro(f.erro)
      const chave = e.codigo || e.titulo
      acc[chave] ??= { ...e, total: 0, pendentes: [] }
      acc[chave].total++
      if (f.leadId && !f.invalido) acc[chave].pendentes.push(f.leadId)
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total)
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

      <section aria-label="Custo" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Gasto estimado (só mensagens entregues são cobradas)</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatarUsd(custo.usd)} <span className="text-sm font-normal text-muted-foreground">≈ {formatarBrl(custo.brl)}</span>
          </p>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          {c.entregues} entregues × {formatarUsd(custo.usd / Math.max(c.entregues, 1))} ({c.categoria?.toLowerCase()}). As {c.falhas} falhas não são cobradas. O valor exato aparece na fatura da Meta.
        </p>
      </section>

      {motivos.length > 0 && (
        <section aria-label="Falhas" className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-destructive" aria-hidden="true" /> Por que falhou
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {motivos.map((m) => (
              <li key={m.codigo || m.titulo} className="flex flex-wrap items-start justify-between gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {m.total} × {m.titulo} {m.codigo && <span className="font-mono text-xs text-muted-foreground">({m.codigo})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.detalhe}</p>
                  <p className={cn('mt-0.5 text-[11px] font-medium', m.acao === 'invalidar' ? 'text-destructive' : 'text-muted-foreground')}>{ROTULO_ACAO[m.acao]}</p>
                </div>
                {m.acao === 'invalidar' && m.pendentes.length > 0 && (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => invalidar(m.pendentes)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 px-3 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Ban className="size-3.5" aria-hidden="true" /> Tirar {m.pendentes.length} das próximas
                  </button>
                )}
                {m.acao === 'invalidar' && m.pendentes.length === 0 && <span className="text-xs text-muted-foreground">Já fora das próximas ✓</span>}
              </li>
            ))}
          </ul>
          {aviso && (
            <p role="status" className="mt-2 text-xs text-primary">
              {aviso}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold">{filtro === 'falhas' ? 'Só as falhas' : 'Envios recentes'}</h2>
            <div className="flex gap-1" role="group" aria-label="Mostrar">
              {(['todos', 'falhas'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filtro === f}
                  onClick={() => setFiltro(f)}
                  className={cn('h-8 rounded-full px-3 text-xs', filtro === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5')}
                >
                  {f === 'todos' ? 'Todos' : `Falhas (${c.falhas})`}
                </button>
              ))}
            </div>
          </div>
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
                        {e.erro && (
                          <p className="mt-0.5 max-w-xs text-[11px] text-destructive" title={e.erro}>
                            {explicarErro(e.erro).titulo}
                          </p>
                        )}
                        {e.status === 'falhou' && e.leadId && explicarErro(e.erro).acao === 'invalidar' && (
                          e.invalido ? (
                            <p className="text-[11px] text-muted-foreground">Fora das próximas ✓</p>
                          ) : (
                            <button type="button" disabled={ocupado} onClick={() => invalidar([e.leadId!])} className="text-[11px] text-destructive underline-offset-2 hover:underline">
                              Tirar das próximas
                            </button>
                          )
                        )}
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
