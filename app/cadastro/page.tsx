import { ExternalLink, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { CopyCodeButton } from '@/components/landing/copy-code-button'
import { SiteShell } from '@/components/landing/site-shell'
import { StoreBadges } from '@/components/landing/store-badges'
import { CADASTRO_PATH, SIGNUP_URL } from '@/lib/site'

const title = 'Cadastro Hub Capture com o código VEMHUB | Login no Hub App'
const description =
  'Crie sua conta ou faça login no Hub Capture direto pela página oficial da Hub Data, com o código de convite VEMHUB já aplicado. Cadastro grátis.'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: CADASTRO_PATH },
  openGraph: { title, description, url: CADASTRO_PATH },
  twitter: { title, description },
}

export default function CadastroPage() {
  return (
    <SiteShell>
      <section aria-labelledby="cadastro-title" className="px-4 pt-6 pb-16 sm:px-6 md:pt-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h1 id="cadastro-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Cadastro e login no <span className="text-primary">Hub Capture</span>
              </h1>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Esta é a página oficial da Hub Data, com o código de convite VEMHUB já aplicado.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CopyCodeButton size="sm" />
              <a
                href={SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                Abrir em nova aba
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-black/20">
            <iframe
              src={SIGNUP_URL}
              title="Cadastro oficial Hub Data com o código VEMHUB"
              allow="clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              className="block h-[calc(100dvh-12rem)] min-h-[36rem] w-full"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            O formulário não carregou ou o login não avançou?{' '}
            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
              Abra o cadastro em uma nova aba
            </a>
            .
          </p>

          <div className="glass mt-6 flex flex-col items-center gap-4 rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Depois do cadastro, baixe o app Hub Capture</h2>
            <StoreBadges className="justify-center" />
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
