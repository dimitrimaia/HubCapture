import { CadastroLembrete } from './cadastro-lembrete'
import { ChatWidget } from './chat-widget'
import { ColabProvider } from './colab-dialog'
import { EdicaoProvider } from './edicao'
import { RastreioVisita } from './rastreio-visita'
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
          <EdicaoProvider>
            <SiteHeader />
            <CadastroLembrete />
            <main>{children}</main>
            <SiteFooter />
          </EdicaoProvider>
        </div>
        {withModeBar && <ModeBar />}
        <RastreioVisita />
        <ChatWidget acimaDaModeBar={withModeBar} />
      </ColabProvider>
    </ModeProvider>
  )
}
