import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, ChevronDown, ShieldCheck, UserPlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PAGINAS_TRADUZIDAS } from '@/lib/i18n'
import { APP_STORE_URL, PLAY_STORE_URL, REFERRAL_CODE, SIGNUP_URL, SITE_URL } from '@/lib/site'
import { type IdiomaIntl, TEXTOS_INTL } from '@/lib/textos-intl'
import { ctaClasses } from '../landing/cta-link'
import { Eyebrow } from '../landing/eyebrow'
import { StoreBadges } from '../landing/store-badges'
import { IntlShell } from './intl-shell'

const ICONES = [UserPlus, Camera, ShieldCheck]

/** Página inicial em inglês/espanhol: mesma proposta da home em português, com textos próprios. */
export function IntlHome({ idioma }: { idioma: IdiomaIntl }) {
  const t = TEXTOS_INTL[idioma]
  const h = t.home
  const url = `${SITE_URL}${PAGINAS_TRADUZIDAS.inicio[idioma]}`
  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url, name: h.title, description: h.description, inLanguage: idioma },
      {
        '@type': 'MobileApplication',
        name: 'Hub Capture',
        alternateName: 'Hub App',
        operatingSystem: 'Android, iOS',
        applicationCategory: 'BusinessApplication',
        installUrl: [PLAY_STORE_URL, APP_STORE_URL],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: h.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
    ],
  }

  return (
    <IntlShell idioma={idioma}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, '\\u003c') }} />

      <section className="px-4 pt-8 pb-16 sm:px-6 md:pt-14 md:pb-24">
        <div className="glass relative mx-auto grid max-w-6xl overflow-hidden rounded-3xl md:grid-cols-[1.1fr_1fr]">
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex flex-col gap-7 p-6 sm:p-10 md:p-12 lg:p-14">
            <span className="inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
              {h.selo}
            </span>
            <h1 className="text-balance text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {h.titulo} <span className="text-primary">{h.destaque}</span>{' '}
              <span className="block text-3xl sm:text-4xl lg:text-5xl">{h.subtitulo}</span>
            </h1>
            <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{h.texto}</p>
            <div>
              <p className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                {h.ganhos}
                <span className="text-2xl text-primary/70">/h</span>
              </p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">{h.avisoGanhos}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'lg' })}>
                {t.cta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <Link href={PAGINAS_TRADUZIDAS.convide[idioma]} className="inline-flex h-13 items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground hover:text-foreground">
                {h.ctaSecundario}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {h.destaques.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[22rem] md:min-h-full">
            <Image
              src="/images/hero-home.png"
              alt={idioma === 'en' ? 'Woman recording a kitchen task with a phone mounted on her head to train robots' : 'Mujer grabando una tarea en la cocina con el celular en la cabeza para entrenar robots'}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-top"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r md:from-card/90 md:via-transparent" />
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{h.comoTitulo}</Eyebrow>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{h.comoTitulo}</h2>
            <p className="mt-4 text-muted-foreground">{h.comoTexto}</p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {h.passos.map((passo, i) => {
              const Icone = ICONES[i]
              return (
                <li key={passo.titulo} className="glass rounded-3xl p-6 sm:p-8">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Icone className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight">{passo.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{passo.texto}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">{h.precisaTitulo}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {h.precisa.map((item) => (
                <li key={item} className="flex gap-2">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {[
            { titulo: h.convideTitulo, texto: h.convideTexto, cta: h.convideCta, href: PAGINAS_TRADUZIDAS.convide[idioma] },
            { titulo: h.roboticsTitulo, texto: h.roboticsTexto, cta: h.roboticsCta, href: PAGINAS_TRADUZIDAS.hubRobotics[idioma] },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="glass group flex flex-col gap-3 rounded-3xl p-6 transition-colors hover:border-primary/40 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">{card.titulo}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.texto}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {card.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{h.faqTitulo}</h2>
          <div className="mt-10 flex flex-col gap-3">
            {h.faq.map((f) => (
              <details key={f.question} className="glass group rounded-2xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <h3>{f.question}</h3>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="glass mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl p-8 text-center sm:p-12">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">{h.finalTitulo}</h2>
          <p className="text-muted-foreground">{h.finalTexto}</p>
          <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'lg' })}>
            {t.cta}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="font-mono text-xs text-muted-foreground">app.hub.xyz/r/{REFERRAL_CODE}</p>
          <StoreBadges idioma={idioma} className="justify-center" />
        </div>
      </section>
    </IntlShell>
  )
}
