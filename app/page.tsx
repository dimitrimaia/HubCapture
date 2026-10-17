import { CodeSection } from '@/components/landing/code-section'
import { ColabSection } from '@/components/landing/colab-section'
import { CommunitySection } from '@/components/landing/community-section'
import { DifferenceSection } from '@/components/landing/difference-section'
import { EarningModes } from '@/components/landing/earning-modes'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { HubcapSection } from '@/components/landing/hubcap-section'
import { SeoArticle } from '@/components/landing/seo-article'
import { SiteShell } from '@/components/landing/site-shell'
import { Tutorial } from '@/components/landing/tutorial'
import { TutorialsCard } from '@/components/landing/tutorials-card'
import { APP_STORE_URL, CADASTRO_PATH, faqs, INSTAGRAM_URL, PLAY_STORE_URL, SITE_URL } from '@/lib/site'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Hub Capture',
      alternateName: ['Hub App', 'Hub Data', 'HubData', 'Hub', 'HubCap'],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: [INSTAGRAM_URL, PLAY_STORE_URL, APP_STORE_URL],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Hub Capture — Hub App e Hub Data',
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'MobileApplication',
      name: 'Hub Capture',
      alternateName: 'Hub App',
      operatingSystem: 'Android, iOS',
      applicationCategory: 'BusinessApplication',
      installUrl: [PLAY_STORE_URL, APP_STORE_URL],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'HowTo',
      name: 'Como ganhar dinheiro gravando vídeos no Hub Capture (Hub Data)',
      step: [
        { '@type': 'HowToStep', name: 'Crie sua conta com o código VEMHUB', url: `${SITE_URL}${CADASTRO_PATH}` },
        { '@type': 'HowToStep', name: 'Peça seu Starter Kit grátis ou use o boné HubCap' },
        { '@type': 'HowToStep', name: 'Baixe o app Hub Capture e escolha Residencial ou Comercial' },
        { '@type': 'HowToStep', name: 'Posicione o celular na cabeça, na altura dos olhos' },
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
    <SiteShell withModeBar>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <Hero />
      <HowItWorks />
      <TutorialsCard />
      <CodeSection />
      <ColabSection />
      <CommunitySection />
      <Tutorial />
      <TutorialsCard className="px-4 pb-16 sm:px-6 md:pb-24" />
      <HubcapSection />
      <EarningModes />
      <DifferenceSection />
      <FaqSection />
      <SeoArticle />
      <FinalCta />
    </SiteShell>
  )
}
