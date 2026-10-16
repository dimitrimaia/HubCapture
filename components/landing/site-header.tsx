import Link from 'next/link'
import { sectionLinks } from '@/lib/navigation'
import { TUTORIAIS_PATH } from '@/lib/site'
import { CtaLink } from './cta-link'
import { Logo } from './logo'
import { SiteDrawer } from './site-drawer'

const navItems = [...sectionLinks.filter((item) => item.href !== '/#tutorial'), { href: TUTORIAIS_PATH, label: 'Tutoriais' }]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Hub Capture — início">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <CtaLink variant="outline" size="sm" className="hidden sm:inline-flex">
            Acessar Plataforma
          </CtaLink>
          <SiteDrawer />
        </div>
      </div>
    </header>
  )
}
