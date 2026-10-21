import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { guides } from '@/lib/guides'
import { SITE_URL } from '@/lib/site'
import { CommunityLinks } from './community-section'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'
import { SiteShell } from './site-shell'
import { StoreBadges } from './store-badges'

export type ArticleFaq = { question: string; answer: string }

type ArticleLayoutProps = {
  path: string
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: React.ReactNode
  toc: { id: string; label: string }[]
  faqs: ArticleFaq[]
  children: React.ReactNode
}

export function ArticleLayout({ path, title, description, eyebrow, heading, intro, toc, faqs, children }: ArticleLayoutProps) {
  const url = `${SITE_URL}${path}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        inLanguage: 'pt-BR',
        url,
        mainEntityOfPage: url,
        dateModified: '2026-10-20',
        publisher: { '@id': `${SITE_URL}/#organization` },
        about: ['Hub Capture', 'Hub App', 'Hub Data'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hub Capture', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: heading, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  }
  const related = guides.filter((guide) => guide.href !== path)

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <article className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Você está em" className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Hub Capture
            </Link>{' '}
            / <span className="text-foreground">{eyebrow}</span>
          </nav>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{heading}</h1>
          <div className="mt-4 text-pretty leading-relaxed text-muted-foreground sm:text-lg [&_strong]:text-foreground">{intro}</div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CtaLink size="lg" withArrow>
              Cadastrar com VEMHUB
            </CtaLink>
            <StoreBadges />
          </div>

          <nav aria-label="Neste guia" className="glass mt-10 rounded-2xl p-5">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Neste guia</p>
            <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#perguntas" className="transition-colors hover:text-foreground">
                  Perguntas frequentes
                </a>
              </li>
            </ol>
          </nav>

          <div className="mt-10 flex flex-col gap-5 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-balance [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
            {children}

            <h2 id="perguntas">Perguntas frequentes</h2>
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3>{faq.question}</h3>
                <p className="mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>

          <aside aria-label="Leia também" className="mt-12">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Leia também</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="glass group flex flex-col gap-2 rounded-2xl p-5 transition-colors hover:border-primary/40"
                >
                  <span className="font-semibold">{guide.title}</span>
                  <span className="text-sm text-muted-foreground">{guide.summary}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {guide.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </aside>

          <div className="glass mt-12 flex flex-col gap-4 rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Ficou com dúvida? Fale comigo</h2>
            <CommunityLinks className="grid gap-3 sm:grid-cols-2" />
          </div>
        </div>
      </article>
    </SiteShell>
  )
}

export function articleMetadata(path: string, title: string, description: string) {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: 'article' as const, title, description, url: path },
    twitter: { title, description },
  }
}
