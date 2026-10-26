'use client'

import { Dialog } from '@base-ui/react/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Peças visuais do painel /equipe: compactas, legíveis no celular e consistentes com o site. */

export function Selo({
  tom = 'neutro',
  children,
  titulo,
}: {
  tom?: 'neutro' | 'verde' | 'vermelho' | 'amarelo'
  children: React.ReactNode
  titulo?: string
}) {
  return (
    <span
      title={titulo}
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-[11px] font-medium',
        tom === 'verde' && 'border-primary/40 bg-primary/12 text-foreground',
        tom === 'vermelho' && 'border-destructive/35 bg-destructive/10 text-destructive',
        tom === 'amarelo' && 'border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        tom === 'neutro' && 'border-border text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}

export function BotaoIcone({
  rotulo,
  children,
  ativo = false,
  destaque = false,
  className,
  ...props
}: { rotulo: string; ativo?: boolean; destaque?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-40',
        destaque
          ? 'border-primary/40 bg-primary/15 text-primary hover:bg-primary/25'
          : ativo
            ? 'border-primary/50 bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Filtro({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string
  valor: string
  opcoes: { valor: string; rotulo: string }[]
  onChange: (valor: string) => void
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      <span className="shrink-0">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background/60 px-2 text-sm text-foreground outline-none focus-visible:border-primary"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Paginacao({
  pagina,
  porPagina,
  total,
  onPagina,
}: {
  pagina: number
  porPagina: number
  total: number
  onPagina: (pagina: number) => void
}) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  const de = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const ate = Math.min(total, pagina * porPagina)
  // Mostra 1 … vizinhas … última.
  const numeros = [...new Set([1, pagina - 1, pagina, pagina + 1, paginas])].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b)

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {de}–{ate} de <strong className="text-foreground">{total}</strong>
      </p>
      <div className="flex items-center gap-1">
        <BotaoIcone rotulo="Página anterior" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </BotaoIcone>
        {numeros.map((n, i) => (
          <span key={n} className="flex items-center gap-1">
            {i > 0 && n - numeros[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
            <button
              type="button"
              onClick={() => onPagina(n)}
              aria-current={n === pagina ? 'page' : undefined}
              className={cn(
                'h-8 min-w-8 rounded-full px-2 text-sm tabular-nums',
                n === pagina ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5',
              )}
            >
              {n}
            </button>
          </span>
        ))}
        <BotaoIcone rotulo="Próxima página" disabled={pagina >= paginas} onClick={() => onPagina(pagina + 1)}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </BotaoIcone>
      </div>
    </nav>
  )
}

export function Indicadores({ itens }: { itens: { rotulo: string; valor: number | string; destaque?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card/60 sm:grid-cols-6">
      {itens.map((item) => (
        <div key={item.rotulo} className={cn('border-border px-3 py-2.5 [&:not(:last-child)]:border-r max-sm:[&:nth-child(3n)]:border-r-0 max-sm:[&:nth-child(n+4)]:border-t', item.destaque && 'bg-primary/10')}>
          <dt className="truncate text-[11px] text-muted-foreground">{item.rotulo}</dt>
          <dd className="text-lg font-semibold tabular-nums">{item.valor}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Painel lateral (detalhes de um contato). Ocupa a tela no celular. */
export function PainelLateral({
  aberto,
  onFechar,
  titulo,
  children,
}: {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={aberto} onOpenChange={(valor) => !valor && onFechar()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl transition-transform duration-200 outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
            <Dialog.Title className="truncate text-lg font-semibold">{titulo}</Dialog.Title>
            <Dialog.Close aria-label="Fechar" className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-col gap-5 p-5">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function dataCurta(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export function haQuanto(iso: string | null) {
  if (!iso) return '—'
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} d`
}
