'use client'

import { Drill, Sofa } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Mode, useMode } from './mode-context'

const options: { value: Mode; label: string; icon: typeof Drill }[] = [
  { value: 'trabalho', label: 'No trabalho', icon: Drill },
  { value: 'casa', label: 'Em casa', icon: Sofa },
]

export function ModeBar() {
  const { mode, setMode } = useMode()

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div
        role="group"
        aria-label="Escolha onde você quer gravar"
        className="relative flex w-full max-w-sm gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <span className="absolute -top-2.5 -left-1 z-10 -rotate-12 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
          Novo
        </span>
        {options.map((option) => {
          const active = mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setMode(option.value)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={cn(
                'flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring',
                active
                  ? 'glow bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )}
            >
              <option.icon className="size-4" aria-hidden="true" />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
