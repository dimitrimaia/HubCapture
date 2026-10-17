import { BadgeCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { CommunityLinks } from '@/components/landing/community-section'
import { CopyCodeButton } from '@/components/landing/copy-code-button'
import { Eyebrow } from '@/components/landing/eyebrow'
import { SignupForm } from '@/components/landing/signup-form'
import { SiteShell } from '@/components/landing/site-shell'
import { StoreBadges } from '@/components/landing/store-badges'
import { CADASTRO_PATH } from '@/lib/site'

const title = 'Cadastro Hub Capture com o código VEMHUB | Comece no Hub App'
const description =
  'Cadastre-se grátis no Hub Capture com o código de convite VEMHUB: informe nome e WhatsApp e siga para a página oficial da Hub Data com o código já aplicado.'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: CADASTRO_PATH },
  openGraph: { title, description, url: CADASTRO_PATH },
  twitter: { title, description },
}

const benefits = [
  'Cadastro gratuito na Hub Data',
  'Código VEMHUB aplicado automaticamente',
  'Starter Kit grátis e sorteios exclusivos',
  'Suporte na comunidade do WhatsApp',
]

export default function CadastroPage() {
  return (
    <SiteShell>
      <section aria-labelledby="cadastro-title" className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-12">
          <div className="flex flex-col gap-5">
            <Eyebrow>Cadastro com VEMHUB</Eyebrow>
            <h1 id="cadastro-title" className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Crie sua conta no <span className="text-primary">Hub Capture</span>
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              Deixe seu nome e WhatsApp para eu te ajudar nos primeiros passos. Logo depois você segue para a página
              oficial da Hub com o código de convite já preenchido.
            </p>
            <ul className="flex flex-col gap-2.5">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Código oficial:</span>
              <CopyCodeButton size="sm" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-primary/35 bg-card p-6 shadow-[0_0_60px_-20px] shadow-primary/40 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-xl font-semibold tracking-tight">Comece em menos de 1 minuto</h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">Passo 1 de 2 · seus dados</p>
              <SignupForm />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
          <div className="glass flex flex-col gap-4 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Dúvidas? Fale comigo</h2>
            <p className="text-sm text-muted-foreground">
              Na comunidade do WhatsApp você tira dúvidas direto comigo e recebe suporte mais rápido.
            </p>
            <CommunityLinks className="flex flex-col gap-3" />
          </div>
          <div className="glass flex flex-col gap-4 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Depois do cadastro, baixe o app</h2>
            <p className="text-sm text-muted-foreground">Grave suas tarefas pelo app Hub Capture, no Android ou iPhone.</p>
            <StoreBadges stacked />
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
