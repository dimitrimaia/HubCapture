import { ArrowUpRight, Hand, Smartphone, Timer } from 'lucide-react'
import Image from 'next/image'
import type { ConteudoHubcap } from '@/lib/conteudo'
import { HUBCAP_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'
import { Eyebrow } from './eyebrow'

const ICONES = [Timer, Smartphone, Hand]

/**
 * Produto sobre uma "vitrine" clara: o boné é preto, então num fundo escuro ele sumia.
 * A base clara + sombra no chão funciona igual nos temas claro e escuro.
 */
function CapImage({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_40%,#ffffff_0%,#eef3f0_55%,#dfe7e2_100%)] px-6 pt-8 pb-10 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] sm:px-10">
        <div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-primary/20 blur-3xl" />
        <Image
          src="/images/bone-hubcap.webp"
          alt="Boné oficial HubCap com suporte para prender o celular e gravar com as mãos livres para a Hub Data"
          width={538}
          height={300}
          sizes="(min-width: 768px) 380px, 80vw"
          className="relative mx-auto h-auto w-full max-w-[380px] drop-shadow-[0_18px_18px_rgb(0_0_0/0.25)]"
        />
        <div aria-hidden="true" className="mx-auto -mt-3 h-4 w-2/3 rounded-[50%] bg-black/20 blur-md" />
      </div>
    </div>
  )
}

export function HubcapSection({ conteudo }: { conteudo: ConteudoHubcap }) {
  return (
    <section id="bone-hubcap" aria-labelledby="hubcap-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="glass relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-40 size-[26rem] rounded-full bg-primary/10 blur-3xl"
        />
        <CapImage className="relative hidden md:block" />

        <div className="relative flex flex-col gap-6">
          {conteudo.chamada && <Eyebrow>{conteudo.chamada}</Eyebrow>}
          <h2 id="hubcap-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {conteudo.titulo} {conteudo.destaque && <span className="text-primary">{conteudo.destaque}</span>}
          </h2>
          <CapImage className="relative mx-auto w-full max-w-sm md:hidden" />
          <p className="text-pretty leading-relaxed text-muted-foreground">{conteudo.texto}</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {conteudo.vantagens.map((vantagem, i) => {
              const Icone = ICONES[i % ICONES.length]
              return (
                <li key={vantagem} className="flex items-center gap-2 text-sm text-muted-foreground sm:flex-col sm:items-start">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icone className="size-4" aria-hidden="true" />
                  </span>
                  {vantagem}
                </li>
              )
            })}
          </ul>
          <a
            href={conteudo.link || HUBCAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClasses({ size: 'lg', className: 'w-full sm:w-fit' })}
          >
            {conteudo.botao}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          {conteudo.rodape && <p className="text-xs text-muted-foreground">{conteudo.rodape}</p>}
        </div>
      </div>
    </section>
  )
}
