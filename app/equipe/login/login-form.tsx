'use client'

import { KeyRound, Loader2, LogIn, ShieldCheck } from 'lucide-react'
import { useActionState } from 'react'
import { ctaClasses } from '@/components/landing/cta-link'
import { criarPrimeiroAdmin, entrar, type EstadoInstalacao, type EstadoLogin } from '../actions'

export const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-base text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40'

function Campo({ id, rotulo, dica, ...props }: { id: string; rotulo: string; dica?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      <input id={id} className={inputClass} {...props} />
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}

function Erro({ texto }: { texto?: string }) {
  return texto ? (
    <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
      {texto}
    </p>
  ) : null
}

export function LoginForm() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {})

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Campo id="equipe-usuario" name="usuario" rotulo="Usuário" autoComplete="username" autoCapitalize="none" required defaultValue={estado.usuario} />
      <Campo id="equipe-senha" name="senha" type="password" rotulo="Senha" autoComplete="current-password" required autoFocus={Boolean(estado.erro && !estado.pedirCodigo)} />
      {estado.pedirCodigo && (
        <Campo
          id="equipe-codigo"
          name="codigo"
          rotulo="Código do app autenticador"
          dica="Abra o Google Authenticator (ou similar) e digite os 6 dígitos. Digite a senha de novo também."
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
        />
      )}
      <Erro texto={estado.erro} />
      <button type="submit" disabled={enviando} className={ctaClasses({ size: 'lg', className: 'w-full disabled:opacity-70' })}>
        {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        Entrar
      </button>
    </form>
  )
}

export function PrimeiroAdminForm() {
  const [estado, acao, enviando] = useActionState<EstadoInstalacao, FormData>(criarPrimeiroAdmin, {})

  return (
    <form action={acao} className="flex flex-col gap-4">
      <p className="flex gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Primeiro acesso: crie a conta de administrador. Depois disso a chave de instalação não serve mais para entrar.
      </p>
      <Campo id="adm-nome" name="nome" rotulo="Seu nome" autoComplete="name" required defaultValue={estado.nome} />
      <Campo
        id="adm-usuario"
        name="usuario"
        rotulo="Usuário"
        dica="Pode ser seu e-mail. É o que você vai digitar para entrar."
        autoComplete="username"
        autoCapitalize="none"
        required
        defaultValue={estado.usuario}
      />
      <Campo id="adm-senha" name="senha" type="password" rotulo="Senha (mínimo 10 caracteres)" autoComplete="new-password" minLength={10} required />
      <Campo
        id="adm-chave"
        name="chave"
        type="password"
        rotulo="Chave de instalação"
        dica="É o valor de EQUIPE_SENHA na Vercel."
        autoComplete="off"
        required
      />
      <Erro texto={estado.erro} />
      <button type="submit" disabled={enviando} className={ctaClasses({ size: 'lg', className: 'w-full disabled:opacity-70' })}>
        {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
        Criar administrador
      </button>
    </form>
  )
}
