import { CtaLink } from './cta-link'
import { Logo } from './logo'

const navItems = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#codigo-vemhub', label: 'Código VEMHUB' },
  { href: '#tutorial', label: 'Tutorial' },
  { href: '#modos', label: 'Ganhos' },
  { href: '#faq', label: 'FAQ' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#topo" aria-label="Hub — início">
          <Logo />
        </a>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <CtaLink variant="outline" size="sm">
          Acessar Plataforma
        </CtaLink>
      </div>
    </header>
  )
}
