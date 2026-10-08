import Image from 'next/image'
import { BadgeCheck, CircleDot } from 'lucide-react'
import { CtaLink } from './cta-link'

const highlights = ['Cadastro gratuito', 'Starter Kit sem custo', 'Pagamento via PIX']

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
            Vagas abertas no Brasil
          </span>

          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Filmou, <span className="text-primary">ganhou.</span> Renda extra por hora gravando o seu dia.
          </h1>

          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Prenda o celular na cabeça e grave tarefas reais em primeira pessoa — em casa ou no trabalho. Esses vídeos
            treinam robôs e inteligência artificial, e você recebe por cada hora aprovada.
          </p>

          <div className="flex items-end gap-3">
            <p className="whitespace-nowrap text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
              R$ 50<span className="text-2xl text-primary/70 sm:text-3xl">/h</span>
            </p>
            <p className="pb-2 text-sm leading-snug text-muted-foreground">
              até, por hora
              <br />
              de gravação aprovada
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink size="lg" withArrow>
              Começar a Gravar Agora
            </CtaLink>
            <a
              href="#como-funciona"
              className="inline-flex h-13 items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver como funciona
            </a>
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
          <Image
            src="/images/hero-recording.png"
            alt="Profissional com celular preso na faixa de cabeça gravando o próprio trabalho"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
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
              <p className="text-sm font-medium">Manutenção predial · 00:42:18</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
