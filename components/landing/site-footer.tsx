import Link from 'next/link'
import { sectionLinks } from '@/lib/navigation'
import { CADASTRO_PATH, HUBCAP_URL, INSTAGRAM_URL, SIGNUP_URL, TUTORIAIS_PATH } from '@/lib/site'
import { ColabButton } from './colab-dialog'
import { CtaLink } from './cta-link'
import { InstagramIcon } from './instagram-icon'
import { Logo } from './logo'
import { StoreBadges } from './store-badges'

const linkClass = 'text-sm text-muted-foreground transition-colors hover:text-foreground'

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 pt-12 pb-32 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Hub Capture: grave tarefas do mundo real com o celular no app Hub e ganhe por hora aprovada.
            </p>
            <StoreBadges />
          </div>

          <nav aria-label="Rodapé" className="flex flex-col gap-3">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Navegação</p>
            <Link href={TUTORIAIS_PATH} className={linkClass}>
              Tutoriais em vídeo
            </Link>
            <Link href={CADASTRO_PATH} className={linkClass}>
              Login e cadastro
            </Link>
            {sectionLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-3">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Comunidade</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
              <InstagramIcon className="size-4" />
              @hubcapture no Instagram
            </a>
            <a href={HUBCAP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Boné oficial HubCap
            </a>
            <ColabButton variant="outline" size="sm" className="mt-1" />
            <CtaLink size="sm" withArrow className="mt-1">
              Criar minha conta
            </CtaLink>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>{`© ${new Date().getFullYear()} Hub Capture. Divulgação do programa Hub Data com o código de convite VEMHUB.`}</p>
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
