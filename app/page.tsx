import { CodeSection } from '@/components/landing/code-section'
import { ColabSection } from '@/components/landing/colab-section'
import { CommunitySection } from '@/components/landing/community-section'
import { BlocoEditavel } from '@/components/landing/edicao'
import { DifferenceSection } from '@/components/landing/difference-section'
import { EarningModes } from '@/components/landing/earning-modes'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCta } from '@/components/landing/final-cta'
import { GuidesSection } from '@/components/landing/guides-section'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { HubcapSection } from '@/components/landing/hubcap-section'
import { SeoArticle } from '@/components/landing/seo-article'
import { SiteShell } from '@/components/landing/site-shell'
import { Tutorial } from '@/components/landing/tutorial'
import { TutorialsCard } from '@/components/landing/tutorials-card'
import { obterConfig } from '@/lib/configuracoes'
import type { Pergunta } from '@/lib/conteudo'
import { APP_STORE_URL, CADASTRO_PATH, INSTAGRAM_URL, PLAY_STORE_URL, SITE_URL } from '@/lib/site'

/** Estático, refeito a cada hora ou na hora em que um admin salva um bloco (revalidatePath). */
export const revalidate = 3600

const dadosEstruturados = (faqs: Pergunta[]) => ({
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
        {
          '@type': 'HowToStep',
          name: 'Crie sua conta com o código VEMHUB',
          url: `${SITE_URL}${CADASTRO_PATH}`,
        },
        {
          '@type': 'HowToStep',
          name: 'Peça seu Starter Kit grátis ou use o boné HubCap',
        },
        {
          '@type': 'HowToStep',
          name: 'Baixe o app Hub Capture e escolha Residencial ou Comercial',
        },
        {
          '@type': 'HowToStep',
          name: 'Vincule o app Minute com o mesmo e-mail para liberar tarefas extras',
        },
        {
          '@type': 'HowToStep',
          name: 'Posicione o celular na cabeça, na altura dos olhos',
        },
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
})

export default async function Page() {
  const [hero, passos, faqs, comoFunciona, comunidade, hubcap] = await Promise.all([
    obterConfig('conteudo_hero', { fresco: true }),
    obterConfig('tutoriais', { fresco: true }),
    obterConfig('faq', { fresco: true }),
    obterConfig('conteudo_como_funciona', { fresco: true }),
    obterConfig('conteudo_comunidade', { fresco: true }),
    obterConfig('conteudo_hubcap', { fresco: true }),
  ])
  return (
    <SiteShell withModeBar>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dadosEstruturados(faqs)).replace(/</g, '\\u003c'),
        }}
      />
      <BlocoEditavel bloco="conteudo_hero">
        <Hero conteudo={hero} />
      </BlocoEditavel>
      <BlocoEditavel bloco="conteudo_como_funciona">
        <HowItWorks conteudo={comoFunciona} />
      </BlocoEditavel>
      <BlocoEditavel bloco="tutoriais">
        <TutorialsCard passos={passos} />
      </BlocoEditavel>
      <CodeSection />
      <ColabSection />
      <BlocoEditavel bloco="conteudo_comunidade">
        <CommunitySection conteudo={comunidade} />
      </BlocoEditavel>
      <Tutorial />
      <TutorialsCard passos={passos} className="px-4 pb-16 sm:px-6 md:pb-24" />
      <BlocoEditavel bloco="conteudo_hubcap">
        <HubcapSection conteudo={hubcap} />
      </BlocoEditavel>
      <EarningModes />
      <DifferenceSection />
      <GuidesSection />
      <BlocoEditavel bloco="faq">
        <FaqSection faqs={faqs} />
      </BlocoEditavel>
      <SeoArticle />
      <FinalCta />
    </SiteShell>
  )
}
