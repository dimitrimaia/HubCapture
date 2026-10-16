import { Megaphone, Users } from 'lucide-react'
import { ColabButton } from './colab-dialog'
import { Eyebrow } from './eyebrow'

export function ColabSection() {
  return (
    <section id="colab" aria-labelledby="colab-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 sm:p-10 md:flex-row md:items-center md:justify-between md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex max-w-2xl flex-col gap-4">
          <Eyebrow>Colab com Influencers</Eyebrow>
          <h2 id="colab-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Cria conteúdo? Seja parceiro do Hub Capture.
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Criadores do Instagram e TikTok podem divulgar o Hub App com o código VEMHUB e fechar parcerias. Deixe seus
            dados e nossa equipe entra em contato.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" aria-hidden="true" />
              Micro e grandes criadores
            </li>
            <li className="flex items-center gap-1.5">
              <Megaphone className="size-4 text-primary" aria-hidden="true" />
              Instagram e TikTok
            </li>
          </ul>
        </div>
        <ColabButton size="lg" className="relative w-full shrink-0 md:w-fit" />
      </div>
    </section>
  )
}
