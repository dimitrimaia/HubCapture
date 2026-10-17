import { INSTAGRAM_URL } from '@/lib/site'
import { CtaLink } from './cta-link'
import { InstagramIcon } from './instagram-icon'

export function FinalCta() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-16">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Seu celular já é uma ferramenta de trabalho. Comece a ser pago por isso.
          </h2>
          <p className="text-pretty text-primary-foreground/75">
            Cadastro gratuito, Starter Kit sem custo e pagamento por hora aprovada via PIX.
          </p>
          <CtaLink variant="dark" size="lg" withArrow className="mt-2">
            Começar a Gravar Agora
          </CtaLink>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
          >
            <InstagramIcon className="size-4" />
            Siga @hubcapture no Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
