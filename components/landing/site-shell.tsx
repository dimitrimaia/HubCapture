import { ColabProvider } from './colab-dialog'
import { ModeBar } from './mode-bar'
import { ModeProvider } from './mode-context'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function SiteShell({ children, withModeBar = false }: { children: React.ReactNode; withModeBar?: boolean }) {
  return (
    <ModeProvider>
      <ColabProvider>
        <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_65%)]"
        />
        <div className="relative">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
        {withModeBar && <ModeBar />}
      </ColabProvider>
    </ModeProvider>
  )
}
