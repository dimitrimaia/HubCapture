import Image from 'next/image'
import { BadgeCheck, CircleDot } from 'lucide-react'
import { CopyCodeButton } from './copy-code-button'
import { CtaLink } from './cta-link'
import { ModeSwitch } from './mode-context'

const highlights = ['Cadastro gratuito', 'Starter Kit grátis', 'Saque via PIX']

export function Hero() {
  return (
    <section id="topo" className="relative px-4 pt-8 pb-16 sm:px-6 md:pt-14 md:pb-24">
      <div className="glass relative mx-auto grid max-w-6xl overflow-hidden rounded-3xl md:grid-cols-[1.1fr_1fr]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 size-[28rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-7 p-6 sm:p-10 md:p-12 lg:p-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            <CircleDot className="size-3 animate-pulse" aria-hidden="true" />
            <ModeSwitch trabalho="Modo trabalho · Comercial" casa="Modo casa · Residencial" />
          </span>

          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Filmou, <span className="text-primary">ganhou.</span>{' '}
            <span className="block text-3xl sm:text-4xl lg:text-5xl">
              Ganhe dinheiro gravando vídeos com o celular.
            </span>
          </h1>

          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            <ModeSwitch
              trabalho="Na Hub Data você grava atividades profissionais reais no seu trabalho, com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX."
              casa="Na Hub Data você grava tarefas do dia a dia em casa — cozinhar, organizar, lavar — com o celular na faixa de cabeça. Os vídeos treinam inteligência artificial e você recebe por hora aprovada, via PIX."
            />
          </p>

          <div className="flex items-end gap-3">
            <p className="whitespace-nowrap text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
              <ModeSwitch trabalho="R$ 50" casa="R$ 35" />
              <span className="text-2xl text-primary/70 sm:text-3xl">/h</span>
            </p>
            <p className="pb-2 text-sm leading-snug text-muted-foreground">
              até, por hora
              <br />
              de gravação aprovada
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink size="lg" withArrow>
              Cadastrar com VEMHUB
            </CtaLink>
            <a
              href="#tutorial"
              className="inline-flex h-13 items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver tutorial completo
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Código oficial:</span>
            <CopyCodeButton size="sm" />
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[22rem] md:min-h-full">
          <ModeSwitch
            trabalho={
              <Image
                src="/images/hero-recording.png"
                alt="Profissional com celular preso na faixa de cabeça gravando o próprio trabalho para a Hub Data"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-top"
              />
            }
            casa={
              <Image
                src="/images/hero-home.png"
                alt="Mulher com celular preso na faixa de cabeça gravando tarefa na cozinha de casa para a Hub Data"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-top"
              />
            }
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r md:from-card/90 md:via-transparent"
          />
          <div className="glass absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl p-3 sm:right-6 sm:bottom-6 sm:left-auto">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Gravando</p>
              <p className="text-sm font-medium">
                <ModeSwitch trabalho="Manutenção predial · 00:42:18" casa="Preparar refeição · 00:31:05" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
