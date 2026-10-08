import Image from 'next/image'
import { Briefcase, Check, Home } from 'lucide-react'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'

const modes = [
  {
    icon: Home,
    tag: 'Residencial',
    title: 'Ganhe por hora em casa',
    rate: 'R$ 35',
    image: '/images/mode-residential.png',
    alt: 'Visão em primeira pessoa de mãos dobrando roupas em casa',
    items: ['Tarefas do dia a dia: lavar, cozinhar, organizar', 'Grave no seu horário, no seu ritmo', 'Ideal para começar hoje'],
    featured: false,
  },
  {
    icon: Briefcase,
    tag: 'Profissional',
    title: 'Ganhe por hora no trabalho',
    rate: 'R$ 50',
    image: '/images/mode-professional.png',
    alt: 'Visão em primeira pessoa de mãos consertando um motor em uma oficina',
    items: [
      'Atividades comerciais reais durante o expediente',
      'Mais de 100 tarefas em 14 setores profissionais',
      'Com autorização do responsável pelo local',
    ],
    featured: true,
  },
]

export function EarningModes() {
  return (
    <section id="modos" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Categorias de ganhos</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Dois modos. Você escolhe onde gravar.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Alterne entre Casa e Trabalho no app sempre que quiser. Os valores são por hora de gravação aprovada.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {modes.map((mode) => (
            <article
              key={mode.tag}
              className={
                mode.featured
                  ? 'relative overflow-hidden rounded-3xl border border-primary/35 bg-card shadow-[0_0_60px_-20px] shadow-primary/40'
                  : 'glass relative overflow-hidden rounded-3xl'
              }
            >
              <div className="relative aspect-[16/9]">
                <Image src={mode.image} alt={mode.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <span className="glass absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                  <mode.icon className="size-3.5 text-primary" aria-hidden="true" />
                  {`Modo ${mode.tag}`}
                </span>
                {mode.featured && (
                  <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-foreground">
                    Maior ganho
                  </span>
                )}
              </div>
              <div className="relative flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight">{mode.title}</h3>
                  <p className="text-right">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      até
                    </span>
                    <span className="text-3xl font-semibold text-primary">{mode.rate}</span>
                    <span className="text-muted-foreground">/h</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {mode.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <CtaLink variant={mode.featured ? 'primary' : 'outline'} withArrow className="w-full sm:w-fit">
                  {`Começar no modo ${mode.tag}`}
                </CtaLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
