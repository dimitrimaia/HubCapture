'use client'

import { Dialog } from '@base-ui/react/dialog'
import { HardHat, LogIn, Menu, PlayCircle, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { sectionLinks } from '@/lib/navigation'
import { CADASTRO_PATH, HUBCAP_URL, INSTAGRAM_URL, TUTORIAIS_PATH } from '@/lib/site'
import { ColabButton } from './colab-dialog'
import { ctaClasses } from './cta-link'
import { InstagramIcon } from './instagram-icon'
import { Logo } from './logo'
import { useMode } from './mode-context'
import { StoreBadges } from './store-badges'

const rowClass =
  'flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring'

export function SiteDrawer() {
  const { mode } = useMode()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

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
                <Logo />
              </Link>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar menu"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col gap-6 p-4 pb-8">
            <div className="grid grid-cols-2 gap-2">
              <Link href={CADASTRO_PATH} onClick={close} className={ctaClasses({ variant: 'outline' })}>
                <LogIn className="size-4" aria-hidden="true" />
                Login
              </Link>
              <Link href={CADASTRO_PATH} onClick={close} className={ctaClasses({})}>
                <UserPlus className="size-4" aria-hidden="true" />
                Cadastro
              </Link>
            </div>

            <nav aria-label="Menu">
              <ul className="flex flex-col">
                <li>
                  <Link href={TUTORIAIS_PATH} onClick={close} className={rowClass}>
                    <PlayCircle className="size-5 text-primary" aria-hidden="true" />
                    Tutoriais em vídeo
                  </Link>
                </li>
                <li>
                  <a href={HUBCAP_URL} target="_blank" rel="noopener noreferrer" onClick={close} className={rowClass}>
                    <HardHat className="size-5 text-primary" aria-hidden="true" />
                    Boné oficial HubCap
                  </a>
                </li>
                {sectionLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} className={`${rowClass} text-muted-foreground`}>
                      <span className="size-5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Baixe o app</p>
              <StoreBadges stacked />
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
              <ColabButton variant="outline" className="w-full" onClick={close} />
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <InstagramIcon className="size-4" />
                @hubcapture
              </a>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
