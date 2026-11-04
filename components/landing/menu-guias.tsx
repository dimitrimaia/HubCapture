'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { guiaLinks } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/** "Guias ▾" do cabeçalho: abre no clique, fecha ao clicar fora ou com Esc. */
export function MenuGuias() {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const caminho = usePathname()
  const ativo = guiaLinks.some((g) => g.href === caminho)

  useEffect(() => setAberto(false), [caminho])
  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAberto(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        aria-haspopup="true"
        onClick={() => setAberto((a) => !a)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-foreground/5 hover:text-foreground',
          ativo || aberto ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        Guias
        <ChevronDown className={cn('size-3.5 transition-transform', aberto && 'rotate-180')} aria-hidden="true" />
      </button>
      {/* Links sempre no HTML (o Google lê); só a visibilidade muda. */}
      <ul
        className={cn(
          'absolute top-full left-1/2 z-50 mt-2 w-80 -translate-x-1/2 rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl',
          !aberto && 'hidden',
        )}
      >
        {guiaLinks.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              aria-current={g.href === caminho ? 'page' : undefined}
              className="flex flex-col rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5 aria-[current=page]:bg-primary/10"
            >
              <span className="text-sm font-medium text-foreground">{g.label}</span>
              <span className="text-xs text-muted-foreground">{g.resumo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
