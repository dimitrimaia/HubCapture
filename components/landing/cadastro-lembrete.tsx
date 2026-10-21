'use client'

import { ExternalLink, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { concluirCadastroLocal, deveMostrarAviso, enviarAcao, fecharAviso, lerCadastroLocal } from '@/lib/cadastro-local'
import { CADASTRO_PATH, REFERRAL_CODE, SIGNUP_URL } from '@/lib/site'

/** Aviso discreto para quem deixou nome e WhatsApp numa visita anterior e não abriu o cadastro da Hub. */
export function CadastroLembrete() {
  const pathname = usePathname()
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    if (pathname !== CADASTRO_PATH && deveMostrarAviso()) setNome(lerCadastroLocal()?.nome.split(/\s+/)[0] ?? '')
  }, [pathname])

  if (nome === null || pathname === CADASTRO_PATH) return null

  return (
    <div role="status" className="px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-primary/35 bg-primary/10 py-2.5 pr-2 pl-4 text-sm">
        <p className="min-w-0 flex-1">
          <strong className="font-semibold">{nome ? `${nome}, falta` : 'Falta'} só criar sua conta</strong>{' '}
          <span className="text-muted-foreground">com o {REFERRAL_CODE}.</span>
        </p>
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            enviarAcao('cadastrar')
            concluirCadastroLocal()
            setNome(null)
          }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          Criar conta
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={() => {
            fecharAviso()
            setNome(null)
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
