import type { Metadata } from 'next'
import { CommunityLinks } from '@/components/landing/community-section'
import { CtaLink } from '@/components/landing/cta-link'
import { Eyebrow } from '@/components/landing/eyebrow'
import { SiteShell } from '@/components/landing/site-shell'
import { StoreBadges } from '@/components/landing/store-badges'
import { VideoEmbed } from '@/components/landing/video-embed'
import { SITE_URL, TUTORIAIS_PATH } from '@/lib/site'
import { tutorialSteps } from '@/lib/tutorials'

const title = 'Tutoriais Hub Capture: como gravar e ganhar no Hub App passo a passo'
const description =
  'Tutoriais em vídeo do Hub Capture: cadastro com o código VEMHUB, Starter Kit, app Hub, posição do celular e como ter suas gravações aprovadas na Hub Data.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: TUTORIAIS_PATH },
  openGraph: { title, description, url: TUTORIAIS_PATH },
  twitter: { title, description },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: title,
  description,
  url: `${SITE_URL}${TUTORIAIS_PATH}`,
  step: tutorialSteps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.title,
    text: step.description,
    url: `${SITE_URL}${TUTORIAIS_PATH}#passo-${index + 1}`,
    ...(step.youtubeId && {
      video: {
        '@type': 'VideoObject',
        name: step.title,
        description: step.description,
        thumbnailUrl: `https://i.ytimg.com/vi/${step.youtubeId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${step.youtubeId}`,
      },
    }),
  })),
}

export default function TutoriaisPage() {
  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <section aria-labelledby="tutoriais-title" className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <Eyebrow>Tutoriais em vídeo</Eyebrow>
            <h1 id="tutoriais-title" className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Hub Capture passo a passo: do cadastro ao primeiro PIX
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              Assista aos vídeos na ordem e siga cada etapa no app Hub. Assim suas gravações têm muito mais chance de
              serem aprovadas pela Hub Data logo na primeira semana.
            </p>
          </div>

          <ol className="mt-12 flex flex-col gap-6">
            {tutorialSteps.map((step, index) => (
              <li
                key={step.title}
                id={`passo-${index + 1}`}
                className="glass grid scroll-mt-24 gap-6 rounded-3xl p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center"
              >
                <VideoEmbed youtubeId={step.youtubeId} title={`Passo ${index + 1}: ${step.title}`} />
                <div className="flex min-w-0 flex-col gap-3">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground">
                    {`Passo ${index + 1}`}
                  </span>
                  <h2 className="text-balance text-2xl font-semibold tracking-tight">{step.title}</h2>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-center gap-6 text-center">
            <CtaLink size="lg" withArrow>
              Criar minha conta com VEMHUB
            </CtaLink>
            <StoreBadges className="justify-center" />
          </div>

          <div className="glass mx-auto mt-12 flex max-w-2xl flex-col gap-4 rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Ficou com alguma dúvida?</h2>
            <p className="text-sm text-muted-foreground">
              Entre na comunidade do WhatsApp para falar direto comigo, ou siga o @hubcapture para novos tutoriais.
            </p>
            <CommunityLinks className="grid gap-3 sm:grid-cols-2" />
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
