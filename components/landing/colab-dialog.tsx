'use client'

import { Dialog } from '@base-ui/react/dialog'
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react'
import { createContext, useContext, useState } from 'react'
import {
  type ColabErrors,
  FOLLOWER_RANGES,
  normalizeColabLead,
  validateColabLead,
} from '@/lib/colab'
import { formatWhatsapp } from '@/lib/phone'
import { ctaClasses } from './cta-link'
import { useMode } from './mode-context'

type Status = 'idle' | 'sending' | 'success' | 'error'

const ColabContext = createContext<{ open: () => void } | null>(null)

export function ColabProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ColabContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <ColabDialog open={isOpen} onOpenChange={setIsOpen} />
    </ColabContext.Provider>
  )
}

export function useColab() {
  const context = useContext(ColabContext)
  if (!context) throw new Error('useColab must be used within ColabProvider')
  return context
}

export function ColabButton({
  children = 'Colab com Influencers',
  variant = 'primary',
  size = 'md',
  className,
  onClick,
}: {
  children?: React.ReactNode
  variant?: 'primary' | 'outline' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}) {
  const { open } = useColab()
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        open()
      }}
      className={ctaClasses({ variant, size, className })}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      {children}
    </button>
  )
}

const emptyForm = { nome: '', perfil: '', seguidores: '', email: '', whatsapp: '', consentimento: false }

function ColabDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mode } = useMode()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<ColabErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const honeypot = new FormData(event.currentTarget).get('website')
    const lead = normalizeColabLead(form)
    const validation = validateColabLead(lead)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('/api/colab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, website: honeypot ?? '' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data.errors) setErrors(data.errors)
        throw new Error(data.error)
      }
      setStatus('success')
      setForm(emptyForm)
    } catch {
      setStatus('error')
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next && status === 'success') setStatus('idle')
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto sm:items-center sm:p-6">
          <Dialog.Popup
            data-mode={mode}
            className="relative max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all duration-200 outline-none data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0 sm:rounded-3xl sm:p-8"
          >
            <Dialog.Close
              aria-label="Fechar"
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>

            {status === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
                <Dialog.Title className="text-2xl font-semibold tracking-tight">Recebemos seu cadastro!</Dialog.Title>
                <Dialog.Description className="text-muted-foreground">
                  Nossa equipe vai analisar seu perfil e falar com você pelo WhatsApp ou e-mail informado.
                </Dialog.Description>
                <Dialog.Close className={ctaClasses({ className: 'mt-2' })}>Fechar</Dialog.Close>
              </div>
            ) : (
              <>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Creators</p>
                <Dialog.Title className="mt-2 pr-10 text-2xl font-semibold tracking-tight">
                  Colab com Influencers
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Cria conteúdo no Instagram ou TikTok? Faça parceria com o Hub Capture e divulgue o código VEMHUB.
                </Dialog.Description>

                <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                  <Field id="colab-nome" label="Nome" error={errors.nome}>
                    <input
                      id="colab-nome"
                      autoComplete="name"
                      value={form.nome}
                      onChange={(event) => update('nome', event.target.value)}
                      {...fieldProps('colab-nome', errors.nome)}
                    />
                  </Field>
                  <Field id="colab-perfil" label="Instagram ou TikTok" error={errors.perfil}>
                    <input
                      id="colab-perfil"
                      placeholder="@seuperfil"
                      autoCapitalize="none"
                      value={form.perfil}
                      onChange={(event) => update('perfil', event.target.value)}
                      {...fieldProps('colab-perfil', errors.perfil)}
                    />
                  </Field>
                  <Field id="colab-seguidores" label="Número de seguidores" error={errors.seguidores}>
                    <select
                      id="colab-seguidores"
                      value={form.seguidores}
                      onChange={(event) => update('seguidores', event.target.value)}
                      {...fieldProps('colab-seguidores', errors.seguidores)}
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {FOLLOWER_RANGES.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="colab-email" label="E-mail" error={errors.email}>
                      <input
                        id="colab-email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        {...fieldProps('colab-email', errors.email)}
                      />
                    </Field>
                    <Field id="colab-whatsapp" label="WhatsApp" error={errors.whatsapp}>
                      <input
                        id="colab-whatsapp"
                        type="tel"
                        autoComplete="tel-national"
                        inputMode="tel"
                        placeholder="(11) 91234-5678"
                        value={form.whatsapp}
                        onChange={(event) => update('whatsapp', formatWhatsapp(event.target.value))}
                        {...fieldProps('colab-whatsapp', errors.whatsapp)}
                      />
                    </Field>
                  </div>

                  {/* Honeypot anti-spam: invisível para pessoas */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                  <div>
                    <label className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={form.consentimento}
                        onChange={(event) => update('consentimento', event.target.checked)}
                        aria-invalid={errors.consentimento ? true : undefined}
                        aria-describedby={errors.consentimento ? 'colab-consentimento-erro' : undefined}
                        className="mt-0.5 size-5 shrink-0 accent-primary"
                      />
                      Autorizo o contato da equipe Hub Capture por WhatsApp e e-mail sobre parcerias (LGPD).
                    </label>
                    {errors.consentimento && <FieldError id="colab-consentimento-erro">{errors.consentimento}</FieldError>}
                  </div>

                  {status === 'error' && (
                    <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                      Não foi possível enviar agora. Verifique sua conexão e tente novamente.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className={ctaClasses({ size: 'lg', className: 'mt-2 w-full disabled:opacity-70' })}
                  >
                    {status === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    {status === 'sending' ? 'Enviando…' : 'Quero fazer parceria'}
                  </button>
                </form>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive'

function fieldProps(id: string, error?: string) {
  return {
    className: inputClass,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-erro` : undefined,
  } as const
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <FieldError id={`${id}-erro`}>{error}</FieldError>}
    </div>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1 text-sm text-destructive">
      {children}
    </p>
  )
}
