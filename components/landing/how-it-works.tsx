import { Camera, ShieldCheck, UserPlus } from 'lucide-react'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastro gratuito',
    description:
      'Crie sua conta em minutos e peça o Starter Kit: faixa de cabeça e suporte para o celular, enviados sem custo até você.',
  },
  {
    icon: Camera,
    title: 'Capture o mundo real',
    description:
      'Prenda o celular na cabeça e grave tarefas cotidianas do começo ao fim — arrumar a casa, cozinhar, consertar, montar.',
  },
  {
    icon: ShieldCheck,
    title: 'Receba com segurança',
    description:
      'Cada vídeo passa por verificação de qualidade. As horas aprovadas são creditadas no painel e pagas via PIX.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Comece a ganhar em 3 passos simples
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Sem equipamento caro, sem experiência com vídeo. Só o seu celular e as tarefas que você já faz.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="glass group relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
                  {`PASSO 0${index + 1}`}
                </span>
              </div>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <CtaLink size="lg" withArrow>
            Fazer meu cadastro gratuito
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
