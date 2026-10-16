import { ArrowRight, CirclePlay } from 'lucide-react'
import Link from 'next/link'
import { TUTORIAIS_PATH } from '@/lib/site'
import { tutorialSteps } from '@/lib/tutorials'

export function TutorialsCard() {
  return (
    <section aria-label="Tutoriais em vídeo" className="px-4 sm:px-6">
      <Link
        href={TUTORIAIS_PATH}
        className="glass group mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl p-6 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-6 sm:p-8"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow">
          <CirclePlay className="size-7" aria-hidden="true" />
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Novo</span>
          <span className="text-xl font-semibold tracking-tight">Tutoriais passo a passo em vídeo</span>
          <span className="text-sm text-muted-foreground">
            {`${tutorialSteps.length} passos do cadastro ao primeiro PIX no Hub Capture.`}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          Ver tutoriais
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </section>
  )
}
