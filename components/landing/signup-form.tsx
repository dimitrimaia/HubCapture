'use client'

import { lerRastreio } from './rastreio-visita'
import { ArrowRight, Check, CheckCircle2, ExternalLink, Loader2, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { type CadastroErrors, normalizeCadastroLead, validateCadastroLead } from '@/lib/cadastro'
import {
  type CadastroLocal,
  concluirCadastroLocal,
  enviarAcao,
  esquecerCadastroLocal,
  lerCadastroLocal,
  salvarCadastroLocal,
} from '@/lib/cadastro-local'
import { formatWhatsapp, waLink } from '@/lib/phone'
import { REFERRAL_CODE, SIGNUP_URL, TUTORIAIS_PATH, WHATSAPP_ATENDIMENTO, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'
import { StoreBadges } from './store-badges'
import { WhatsappIcon } from './whatsapp-icon'

const SAVE_TIMEOUT_MS = 4000

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-background/60 px-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive'

export function SignupForm() {
  const [cadastro, setCadastro] = useState<CadastroLocal | null>(null)

  // Quem já deixou os dados (nesta ou em outra visita) volta direto para o próximo passo.
  useEffect(() => {
    setCadastro(lerCadastroLocal())
  }, [])

  if (cadastro) {
    return (
      <ProximoPasso
        cadastro={cadastro}
        onConcluir={() => setCadastro((atual) => (atual ? { ...atual, etapa: 'concluido' } : atual))}
        onRecomecar={() => {
          esquecerCadastroLocal()
          setCadastro(null)
        }}
      />
    )
  }
  return <DadosForm onEnviado={setCadastro} />
}

function DadosForm({ onEnviado }: { onEnviado: (cadastro: CadastroLocal) => void }) {
  const [form, setForm] = useState({ nome: '', whatsapp: '' })
  const [errors, setErrors] = useState<CadastroErrors>({})
  const [sending, setSending] = useState(false)

  function update(key: 'nome' | 'whatsapp', value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const campos = new FormData(event.currentTarget)
    const honeypot = campos.get('website')
    const consentimento = campos.get('consentimento') === 'on'
    const lead = normalizeCadastroLead(form)
    const validation = validateCadastroLead(lead)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setSending(true)
    let id: string | null = null
    try {
      const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, consentimento, rastreio: lerRastreio(), website: honeypot ?? '' }),
        signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 400 && data.errors) {
        setErrors(data.errors)
        setSending(false)
        return
      }
      id = typeof data.id === 'string' ? data.id : null
    } catch {
      // Mesmo que o salvamento falhe, a pessoa segue para o próximo passo: não perdemos a conversão.
    }
    const cadastro: CadastroLocal = { id, nome: lead.nome, whatsapp: lead.whatsapp, etapa: 'pendente', em: Date.now() }
    salvarCadastroLocal(cadastro)
    onEnviado(cadastro)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Comece em menos de 1 minuto</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Passo 1 de 2 · seus dados</p>
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

        <label className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
          <input type="checkbox" name="consentimento" className="mt-0.5 size-5 shrink-0 accent-primary" />
          Aceito receber mensagens do Hub Capture no WhatsApp (dicas e lembretes; posso sair quando quiser respondendo SAIR).
        </label>

        {/* Honeypot anti-spam: invisível para pessoas */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <button
          type="submit"
          disabled={sending}
          className={ctaClasses({ size: 'lg', className: 'mt-1 w-full disabled:opacity-70' })}
        >
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {sending ? 'Enviando…' : 'Continuar'}
          {!sending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Usamos seu WhatsApp só para te ajudar no cadastro e enviar avisos da comunidade (LGPD). No próximo passo você
          cria sua conta na página oficial da Hub com o código {REFERRAL_CODE} já aplicado.
        </p>
      </form>
    </div>
  )
}

function ProximoPasso({
  cadastro,
  onConcluir,
  onRecomecar,
}: {
  cadastro: CadastroLocal
  onConcluir: () => void
  onRecomecar: () => void
}) {
  const primeiroNome = cadastro.nome.split(/\s+/)[0]
  const abriuCadastro = cadastro.etapa === 'concluido'
  const textoWhatsapp = `Oi! Sou ${primeiroNome}, me cadastrei no site Hub Capture e quero ajuda para começar.`

  return (
    <div aria-live="polite">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {abriuCadastro ? `Boa, ${primeiroNome}! Agora é com o app` : `Pronto, ${primeiroNome}! Falta 1 passo`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {abriuCadastro ? 'Passo 2 de 2 · conta aberta em nova aba' : 'Passo 2 de 2 · crie sua conta na Hub'}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        {abriuCadastro ? (
          <>
            Terminou de criar a conta? Baixe o app <strong className="text-foreground">Hub Capture</strong> e entre com o
            mesmo e-mail para gravar sua primeira tarefa.
          </>
        ) : (
          <>
            Crie sua conta na página oficial da Hub. O código{' '}
            <strong className="font-mono text-foreground">{REFERRAL_CODE}</strong> já vem aplicado e leva cerca de 2
            minutos.
          </>
        )}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            enviarAcao('cadastrar')
            concluirCadastroLocal()
            onConcluir()
          }}
          className={ctaClasses({
            size: 'lg',
            variant: abriuCadastro ? 'outline' : 'primary',
            className: 'h-14 w-full text-base',
          })}
        >
          {abriuCadastro ? (
            'Abrir o cadastro de novo'
          ) : (
            <>
              <span className="min-[400px]:hidden">Criar conta com o {REFERRAL_CODE}</span>
              <span className="max-[399px]:hidden">Criar minha conta com o {REFERRAL_CODE}</span>
            </>
          )}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>

        {abriuCadastro && <StoreBadges stacked />}

        {WHATSAPP_ATENDIMENTO ? (
          <a
            href={waLink(WHATSAPP_ATENDIMENTO, textoWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => enviarAcao('whatsapp')}
            className={ctaClasses({ variant: 'outline', size: 'lg', className: 'h-14 w-full text-base' })}
          >
            <WhatsappIcon className="size-5 text-primary" />
            Tirar dúvidas no WhatsApp
          </a>
        ) : null}

        <a
          href={WHATSAPP_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => enviarAcao('comunidade')}
          className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <WhatsappIcon className="size-4" />
          Entrar na comunidade do WhatsApp
        </a>
      </div>

      <ul className="mt-5 flex flex-col gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" aria-hidden="true" />
          Dados enviados
        </li>
        <li className={`flex items-center gap-2 ${abriuCadastro ? '' : 'text-foreground'}`}>
          <Check className={`size-4 ${abriuCadastro ? 'text-primary' : 'text-muted-foreground/40'}`} aria-hidden="true" />
          Criar a conta com {REFERRAL_CODE}
        </li>
        <li className="flex items-center gap-2">
          <PlayCircle className="size-4 text-muted-foreground/60" aria-hidden="true" />
          <Link href={TUTORIAIS_PATH} className="underline-offset-4 hover:text-foreground hover:underline">
            Ver os tutoriais da primeira gravação
          </Link>
        </li>
      </ul>

      <button
        type="button"
        onClick={onRecomecar}
        className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Não é você? Preencher de novo
      </button>
    </div>
  )
}
