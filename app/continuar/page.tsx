import { ArrowRight, Download, ExternalLink, PlayCircle, UserPlus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyCodeButton } from '@/components/landing/copy-code-button'
import { ctaClasses } from '@/components/landing/cta-link'
import { Eyebrow } from '@/components/landing/eyebrow'
import { SiteShell } from '@/components/landing/site-shell'
import { StoreBadges } from '@/components/landing/store-badges'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import { waLink } from '@/lib/phone'
import { REFERRAL_CODE, SIGNUP_URL, TUTORIAIS_PATH, WHATSAPP_ATENDIMENTO, WHATSAPP_COMMUNITY_URL } from '@/lib/site'

/**
 * Destino dos links enviados no WhatsApp (campanhas e atendimento): a pessoa JÁ deixou nome e
 * WhatsApp, então aqui não tem formulário, só o próximo passo. Fora do Google (noindex).
 */
export const metadata: Metadata = {
  title: { absolute: 'Falta só criar sua conta | Hub Capture' },
  description: `Crie sua conta na Hub com o código ${REFERRAL_CODE} já aplicado e comece a gravar.`,
  robots: { index: false, follow: true },
}

const PASSOS = [
  { icone: UserPlus, titulo: 'Crie sua conta na Hub', texto: `Pelo botão verde acima, o código ${REFERRAL_CODE} já vem aplicado. Leva uns 2 minutos.` },
  { icone: Download, titulo: 'Baixe o app Hub Capture', texto: 'Entre com o mesmo e-mail da conta e peça o Starter Kit grátis.' },
  { icone: PlayCircle, titulo: 'Faça a primeira gravação', texto: 'Siga os tutoriais para ter os vídeos aprovados logo de cara.' },
]

export default function ContinuarPage() {
  return (
    <SiteShell>
      <section className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <div>
            <Eyebrow>Você já está quase lá</Eyebrow>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Falta só criar sua conta na Hub</h1>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Seus dados já chegaram até a gente. Agora é só criar a conta oficial na Hub, com o código <strong className="font-mono text-foreground">{REFERRAL_CODE}</strong>{' '}
              já aplicado, e baixar o app.
            </p>
          </div>

          <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'lg', className: 'h-14 w-full text-base' })}>
            Criar minha conta com o {REFERRAL_CODE}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Se pedirem o código de convite:</span>
            <CopyCodeButton size="sm" />
          </div>

          <ol className="flex flex-col gap-3">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="glass flex gap-4 rounded-2xl p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <passo.icone className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-mono text-[11px] font-bold tracking-[0.15em] text-primary uppercase">Passo {i + 1}</span>
                  <span className="block font-semibold">{passo.titulo}</span>
                  <span className="block text-sm text-muted-foreground">{passo.texto}</span>
                </span>
              </li>
            ))}
          </ol>

          <StoreBadges className="justify-center" />

          <div className="flex flex-col gap-2 border-t border-border pt-6">
            <Link href={TUTORIAIS_PATH} className={ctaClasses({ variant: 'outline', size: 'lg', className: 'w-full' })}>
              <PlayCircle className="size-5" aria-hidden="true" />
              Ver os tutoriais em vídeo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            {WHATSAPP_ATENDIMENTO ? (
              <a
                href={waLink(WHATSAPP_ATENDIMENTO, 'Oi! Recebi a mensagem do Hub Capture e quero ajuda para criar minha conta.')}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClasses({ variant: 'outline', size: 'lg', className: 'w-full' })}
              >
                <WhatsappIcon className="size-5 text-primary" />
                Tirar dúvidas no WhatsApp
              </a>
            ) : (
              <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ variant: 'outline', size: 'lg', className: 'w-full' })}>
                <WhatsappIcon className="size-5 text-primary" />
                Entrar na comunidade do WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
