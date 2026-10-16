import { ArrowUpRight, Hand, Smartphone, Timer } from 'lucide-react'
import Image from 'next/image'
import { HUBCAP_IMAGE_URL, HUBCAP_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'
import { Eyebrow } from './eyebrow'

const perks = [
  { icon: Smartphone, label: 'Celular firme na cabeça' },
  { icon: Hand, label: 'Só as suas mãos aparecem' },
  { icon: Timer, label: 'Comece a gravar hoje' },
]

export function HubcapSection() {
  return (
    <section id="bone-hubcap" aria-labelledby="hubcap-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="glass relative mx-auto grid max-w-6xl overflow-hidden rounded-3xl md:grid-cols-[1fr_1.1fr]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-40 size-[26rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative aspect-square bg-white md:aspect-auto md:min-h-[28rem]">
          <Image
            src={HUBCAP_IMAGE_URL}
            alt="Boné oficial HubCap com suporte para prender o celular e gravar com as mãos livres para a Hub Data"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-contain p-6"
          />
          <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-foreground">
            Comece hoje
          </span>
        </div>

        <div className="relative flex flex-col gap-6 p-6 sm:p-10 md:p-12">
          <Eyebrow>Boné oficial HubCap</Eyebrow>
          <h2 id="hubcap-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            O kit da Hub tem fila. <span className="text-primary">O boné da HubCap resolve enquanto isso.</span>
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            O celular fica preso na cabeça e só as suas mãos aparecem — que é exatamente o que a Hub Data aprova. Dá
            para começar a gravar hoje, sem esperar o kit chegar.
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {perks.map((perk) => (
              <li key={perk.label} className="flex items-center gap-2 text-sm text-muted-foreground sm:flex-col sm:items-start">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <perk.icon className="size-4" aria-hidden="true" />
                </span>
                {perk.label}
              </li>
            ))}
          </ul>
          <a
            href={HUBCAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClasses({ size: 'lg', className: 'w-full sm:w-fit' })}
          >
            Comprar o boné HubCap
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="text-xs text-muted-foreground">Compra segura pelo Mercado Livre.</p>
        </div>
      </div>
    </section>
  )
}
