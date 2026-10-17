import { ArrowUpRight, Hand, Smartphone, Timer } from 'lucide-react'
import Image from 'next/image'
import { HUBCAP_URL } from '@/lib/site'
import { ctaClasses } from './cta-link'
import { Eyebrow } from './eyebrow'

const perks = [
  { icon: Timer, label: 'Chega bem mais rápido que o kit' },
  { icon: Smartphone, label: 'Celular firme e estável' },
  { icon: Hand, label: 'Só as suas mãos aparecem' },
]

function CapImage({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] inset-y-[15%] rounded-full bg-primary/25 blur-3xl"
      />
      <Image
        src="/images/bone-hubcap.png"
        alt="Boné oficial HubCap com suporte para prender o celular e gravar com as mãos livres para a Hub Data"
        width={538}
        height={300}
        sizes="(min-width: 768px) 40vw, 90vw"
        className="relative h-auto w-full drop-shadow-2xl"
      />
    </div>
  )
}

export function HubcapSection() {
  return (
    <section id="bone-hubcap" aria-labelledby="hubcap-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="glass relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-40 size-[26rem] rounded-full bg-primary/10 blur-3xl"
        />
        <CapImage className="relative hidden md:block" />

        <div className="relative flex flex-col gap-6">
          <Eyebrow>Para gravar sem segurar o celular</Eyebrow>
          <h2 id="hubcap-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            O kit da Hub tem fila. <span className="text-primary">O boné da HubCap resolve enquanto isso.</span>
          </h2>
          <CapImage className="relative mx-auto w-full max-w-md md:hidden" />
          <p className="text-pretty leading-relaxed text-muted-foreground">
            O <strong className="text-foreground">Suporte Oficial HubCap</strong> prende o celular na cabeça e só as
            suas mãos aparecem — que é exatamente o que a Hub Data aprova. Dá para começar a gravar hoje, sem esperar o
            kit chegar.
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
            <span className="sm:hidden">Ver o boné HubCap</span>
            <span className="hidden sm:inline">Ver o boné com suporte para celular</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="text-xs text-muted-foreground">Produto oficial · compra segura pelo Mercado Livre.</p>
        </div>
      </div>
    </section>
  )
}
