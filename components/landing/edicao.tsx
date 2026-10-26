'use client'

import { LayoutDashboard, LogOut, Pencil, ShieldCheck } from 'lucide-react'
import dynamic from 'next/dynamic'
import { createContext, useContext, useEffect, useState } from 'react'
import { sair } from '@/app/equipe/actions'
import { type Bloco, BLOCOS } from '@/lib/conteudo'
import { cn } from '@/lib/utils'

/**
 * Barra de quem está logado no painel + modo "Editar página".
 * Visitantes comuns não fazem nenhum pedido: só quem tem o cookie de aviso (criado no login)
 * pergunta ao servidor quem é. Quem decide se pode editar é sempre o servidor (só admin).
 */

type Sessao = { nome: string; papel: 'admin' | 'equipe' }
type Edicao = { sessao: Sessao | null; editando: boolean; abrir: (bloco: Bloco) => void }

const Contexto = createContext<Edicao>({ sessao: null, editando: false, abrir: () => {} })
const CHAVE_EDITANDO = 'hubcapture:editando'

// Só baixa o editor quando um admin abre um bloco.
const EditorBloco = dynamic(() => import('./editor-blocos').then((m) => m.EditorBloco), { ssr: false })

export function EdicaoProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [editando, setEditando] = useState(false)
  const [aberto, setAberto] = useState<Bloco | null>(null)

  useEffect(() => {
    if (!document.cookie.split('; ').includes('hub_equipe_on=1')) return
    fetch('/api/equipe/eu', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (!dados?.ok) {
          document.cookie = 'hub_equipe_on=; Max-Age=0; path=/'
          return
        }
        setSessao({ nome: dados.nome, papel: dados.papel })
        if (dados.papel !== 'admin') return
        const url = new URL(window.location.href)
        let ligar = false
        try {
          ligar = sessionStorage.getItem(CHAVE_EDITANDO) === '1'
        } catch {}
        if (url.searchParams.get('editar') === '1') {
          ligar = true
          url.searchParams.delete('editar')
          window.history.replaceState(null, '', url)
        }
        setEditando(ligar)
      })
      .catch(() => {})
  }, [])

  function alternar() {
    setEditando((atual) => {
      try {
        sessionStorage.setItem(CHAVE_EDITANDO, atual ? '0' : '1')
      } catch {}
      return !atual
    })
  }

  return (
    <Contexto.Provider value={{ sessao, editando, abrir: setAberto }}>
      {sessao && <BarraAdmin sessao={sessao} editando={editando} onAlternar={alternar} />}
      {children}
      {aberto && (
        <EditorBloco
          bloco={aberto}
          onFechar={() => setAberto(null)}
          // A Server Action já devolve a página atualizada; não precisa de router.refresh().
          onSalvo={() => setAberto(null)}
        />
      )}
    </Contexto.Provider>
  )
}

function BarraAdmin({ sessao, editando, onAlternar }: { sessao: Sessao; editando: boolean; onAlternar: () => void }) {
  const admin = sessao.papel === 'admin'
  return (
    <div className="relative z-50 border-b border-primary/30 bg-card/95 text-sm backdrop-blur">
      <div className="mx-auto flex h-11 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate">
          <span className="text-muted-foreground max-sm:hidden">Logado como </span>
          <strong className="font-medium">{sessao.nome}</strong>
          <span className="text-muted-foreground"> · {admin ? 'Admin' : 'Equipe'}</span>
        </p>
        {admin && (
          <button
            type="button"
            role="switch"
            aria-checked={editando}
            onClick={onAlternar}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 transition-colors',
              editando ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-foreground/5',
            )}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {editando ? 'Editando' : 'Editar página'}
          </button>
        )}
        <a href="/equipe/fila" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 hover:bg-foreground/5">
          <LayoutDashboard className="size-3.5" aria-hidden="true" />
          <span className="max-sm:sr-only">Painel</span>
        </a>
        <form action={sair}>
          <button type="submit" aria-label="Sair" title="Sair" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
      {editando && (
        <p className="border-t border-primary/20 bg-primary/10 px-4 py-1.5 text-center text-xs">
          Modo edição: os blocos com contorno verde podem ser editados. Toque em <strong>Editar</strong> no canto do bloco.
        </p>
      )}
    </div>
  )
}

/** Envolve um bloco do site. Fora do modo edição não muda nada no HTML. */
export function BlocoEditavel({ bloco, children }: { bloco: Bloco; children: React.ReactNode }) {
  const { editando, abrir } = useContext(Contexto)
  if (!editando) return children
  return (
    <div className="relative rounded-3xl outline-2 -outline-offset-4 outline-primary/60 outline-dashed">
      {children}
      <button
        type="button"
        onClick={() => abrir(bloco)}
        className="glow absolute top-3 right-3 z-30 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-lg sm:top-4 sm:right-6"
      >
        <Pencil className="size-4" aria-hidden="true" />
        Editar {BLOCOS[bloco].toLowerCase()}
      </button>
    </div>
  )
}
