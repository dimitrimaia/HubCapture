'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { type CadastroErrors, normalizeCadastroLead, validateCadastroLead } from '@/lib/cadastro'
import { formatWhatsapp } from '@/lib/phone'
import { SIGNUP_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'

const SAVE_TIMEOUT_MS = 4000

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive'

export function SignupForm() {
  const [form, setForm] = useState({ nome: '', whatsapp: '' })
  const [errors, setErrors] = useState<CadastroErrors>({})
  const [sending, setSending] = useState(false)

  function update(key: 'nome' | 'whatsapp', value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const honeypot = new FormData(event.currentTarget).get('website')
    const lead = normalizeCadastroLead(form)
    const validation = validateCadastroLead(lead)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setSending(true)
    try {
      await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, website: honeypot ?? '' }),
        signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
      })
    } catch {
      // Mesmo que a planilha falhe, a pessoa segue para o cadastro: não perdemos a conversão.
    }
    window.location.assign(SIGNUP_URL)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cadastro-nome" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="cadastro-nome"
          autoComplete="name"
          value={form.nome}
          onChange={(event) => update('nome', event.target.value)}
          aria-invalid={errors.nome ? true : undefined}
          aria-describedby={errors.nome ? 'cadastro-nome-erro' : undefined}
          className={inputClass}
        />
        {errors.nome && (
          <p id="cadastro-nome-erro" className="text-sm text-destructive">
            {errors.nome}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cadastro-whatsapp" className="text-sm font-medium">
          WhatsApp
        </label>
        <input
          id="cadastro-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(11) 91234-5678"
          value={form.whatsapp}
          onChange={(event) => update('whatsapp', formatWhatsapp(event.target.value))}
          aria-invalid={errors.whatsapp ? true : undefined}
          aria-describedby={errors.whatsapp ? 'cadastro-whatsapp-erro' : undefined}
          className={inputClass}
        />
        {errors.whatsapp && (
          <p id="cadastro-whatsapp-erro" className="text-sm text-destructive">
            {errors.whatsapp}
          </p>
        )}
      </div>

      {/* Honeypot anti-spam: invisível para pessoas */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        disabled={sending}
        className={ctaClasses({ size: 'lg', className: 'mt-1 w-full disabled:opacity-70' })}
      >
        {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {sending ? 'Abrindo o cadastro…' : 'Continuar para o cadastro'}
        {!sending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
      </button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Usamos seu WhatsApp só para te ajudar no cadastro e enviar avisos da comunidade (LGPD). Em seguida você vai para
        a página oficial da Hub com o código VEMHUB já aplicado.
      </p>
    </form>
  )
}
