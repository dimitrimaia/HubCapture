'use client'

import { Dialog } from '@base-ui/react/dialog'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SIGNUP_URL } from '@/lib/site'
import { type IdiomaIntl, TEXTOS_INTL } from '@/lib/textos-intl'
import { ctaClasses } from '../landing/cta-link'
import { Logo } from '../landing/logo'
import { SeletorIdioma } from '../landing/seletor-idioma'
import { StoreBadges } from '../landing/store-badges'

/** Menu lateral das páginas em inglês e espanhol (com o seletor de idioma). */
export function MenuIntl({ idioma, links }: { idioma: IdiomaIntl; links: { href: string; label: string }[] }) {
  const [aberto, setAberto] = useState(false)
  const t = TEXTOS_INTL[idioma]
  const fechar = () => setAberto(false)
  return (
    <Dialog.Root open={aberto} onOpenChange={setAberto}>
      <Dialog.Trigger
        aria-label={t.nav.menu}
        className="flex size-10 items-center justify-center rounded-full border border-foreground/12 bg-foreground/[0.03] outline-none hover:bg-foreground/[0.07] focus-visible:ring-3 focus-visible:ring-ring"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-[55] flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl transition-transform duration-300 outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <Dialog.Title render={<p />}>
              <Logo tagline={t.tagline} />
            </Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={fechar} className={ctaClasses({})}>
              {t.cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={fechar} className="flex min-h-11 items-center rounded-xl px-3 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <SeletorIdioma onEscolher={fechar} className="border-t border-border pt-4" />
            <div className="mt-auto border-t border-border pt-6">
              <StoreBadges idioma={idioma} stacked />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
