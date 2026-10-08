import { CodeSection } from '@/components/landing/code-section'
import { DifferenceSection } from '@/components/landing/difference-section'
import { EarningModes } from '@/components/landing/earning-modes'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ModeBar } from '@/components/landing/mode-bar'
import { ModeProvider } from '@/components/landing/mode-context'
import { SeoArticle } from '@/components/landing/seo-article'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'
import { Tutorial } from '@/components/landing/tutorial'
import { SIGNUP_URL } from '@/components/landing/cta-link'
import { faqs, SITE_URL } from '@/lib/site'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Hub Data',
      alternateName: ['Hub', 'HubData', 'Hub IA'],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Hub Data — Ganhe dinheiro gravando vídeos',
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'HowTo',
      name: 'Como ganhar dinheiro gravando vídeos na Hub Data',
      step: [
        { '@type': 'HowToStep', name: 'Crie sua conta com o código VEMHUB', url: SIGNUP_URL },
        { '@type': 'HowToStep', name: 'Peça seu Starter Kit grátis' },
        { '@type': 'HowToStep', name: 'Baixe o app Minute e escolha Residencial ou Comercial' },
        { '@type': 'HowToStep', name: 'Posicione o celular na faixa de cabeça' },
        { '@type': 'HowToStep', name: 'Grave a tarefa e receba via PIX' },
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

export default function Page() {
  return (
    <ModeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_65%)]"
      />
      <div className="relative">
        <SiteHeader />
        <main>
          <Hero />
          <HowItWorks />
          <CodeSection />
          <Tutorial />
          <EarningModes />
          <DifferenceSection />
          <FaqSection />
          <SeoArticle />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
      <ModeBar />
    </ModeProvider>
  )
}
