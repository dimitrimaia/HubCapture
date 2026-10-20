import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { guides } from '@/lib/guides'
import { Eyebrow } from './eyebrow'

export function GuidesSection() {
  return (
    <section id="guias" aria-labelledby="guias-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Guias Hub Capture</Eyebrow>
          <h2 id="guias-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo o que você precisa saber antes de começar
          </h2>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.href}>
              <Link
                href={guide.href}
                className="glass group flex h-full flex-col gap-3 rounded-3xl p-6 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring sm:p-8"
              >
                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">{guide.tag}</span>
                <span className="text-2xl font-semibold tracking-tight">{guide.title}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{guide.summary}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
                  {guide.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
