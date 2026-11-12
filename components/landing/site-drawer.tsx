'use client'

import { Dialog } from '@base-ui/react/dialog'
import { HardHat, LogIn, Menu, PlayCircle, Sparkles, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { guiaLinks, headerLinks, sectionLinks } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import {
  CADASTRO_PATH,
  HUBCAP_URL,
  INSTAGRAM_URL,
  PARTNER_TAGLINE,
  SIGNUP_URL,
  TUTORIAIS_PATH,
  WHATSAPP_COMMUNITY_URL,
} from '@/lib/site'
import { useColab } from './colab-dialog'
import { ctaClasses } from './cta-link'
import { InstagramIcon } from './instagram-icon'
import { Logo } from './logo'
import { SeletorIdioma } from './seletor-idioma'
import { useMode } from './mode-context'
import { StoreBadges } from './store-badges'
import { WhatsappIcon } from './whatsapp-icon'


const sectionNav = sectionLinks.filter((item) => !['/#colab', '/#comunidade', '/#guias'].includes(item.href))

export function SiteDrawer() {
  const { mode } = useMode()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { open: openColab } = useColab()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Abrir menu"
        className="flex size-10 items-center justify-center rounded-full border border-foreground/12 bg-foreground/[0.03] text-foreground transition-colors outline-none hover:bg-foreground/[0.07] focus-visible:ring-3 focus-visible:ring-ring"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          data-mode={mode}
          className="fixed inset-y-0 right-0 z-[55] flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl transition-transform duration-300 ease-out outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <Dialog.Title render={<p />}>
              <Link href="/" onClick={close} aria-label="Hub Capture — início">
                <Logo tagline={PARTNER_TAGLINE} />
              </Link>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar menu"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
            <div className="grid grid-cols-2 gap-2">
              <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={close} className={ctaClasses({ variant: 'outline' })}>
                <LogIn className="size-4" aria-hidden="true" />
                Login
              </a>
              <Link href={CADASTRO_PATH} onClick={close} className={ctaClasses({})}>
                <UserPlus className="size-4" aria-hidden="true" />
                Cadastro
              </Link>
            </div>

            <ul className="flex flex-col gap-2">
              <DrawerItem href={TUTORIAIS_PATH} onClick={close} icon={<PlayCircle className="size-5" aria-hidden="true" />} title="Tutoriais em vídeo" subtitle="Passo a passo do cadastro ao PIX" />
              <DrawerItem href={WHATSAPP_COMMUNITY_URL} external highlight onClick={close} icon={<WhatsappIcon className="size-5" />} title="Comunidade no WhatsApp" subtitle="Dúvidas e suporte direto comigo" />
              <DrawerItem onClick={() => { close(); openColab() }} icon={<Sparkles className="size-5" aria-hidden="true" />} title="Colab com Influencers" subtitle="Seja parceiro do Hub Capture" />
              <DrawerItem href={INSTAGRAM_URL} external onClick={close} icon={<InstagramIcon className="size-5" />} title="Instagram @hubcapture" subtitle="Novidades e sorteios" />
              <DrawerItem href={HUBCAP_URL} external onClick={close} icon={<HardHat className="size-5" aria-hidden="true" />} title="Boné HubCap" subtitle="Grave com as mãos livres hoje" />
            </ul>

            <nav aria-label="Páginas" className="border-t border-border pt-4">
              <p className="px-3 pb-1 font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">Páginas</p>
              <ul className="flex flex-col">
                {[...headerLinks.filter((l) => l.href !== TUTORIAIS_PATH), ...guiaLinks].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex min-h-11 items-center rounded-xl px-3 text-sm text-foreground transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 px-3 pb-1 font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Na página inicial</p>
              <ul className="grid grid-cols-2 gap-x-2">
                {sectionNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex min-h-10 items-center rounded-xl px-3 text-sm text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <SeletorIdioma onEscolher={close} className="border-t border-border pt-4" />

            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Baixe o app</p>
              <StoreBadges stacked />
              <p className="pt-2 text-center text-[11px] text-muted-foreground/70">
                {`© ${new Date().getFullYear()} Hub Capture`}
              </p>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DrawerItem({
  href,
  external = false,
  highlight = false,
  onClick,
  icon,
  title,
  subtitle,
}: {
  href?: string
  external?: boolean
  highlight?: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  const className = cn(
    'flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring',
    highlight
      ? 'border-primary/40 bg-primary/10 hover:bg-primary/15'
      : 'border-border bg-foreground/[0.03] hover:border-primary/30 hover:bg-foreground/[0.06]',
  )
  const content = (
    <>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl',
          highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary',
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </>
  )

  return (
    <li>
      {!href ? (
        <button type="button" onClick={onClick} className={className}>
          {content}
        </button>
      ) : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
          {content}
        </a>
      ) : (
        <Link href={href} onClick={onClick} className={className}>
          {content}
        </Link>
      )}
    </li>
  )
}
