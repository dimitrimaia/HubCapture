'use client'

import { Check, CircleCheck, Download, Loader2, MessageCircleReply, MousePointerClick, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import { MODELOS_CHAMADA, type ModeloChamadaId, primeiroNome } from '@/lib/mensagens'
import { formatE164, waLink } from '@/lib/phone'
import { cn } from '@/lib/utils'

export type LeadPainel = {
  id: string
  nome: string
  whatsapp: string
  origem: string
  criadoEm: string
  ultimaAcao: string | null
  chamadoEm: string | null
  chamadoPor: string | null
  chamadoModelo: string | null
  chamadas: number
  convertidoEm: string | null
  respondeuWhatsappEm: string | null
}

type Resumo = {
  total: number
  ultimas24h: number
  tocaramCadastrar: number
  chamados: number
  responderam: number
  convertidos: number
} | null

const ACOES: Record<string, string> = {
  cadastrar: 'Abriu o cadastro',
  whatsapp: 'Tocou no WhatsApp',
  comunidade: 'Tocou na comunidade',
}

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`
}

function tempoRelativo(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}

export function LeadsPainel({
  leads: iniciais,
  resumo,
  atendente,
  filtro,
  filtros,
  busca,
}: {
  leads: LeadPainel[]
  resumo: Resumo
  atendente: string
  filtro: string
  filtros: { id: string; rotulo: string }[]
  busca: string
}) {
  const router = useRouter()
  const [leads, setLeads] = useState(iniciais)
  // router.refresh() (após importar) e a troca de filtro trazem dados novos do servidor.
  useEffect(() => setLeads(iniciais), [iniciais])
  const [modelo, setModelo] = useState<ModeloChamadaId>('boas-vindas')
  const [importando, setImportando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const modeloAtual = MODELOS_CHAMADA.find((item) => item.id === modelo) ?? MODELOS_CHAMADA[0]

  function atualizar(id: string, dados: Partial<LeadPainel>) {
    setLeads((atual) => atual.map((lead) => (lead.id === id ? { ...lead, ...dados } : lead)))
  }

  function chamar(event: React.MouseEvent<HTMLAnchorElement>, lead: LeadPainel) {
    if (lead.chamadoEm) {
      const quando = tempoRelativo(lead.chamadoEm)
      if (!window.confirm(`${lead.chamadoPor ?? 'Alguém'} já chamou ${lead.nome} ${quando}. Chamar de novo?`)) {
        event.preventDefault()
        return
      }
    }
    // Não bloqueia a abertura do WhatsApp: registra em segundo plano.
    fetch(`/api/equipe/leads/${lead.id}/chamar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelo }),
      keepalive: true,
    })
      .then(() => router.refresh())
      .catch(() => {})
    atualizar(lead.id, {
      chamadoEm: new Date().toISOString(),
      chamadoPor: atendente,
      chamadoModelo: modelo,
      chamadas: lead.chamadas + 1,
    })
  }

  async function alternarConvertido(lead: LeadPainel) {
    const convertido = !lead.convertidoEm
    atualizar(lead.id, { convertidoEm: convertido ? new Date().toISOString() : null })
    const response = await fetch(`/api/equipe/leads/${lead.id}/convertido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convertido }),
    }).catch(() => null)
    if (!response?.ok) {
      atualizar(lead.id, { convertidoEm: lead.convertidoEm })
      setAviso('Não foi possível salvar. Tente de novo.')
      return
    }
    router.refresh()
  }

  async function importar() {
    setImportando(true)
    setAviso(null)
    const response = await fetch('/api/equipe/importar', { method: 'POST' }).catch(() => null)
    const dados = await response?.json().catch(() => null)
    setImportando(false)
    if (!response?.ok) {
      setAviso(dados?.erro ?? 'Não foi possível importar da planilha.')
      return
    }
    setAviso(
      `Planilha importada: ${plural(dados.novos, 'novo', 'novos')}, ${plural(dados.existentes, 'já estava', 'já estavam')} no banco` +
        (dados.ignorados ? `, ${plural(dados.ignorados, 'linha', 'linhas')} sem telefone válido.` : '.'),
    )
    router.refresh()
  }

  const taxa = resumo && resumo.total ? Math.round((resumo.convertidos / resumo.total) * 100) : 0

  return (
    <div className="mt-6 flex flex-col gap-6">
      {resumo && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat rotulo="Cadastros" valor={resumo.total} />
          <Stat rotulo="Últimas 24 h" valor={resumo.ultimas24h} />
          <Stat rotulo="Abriram cadastro" valor={resumo.tocaramCadastrar} />
          <Stat rotulo="Chamados" valor={resumo.chamados} />
          <Stat rotulo="Responderam" valor={resumo.responderam} />
          <Stat rotulo="Convertidos" valor={resumo.convertidos} detalhe={`${taxa}%`} destaque />
        </dl>
      )}

      <div className="flex flex-col gap-3">
        <nav aria-label="Filtro" className="flex gap-2 overflow-x-auto pb-1">
          {filtros.map((item) => (
            <Link
              key={item.id}
              href={{ pathname: '/equipe/leads', query: { filtro: item.id, ...(busca ? { q: busca } : {}) } }}
              aria-current={filtro === item.id ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm transition-colors',
                filtro === item.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action="/equipe/leads" className="relative flex-1">
            <input type="hidden" name="filtro" value={filtro} />
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              name="q"
              defaultValue={busca}
              placeholder="Buscar por nome ou telefone"
              aria-label="Buscar por nome ou telefone"
              className="h-11 w-full rounded-full border border-input bg-background/60 pr-4 pl-11 text-sm outline-none focus-visible:border-primary"
            />
          </form>
          <button
            type="button"
            onClick={importar}
            disabled={importando}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-foreground/12 px-4 text-sm transition-colors hover:bg-foreground/5 disabled:opacity-60"
          >
            {importando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
            Importar da planilha
          </button>
        </div>
        {aviso && (
          <p role="status" className="rounded-xl border border-border bg-foreground/[0.03] p-3 text-sm">
            {aviso}
          </p>
        )}
      </div>

      <section aria-label="Mensagem" className="glass rounded-2xl p-4">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Mensagem pronta</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Modelo de mensagem">
          {MODELOS_CHAMADA.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={modelo === item.id}
              onClick={() => setModelo(item.id)}
              className={cn(
                'h-9 shrink-0 rounded-full border px-3 text-sm transition-colors',
                modelo === item.id ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{modeloAtual.texto('Maria', atendente)}</p>
      </section>

      {leads.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
          Nenhum lead aqui. {filtro !== 'todos' && 'Veja a aba “Todos” ou importe da planilha.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {leads.map((lead) => {
            const texto = modeloAtual.texto(primeiroNome(lead.nome), atendente)
            return (
              <li
                key={lead.id}
                className={cn(
                  'rounded-2xl border p-4 transition-colors',
                  lead.convertidoEm ? 'border-primary/30 bg-primary/5' : 'border-border bg-card/60',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{lead.nome}</p>
                    <p className="font-mono text-sm text-muted-foreground">{formatE164(lead.whatsapp)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tempoRelativo(lead.criadoEm)} · {lead.origem === 'planilha' ? 'planilha' : 'site'}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {lead.ultimaAcao && (
                    <Badge icone={<MousePointerClick className="size-3" aria-hidden="true" />}>{ACOES[lead.ultimaAcao] ?? lead.ultimaAcao}</Badge>
                  )}
                  {lead.respondeuWhatsappEm && (
                    <Badge icone={<MessageCircleReply className="size-3" aria-hidden="true" />} destaque>
                      Escreveu no WhatsApp
                    </Badge>
                  )}
                  {lead.chamadoEm && (
                    <Badge icone={<Users className="size-3" aria-hidden="true" />}>
                      Chamado por {lead.chamadoPor} {tempoRelativo(lead.chamadoEm)}
                      {lead.chamadas > 1 ? ` (${lead.chamadas}×)` : ''}
                    </Badge>
                  )}
                  {lead.convertidoEm && (
                    <Badge icone={<CircleCheck className="size-3" aria-hidden="true" />} destaque>
                      Converteu
                    </Badge>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                  <a
                    href={waLink(lead.whatsapp, texto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => chamar(event, lead)}
                    aria-label={`${lead.chamadoEm ? 'Chamar de novo' : 'Chamar'} ${lead.nome} no WhatsApp`}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-all',
                      lead.chamadoEm
                        ? 'border border-foreground/12 text-foreground hover:bg-foreground/5'
                        : 'glow bg-primary text-primary-foreground hover:brightness-110',
                    )}
                  >
                    <WhatsappIcon className="size-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {lead.chamadoEm ? 'Chamar de novo' : 'Chamar'}
                      <span className="max-[419px]:hidden"> no WhatsApp</span>
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => alternarConvertido(lead)}
                    aria-pressed={Boolean(lead.convertidoEm)}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-1.5 rounded-full border px-4 text-sm transition-colors',
                      lead.convertidoEm
                        ? 'border-primary/40 bg-primary/15 text-foreground'
                        : 'border-foreground/12 text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                    )}
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Converteu
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Stat({ rotulo, valor, detalhe, destaque = false }: { rotulo: string; valor: number; detalhe?: string; destaque?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4', destaque ? 'border-primary/35 bg-primary/10' : 'border-border bg-card/60')}>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{valor}</span>
        {detalhe && <span className="text-sm text-primary">{detalhe}</span>}
      </dd>
    </div>
  )
}

function Badge({ icone, destaque = false, children }: { icone: React.ReactNode; destaque?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
        destaque ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border text-muted-foreground',
      )}
    >
      {icone}
      {children}
    </span>
  )
}
