'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { REFERRAL_CODE } from '@/lib/site'

export function CopyCodeButton({ size = 'lg', className }: { size?: 'sm' | 'lg'; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar código ${REFERRAL_CODE}`}
      className={cn(
        'group inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10 font-mono font-bold tracking-[0.2em] text-primary transition-all outline-none hover:border-primary hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring',
        size === 'lg' ? 'h-16 px-6 text-2xl sm:text-3xl' : 'h-10 px-3 text-sm',
        className,
      )}
    >
      {REFERRAL_CODE}
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-primary font-sans font-semibold tracking-normal text-primary-foreground',
          size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[11px]',
        )}
      >
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Copiado!' : 'Copiar'}</span>
      </span>
    </button>
  )
}
