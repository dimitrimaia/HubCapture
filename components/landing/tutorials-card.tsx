import { ArrowRight, CirclePlay } from 'lucide-react'
import Link from 'next/link'
import { TUTORIAIS_PATH } from '@/lib/site'
import { tutorialSteps } from '@/lib/tutorials'
import { ctaClasses } from './cta-link'
import { Eyebrow } from './eyebrow'

export function TutorialsCard({ className }: { className?: string }) {
  return (
    <section aria-label="Tutoriais em vídeo" className={className ?? 'px-4 py-8 sm:px-6'}>
      <div className="relative mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-3xl border border-primary/35 bg-card p-6 shadow-[0_0_60px_-20px] shadow-primary/40 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-col gap-4">
          <Eyebrow>Novo · Tutoriais em vídeo</Eyebrow>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Aprenda a gravar no Hub Capture assistindo, passo a passo
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            {`${tutorialSteps.length} vídeos curtos do cadastro ao primeiro PIX: como posicionar o celular, o que a Hub Data aprova e como evitar reprovações.`}
          </p>
          <Link href={TUTORIAIS_PATH} className={ctaClasses({ size: 'lg', className: 'mt-2 w-full sm:w-fit' })}>
            <CirclePlay className="size-5" aria-hidden="true" />
            Assistir aos tutoriais
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <ol className="relative grid gap-3 sm:grid-cols-3">
          {tutorialSteps.slice(0, 3).map((step, index) => (
            <li key={step.title}>
              <Link
                href={`${TUTORIAIS_PATH}#passo-${index + 1}`}
                className="glass group flex h-full flex-row items-center gap-4 rounded-2xl p-4 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring sm:flex-col sm:items-start"
              >
                <span className="relative flex aspect-video w-24 shrink-0 items-center justify-center rounded-xl bg-background/70 sm:w-full">
                  <CirclePlay className="size-8 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                    {`Passo ${index + 1}`}
                  </span>
                  <span className="text-sm font-medium leading-snug">{step.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
