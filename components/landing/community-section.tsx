import { ArrowUpRight, Bell, Headset, MessageCircleQuestion } from 'lucide-react'
import { INSTAGRAM_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'
import { Eyebrow } from './eyebrow'
import { InstagramIcon } from './instagram-icon'
import { WhatsappIcon } from './whatsapp-icon'

const benefits = [
  { icon: MessageCircleQuestion, label: 'Tire dúvidas direto comigo' },
  { icon: Headset, label: 'Suporte mais rápido' },
  { icon: Bell, label: 'Avisos de novas tarefas e sorteios' },
]

export function CommunityLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      <a
        href={WHATSAPP_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={ctaClasses({ size: 'lg', className: 'w-full' })}
      >
        <WhatsappIcon className="size-5" />
        Entrar na comunidade
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={ctaClasses({ variant: 'outline', size: 'lg', className: 'w-full' })}
      >
        <InstagramIcon className="size-5" />
        Seguir @hubcapture
      </a>
    </div>
  )
}

export function CommunitySection() {
  return (
    <section id="comunidade" aria-labelledby="comunidade-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="relative overflow-hidden rounded-3xl border border-primary/35 bg-card p-6 shadow-[0_0_60px_-20px] shadow-primary/40 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-5">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow">
              <WhatsappIcon className="size-7" />
            </span>
            <Eyebrow>Comunidade no WhatsApp</Eyebrow>
            <h2 id="comunidade-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Entre na comunidade Hub Capture e fale direto comigo
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Um grupo para quem grava na Hub Data: contato direto com o Dimitri, respostas rápidas para suas dúvidas,
              dicas para aprovar mais vídeos e suporte no começo.
            </p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <li key={benefit.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <benefit.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {benefit.label}
                </li>
              ))}
            </ul>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClasses({ size: 'lg', className: 'w-full sm:w-fit' })}
            >
              <WhatsappIcon className="size-5" />
              Entrar na comunidade
            </a>
          </div>
        </article>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="glass group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl p-6 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring sm:p-10"
        >
          <div className="flex flex-col gap-5">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white">
              <InstagramIcon className="size-7" />
            </span>
            <Eyebrow>Instagram oficial</Eyebrow>
            <p className="text-2xl font-semibold tracking-tight">@hubcapture</p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Bastidores, tutoriais rápidos, resultados de quem já grava e os sorteios do código VEMHUB.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 font-medium text-primary">
            Seguir no Instagram
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  )
}
