'use client'

import { Dialog } from '@base-ui/react/dialog'
import {
  ExternalLink,
  Handshake,
  Headset,
  LayoutList,
  LogOut,
  Menu,
  MessageSquareText,
  PhoneCall,
  Activity,
  ChartColumn,
  UserCog,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/landing/logo'
import { cn } from '@/lib/utils'
import { sair } from '../actions'

const GRUPOS = [
  {
    titulo: 'Operação',
    itens: [
      { href: '/equipe/atendimento', rotulo: 'Atendimento', icone: Headset },
      { href: '/equipe/fila', rotulo: 'Fila de chamadas', icone: PhoneCall },
      { href: '/equipe/leads', rotulo: 'Cadastros', icone: LayoutList },
      { href: '/equipe/colab', rotulo: 'Colab', icone: Handshake },
    ],
  },
  {
    titulo: 'Administração',
    admin: true,
    itens: [
      { href: '/equipe/resultados', rotulo: 'Resultados', icone: ChartColumn },
      { href: '/equipe/mensagens', rotulo: 'Mensagens e respostas', icone: MessageSquareText },
      { href: '/equipe/usuarios', rotulo: 'Usuários', icone: Users },
      { href: '/equipe/sistema', rotulo: 'Saúde do sistema', icone: Activity },
    ],
  },
  {
    titulo: 'Você',
    itens: [{ href: '/equipe/conta', rotulo: 'Minha conta', icone: UserCog }],
  },
]

type Props = { nome: string; admin: boolean }

/** Quantas pessoas pediram atendimento humano (atualiza a cada 30 s). */
function useNaFila() {
  const [fila, setFila] = useState(0)
  useEffect(() => {
    async function buscar() {
      const r = await fetch('/api/equipe/atendimento?filtro=fila', { cache: 'no-store' }).catch(() => null)
      const dados = await r?.json().catch(() => null)
      if (dados?.ok) setFila(dados.contagem?.fila ?? 0)
    }
    buscar()
    const intervalo = setInterval(() => document.visibilityState === 'visible' && buscar(), 30000)
    return () => clearInterval(intervalo)
  }, [])
  return fila
}

function Links({ admin, onNavegar }: { admin: boolean; onNavegar?: () => void }) {
  const pathname = usePathname()
  const naFila = useNaFila()
  return (
    <nav aria-label="Painel" className="flex flex-col gap-5">
      {GRUPOS.filter((g) => admin || !g.admin).map((grupo) => (
        <div key={grupo.titulo}>
          <p className="px-3 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{grupo.titulo}</p>
          <ul className="flex flex-col gap-0.5">
            {grupo.itens.map(({ href, rotulo, icone: Icone }) => {
              const ativa = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavegar}
                    aria-current={ativa ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors',
                      ativa ? 'bg-primary/15 font-medium text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                    )}
                  >
                    <Icone className={cn('size-4', ativa && 'text-primary')} aria-hidden="true" />
                    {rotulo}
                    {href === '/equipe/atendimento' && naFila > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white tabular-nums" aria-label={`${naFila} na fila`}>
                        {naFila}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      <div>
        <p className="px-3 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Site</p>
        <a
          href="/?editar=1"
          className="flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {admin ? 'Ver e editar o site' : 'Ver o site'}
        </a>
      </div>
    </nav>
  )
}

function Rodape({ nome, admin }: Props) {
  return (
    <div className="flex items-center gap-2 border-t border-border pt-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <UserRound className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{nome}</span>
        <span className="block text-xs text-muted-foreground">{admin ? 'Administrador' : 'Equipe'}</span>
      </span>
      <form action={sair}>
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

/** Menu fixo à esquerda (telas grandes). */
export function MenuLateral(props: Props) {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border bg-card/40 px-3 py-4 lg:flex">
      <Link href="/equipe/fila" className="px-3" aria-label="Painel Hub Capture">
        <Logo tagline={props.admin ? 'Admin' : 'Equipe'} />
      </Link>
      <div className="flex-1 overflow-y-auto">
        <Links admin={props.admin} />
      </div>
      <Rodape {...props} />
    </aside>
  )
}

/** Barra superior + gaveta de menu (celular e tablet). */
export function MenuMovel(props: Props) {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()
  const atual = GRUPOS.flatMap((g) => g.itens).find((i) => pathname.startsWith(i.href))
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
      <Dialog.Root open={aberto} onOpenChange={setAberto}>
        <Dialog.Trigger aria-label="Abrir menu" className="-ml-2 flex size-10 items-center justify-center rounded-full hover:bg-foreground/5">
          <Menu className="size-5" aria-hidden="true" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-r border-border bg-background px-3 py-4 text-foreground shadow-2xl transition-transform duration-200 outline-none data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
            <div className="flex items-center justify-between px-3">
              <Dialog.Title render={<span />}>
                <Logo tagline={props.admin ? 'Admin' : 'Equipe'} />
              </Dialog.Title>
              <Dialog.Close aria-label="Fechar menu" className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5">
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Links admin={props.admin} onNavegar={() => setAberto(false)} />
            </div>
            <Rodape {...props} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <p className="min-w-0 flex-1 truncate font-medium">{atual?.rotulo ?? 'Painel'}</p>
      <Link href="/equipe/conta" aria-label="Minha conta" className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
        <UserRound className="size-4" aria-hidden="true" />
      </Link>
    </header>
  )
}
