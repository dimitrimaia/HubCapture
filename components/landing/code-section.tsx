import { BadgeCheck, Gift, Package, ShieldCheck, Trophy } from 'lucide-react'
import { CopyCodeButton } from './copy-code-button'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Código oficial',
    description: 'Convite reconhecido pela plataforma. Sua conta fica vinculada ao programa sem nenhum custo.',
  },
  {
    icon: Trophy,
    title: 'Sorteios exclusivos',
    description: 'Quem se cadastra com VEMHUB participa dos sorteios divulgados aqui no site, como consoles e prêmios em PIX.',
  },
  {
    icon: Package,
    title: 'Starter Kit grátis',
    description: 'Faixa de cabeça e suporte de celular enviados até você para começar a gravar com as mãos livres.',
  },
  {
    icon: BadgeCheck,
    title: 'Suporte no começo',
    description: 'Tutorial completo nesta página para fazer suas primeiras gravações serem aprovadas.',
  },
]

export function CodeSection() {
  return (
    <section id="codigo-vemhub" aria-labelledby="codigo-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 sm:p-10 md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <Eyebrow>Código de convite oficial</Eyebrow>
            <h2 id="codigo-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Use o código <span className="text-primary">VEMHUB</span> no cadastro e concorra a prêmios
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Copie o código abaixo e cole no campo de convite ao criar sua conta na Hub. Se você usar o link de
              cadastro deste site, o código já é aplicado automaticamente.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CopyCodeButton />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaLink size="lg" withArrow>
                Cadastrar com VEMHUB
              </CtaLink>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gift className="size-4 text-primary" aria-hidden="true" />
                Sorteio ativo: PlayStation 5
              </p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="glass rounded-2xl p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <benefit.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
