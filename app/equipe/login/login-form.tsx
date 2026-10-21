'use client'

import { Loader2, LogIn } from 'lucide-react'
import { useActionState } from 'react'
import { ctaClasses } from '@/components/landing/cta-link'
import { entrar, type EstadoLogin } from '../actions'

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-base text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40'

export function LoginForm() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {})

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="equipe-nome" className="text-sm font-medium">
          Seu nome
        </label>
        <input id="equipe-nome" name="nome" autoComplete="given-name" required defaultValue={estado.nome} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="equipe-senha" className="text-sm font-medium">
          Senha da equipe
        </label>
        <input
          id="equipe-senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          autoFocus={Boolean(estado.erro)}
          className={inputClass}
        />
      </div>
      {estado.erro && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={enviando} className={ctaClasses({ size: 'lg', className: 'w-full disabled:opacity-70' })}>
        {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        Entrar
      </button>
    </form>
  )
}
