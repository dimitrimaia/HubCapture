import { Database, LogOut } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/landing/logo'
import { lerSessao } from '@/lib/equipe'
import { type FiltroLeads, listarLeads, resumoLeads } from '@/lib/leads'
import { sair } from '../actions'
import { LeadsPainel, type LeadPainel } from './leads-painel'

const FILTROS: { id: FiltroLeads; rotulo: string }[] = [
  { id: 'nao-convertidos', rotulo: 'Ainda não converteu' },
  { id: 'nao-chamados', rotulo: 'Nunca chamados' },
  { id: 'todos', rotulo: 'Todos' },
]

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ filtro?: string; q?: string }> }) {
  const sessao = await lerSessao()
  if (!sessao) redirect('/equipe/login')

  const params = await searchParams
  const filtro = (FILTROS.find((item) => item.id === params.filtro)?.id ?? 'nao-convertidos') as FiltroLeads
  const busca = params.q?.slice(0, 60) ?? ''

  let lista: Awaited<ReturnType<typeof listarLeads>> = null
  let resumo: Awaited<ReturnType<typeof resumoLeads>> = null
  let erroBanco = false
  try {
    ;[lista, resumo] = await Promise.all([listarLeads({ filtro, busca }), resumoLeads()])
  } catch (error) {
    console.error('[equipe] Falha ao ler o banco:', error)
    erroBanco = true
  }

  const leads: LeadPainel[] | null = lista
    ? lista.map((lead) => ({
        id: lead.id,
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        origem: lead.origem,
        criadoEm: lead.criadoEm.toISOString(),
        ultimaAcao: lead.ultimaAcao,
        chamadoEm: lead.chamadoEm?.toISOString() ?? null,
        chamadoPor: lead.chamadoPor,
        chamadoModelo: lead.chamadoModelo,
        chamadas: lead.chamadas,
        convertidoEm: lead.convertidoEm?.toISOString() ?? null,
        respondeuWhatsappEm: lead.respondeuWhatsappEm?.toISOString() ?? null,
      }))
    : null

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Hub Capture — início">
            <Logo tagline="Equipe" />
          </Link>
          <form action={sair} className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{sessao.nome}</span>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm transition-colors hover:bg-foreground/5"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Leads do cadastro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chame quem deixou nome e WhatsApp e ainda não criou a conta. Ao tocar em “Chamar”, fica registrado quem chamou.
        </p>

        {!leads ? (
          <div className="glass mt-6 flex flex-col gap-3 rounded-3xl p-6">
            <Database className="size-8 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">
              {erroBanco ? 'Não consegui ler o banco de dados' : 'Banco de dados ainda não configurado'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {erroBanco
                ? 'Confira a DATABASE_URL na Vercel (use a URL do pooler, porta 6543) e se o db/setup.sql foi rodado no Supabase.'
                : 'Crie o projeto grátis no Supabase, rode o db/setup.sql e cadastre DATABASE_URL na Vercel. Passo a passo em docs/banco-de-dados.md.'}
            </p>
          </div>
        ) : (
          <LeadsPainel
            leads={leads}
            resumo={resumo}
            atendente={sessao.nome}
            filtro={filtro}
            filtros={FILTROS}
            busca={busca}
          />
        )}
      </main>
    </div>
  )
}
