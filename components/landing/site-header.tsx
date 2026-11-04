import Link from 'next/link'
import { headerLinks } from '@/lib/navigation'
import { CADASTRO_PATH, PARTNER_TAGLINE } from '@/lib/site'
import { CtaLink, ctaClasses } from './cta-link'
import { Logo } from './logo'
import { MenuGuias } from './menu-guias'
import { SiteDrawer } from './site-drawer'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Hub Capture — início">
          <Logo tagline={PARTNER_TAGLINE} />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {headerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <MenuGuias />
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <CtaLink variant="outline" size="sm" external className="hidden xl:inline-flex">
            Entrar
          </CtaLink>
          <Link href={CADASTRO_PATH} className={ctaClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}>
            Cadastrar
          </Link>
          <SiteDrawer />
        </div>
      </div>
    </header>
  )
}
