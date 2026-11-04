import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { PAGINAS_TRADUZIDAS, type PaginaTraduzida } from '@/lib/i18n'
import { SIGNUP_URL, SITE_URL } from '@/lib/site'
import { type IdiomaIntl, TEXTOS_INTL } from '@/lib/textos-intl'
import { ctaClasses } from '../landing/cta-link'
import { Eyebrow } from '../landing/eyebrow'
import { StoreBadges } from '../landing/store-badges'
import { Trilha } from '../landing/trilha'
import { IntlShell } from './intl-shell'

type Props = {
  idioma: IdiomaIntl
  pagina: PaginaTraduzida
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: React.ReactNode
  toc: { id: string; label: string }[]
  faqs: { question: string; answer: string }[]
  /** Outras páginas traduzidas para "Lee también / Read next". */
  relacionadas: { pagina: PaginaTraduzida; titulo: string; resumo: string }[]
  children: React.ReactNode
}

/** Artigo em inglês/espanhol, no mesmo visual dos guias em português. */
export function IntlArtigo({ idioma, pagina, title, description, eyebrow, heading, intro, toc, faqs, relacionadas, children }: Props) {
  const t = TEXTOS_INTL[idioma]
  const url = `${SITE_URL}${PAGINAS_TRADUZIDAS[pagina][idioma]}`
  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: title, description, inLanguage: idioma, url, mainEntityOfPage: url, dateModified: '2026-11-04' },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
    ],
  }

  return (
    <IntlShell idioma={idioma}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, '\\u003c') }} />
      <article className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <Trilha rotulo={t.artigo.voceEsta} itens={[{ nome: 'Hub Capture', href: PAGINAS_TRADUZIDAS.inicio[idioma] }, { nome: eyebrow }]} />
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{heading}</h1>
          <div className="mt-4 text-pretty leading-relaxed text-muted-foreground sm:text-lg [&_strong]:text-foreground">{intro}</div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'lg' })}>
              {t.cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <StoreBadges idioma={idioma} />
          </div>

          <nav aria-label={t.artigo.nesteGuia} className="glass mt-10 rounded-2xl p-5">
            <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">{t.artigo.nesteGuia}</p>
            <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
              {[...toc, { id: 'faq', label: t.artigo.perguntas }].map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 flex flex-col gap-5 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-balance [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:text-foreground">
            {children}
            <h2 id="faq">{t.artigo.perguntas}</h2>
            {faqs.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p className="mt-1">{f.answer}</p>
              </div>
            ))}
          </div>

          <aside aria-label={t.artigo.leiaTambem} className="mt-12">
            <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">{t.artigo.leiaTambem}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relacionadas.map((r) => (
                <Link key={r.pagina} href={PAGINAS_TRADUZIDAS[r.pagina][idioma]} className="glass group flex flex-col gap-2 rounded-2xl p-5 transition-colors hover:border-primary/40">
                  <span className="font-semibold">{r.titulo}</span>
                  <span className="text-sm text-muted-foreground">{r.resumo}</span>
                  <ArrowRight className="mt-1 size-4 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>

          <div className="glass mt-12 flex flex-col items-center gap-4 rounded-3xl p-6 text-center sm:p-8">
            <p className="text-xl font-semibold tracking-tight">{t.artigo.ctaFinal}</p>
            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'lg' })}>
              {t.cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </IntlShell>
  )
}
