import { Camera, ShieldCheck, UserPlus, Wallet } from 'lucide-react'
import type { ConteudoComoFunciona } from '@/lib/conteudo'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'

const ICONES = [UserPlus, Camera, ShieldCheck, Wallet]

export function HowItWorks({ conteudo }: { conteudo: ConteudoComoFunciona }) {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{conteudo.titulo}</h2>
          {conteudo.subtitulo && <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{conteudo.subtitulo}</p>}
        </div>

        <ol
          className={`mt-12 grid gap-4 ${conteudo.passos.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : conteudo.passos.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
        >
          {conteudo.passos.map((step, index) => {
            const Icone = ICONES[index % ICONES.length]
            return (
              <li key={index} className="glass group relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Icone className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">{`PASSO 0${index + 1}`}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">{step.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.descricao}</p>
              </li>
            )
          })}
        </ol>

        <div className="mt-10 flex justify-center">
          <CtaLink size="lg" withArrow>
            {conteudo.botao}
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
