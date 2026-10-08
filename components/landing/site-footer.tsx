import { CtaLink, SIGNUP_URL } from './cta-link'
import { Logo } from './logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 pt-10 pb-32 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Grave tarefas do mundo real com o celular e ganhe por hora aprovada.
            </p>
          </div>
          <CtaLink size="sm" withArrow>
            Criar minha conta
          </CtaLink>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>{`© ${new Date().getFullYear()} Hub Data. Divulgação do programa Hub com o código de convite VEMHUB.`}</p>
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono transition-colors hover:text-primary"
          >
            ai.hub.xyz/r/VEMHUB
          </a>
        </div>
      </div>
    </footer>
  )
}
