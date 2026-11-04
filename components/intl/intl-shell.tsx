import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { PAGINAS_TRADUZIDAS } from '@/lib/i18n'
import { INSTAGRAM_URL, SIGNUP_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/site'
import { type IdiomaIntl, TEXTOS_INTL } from '@/lib/textos-intl'
import { ctaClasses } from '../landing/cta-link'
import { InstagramIcon } from '../landing/instagram-icon'
import { Logo } from '../landing/logo'
import { RastreioVisita } from '../landing/rastreio-visita'
import { SeletorIdioma } from '../landing/seletor-idioma'
import { StoreBadges } from '../landing/store-badges'
import { WhatsappIcon } from '../landing/whatsapp-icon'
import { MenuIntl } from './menu-intl'

/** Moldura das páginas em inglês e espanhol: cabeçalho, rodapé e seletor de idioma. */
export function IntlShell({ idioma, children }: { idioma: IdiomaIntl; children: React.ReactNode }) {
  const t = TEXTOS_INTL[idioma]
  const links = [
    { href: PAGINAS_TRADUZIDAS.inicio[idioma], label: t.nav.inicio },
    { href: PAGINAS_TRADUZIDAS.convide[idioma], label: t.nav.convide },
    { href: PAGINAS_TRADUZIDAS.hubRobotics[idioma], label: t.nav.hubRobotics },
  ]
  const linkClass = 'text-sm text-muted-foreground transition-colors hover:text-foreground'

  return (
    <div lang={idioma}>
      <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_65%)]"
      />
      <div className="relative">
        <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href={PAGINAS_TRADUZIDAS.inicio[idioma]} aria-label="Hub Capture">
              <Logo tagline={t.tagline} />
            </Link>
            <nav aria-label={t.nav.menu} className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-2">
              <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={ctaClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}>
                {t.nav.cadastrar}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <MenuIntl idioma={idioma} links={links} />
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-border px-4 pt-12 pb-16 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
              <div className="flex flex-col gap-4">
                <Logo tagline={t.tagline} />
                <p className="max-w-xs text-sm text-muted-foreground">{t.rodape.sobre}</p>
                <StoreBadges idioma={idioma} />
                <SeletorIdioma className="max-w-xs pt-2" />
              </div>
              <nav aria-label={t.rodape.paginas} className="flex flex-col gap-3">
                <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">{t.rodape.paginas}</p>
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col items-start gap-3">
                <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">{t.rodape.comunidade}</p>
                <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                  <WhatsappIcon className="size-4" />
                  {t.rodape.whatsapp}
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                  <InstagramIcon className="size-4" />
                  {t.rodape.instagram}
                </a>
              </div>
            </div>
            <p className="border-t border-border pt-6 text-xs text-muted-foreground">{`© ${new Date().getFullYear()} Hub Capture. ${t.rodape.aviso}`}</p>
          </div>
        </footer>
      </div>
      <RastreioVisita />
    </div>
  )
}
