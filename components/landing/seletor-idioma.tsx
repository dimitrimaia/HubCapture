'use client'

import { Languages } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { caminhoEquivalente, type Idioma, idiomaDoCaminho, IDIOMAS } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Bandeiras em SVG (emoji de bandeira vira "US"/"BR" em texto no Windows). */
function Bandeira({ idioma }: { idioma: Idioma }) {
  const comum = 'h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10'
  if (idioma === 'pt')
    return (
      <svg viewBox="0 0 18 12" className={comum} aria-hidden="true">
        <rect width="18" height="12" fill="#009b3a" />
        <path d="M9 1.5 16 6 9 10.5 2 6Z" fill="#fedf00" />
        <circle cx="9" cy="6" r="2.4" fill="#002776" />
      </svg>
    )
  if (idioma === 'es')
    return (
      <svg viewBox="0 0 18 12" className={comum} aria-hidden="true">
        <rect width="18" height="12" fill="#aa151b" />
        <rect y="3" width="18" height="6" fill="#f1bf00" />
      </svg>
    )
  return (
    <svg viewBox="0 0 18 12" className={comum} aria-hidden="true">
      <rect width="18" height="12" fill="#fff" />
      {[0, 2, 4, 6, 8, 10].map((y) => (
        <rect key={y} y={y} width="18" height="1" fill="#b22234" />
      ))}
      <rect width="8" height="6.5" fill="#3c3b6e" />
    </svg>
  )
}

const TITULO: Record<Idioma, string> = { pt: 'Idioma', en: 'Language', es: 'Idioma' }

/** "IDIOMA  [EN] [ES] [PT]": leva para a mesma página no idioma escolhido. */
export function SeletorIdioma({ onEscolher, className }: { onEscolher?: () => void; className?: string }) {
  const caminho = usePathname()
  const atual = idiomaDoCaminho(caminho)
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">
        <Languages className="size-3.5" aria-hidden="true" />
        {TITULO[atual]}
      </p>
      <ul className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-foreground/[0.03] p-1">
        {IDIOMAS.map((idioma) => (
          <li key={idioma.id}>
            <Link
              href={caminhoEquivalente(caminho, idioma.id)}
              hrefLang={idioma.hreflang}
              lang={idioma.hreflang}
              onClick={onEscolher}
              aria-current={idioma.id === atual ? 'true' : undefined}
              title={idioma.nome}
              className={cn(
                'flex h-9 items-center justify-center gap-2 rounded-xl text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring',
                idioma.id === atual ? 'bg-background font-semibold text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Bandeira idioma={idioma.id} />
              {idioma.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
