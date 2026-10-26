'use client'

import { Check, Copy, Link2, Loader2, Mail, Search, Upload, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import { type ModeloMensagem, preencherMensagem } from '@/lib/mensagens'
import { formatE164, waLink } from '@/lib/phone'
import { linkRastreio } from '@/lib/rastreio'
import { SITE_URL } from '@/lib/site'
import { cn } from '@/lib/utils'
import { BotaoExportar } from '../botao-exportar'
import { dataCurta, Filtro, haQuanto, Indicadores, PainelLateral, Paginacao, Selo } from '../ui'

export type LinhaColab = {
  id: string
  nome: string
  perfil: string
  seguidores: string | null
  email: string | null
  whatsapp: string
  origem: string
  status: string
  observacao: string | null
  chamadoEm: string | null
  chamadoPor: string | null
  criadoEm: string
}

type Filtros = { status: string; busca: string; pagina: number; porPagina: number }

const STATUS = [
  { valor: 'novo', rotulo: 'Novo' },
  { valor: 'conversando', rotulo: 'Conversando' },
  { valor: 'parceiro', rotulo: 'Parceiro' },
  { valor: 'recusado', rotulo: 'Recusado' },
]
const TOM: Record<string, 'neutro' | 'verde' | 'vermelho' | 'amarelo'> = { novo: 'neutro', conversando: 'amarelo', parceiro: 'verde', recusado: 'vermelho' }
const CHAVE_MODELO = 'hubcapture:equipe-modelo-colab'

/** "@perfil" ou link → link clicável (Instagram por padrão; TikTok se o link for do TikTok). */
function linkPerfil(perfil: string) {
  if (/^https?:\/\//i.test(perfil)) return perfil
  if (/(tiktok|instagram)\.com/i.test(perfil)) return `https://${perfil.replace(/^\/+/, '')}`
  const handle = perfil.replace(/^@/, '')
  return handle && handle !== '—' ? `https://instagram.com/${handle}` : null
}

function Perfil({ c }: { c: LinhaColab }) {
  const href = linkPerfil(c.perfil)
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-primary underline-offset-4 hover:underline">
      {c.perfil}
    </a>
  ) : (
    <span className="truncate">{c.perfil}</span>
  )
}

function rotuloStatus(status: string) {
  return STATUS.find((s) => s.valor === status)?.rotulo ?? status
}

export function ColabTabela({
  linhas: iniciais,
  total,
  filtros,
  resumo,
  modelos,
  atendente,
  podeExportar,
}: {
  linhas: LinhaColab[]
  total: number
  filtros: Filtros
  resumo: Record<string, number>
  modelos: ModeloMensagem[]
  atendente: string
  podeExportar: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [carregando, iniciar] = useTransition()
  const [linhas, setLinhas] = useState(iniciais)
  const [modelo, setModelo] = useState(modelos[0]?.id ?? '')
  const [detalhe, setDetalhe] = useState<LinhaColab | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState(filtros.busca)
  const [importando, setImportando] = useState(false)
  const primeiraBusca = useRef(true)

  useEffect(() => setLinhas(iniciais), [iniciais])
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_MODELO)
      if (salvo && modelos.some((m) => m.id === salvo)) setModelo(salvo)
    } catch {}
  }, [modelos])

  const modeloAtual = modelos.find((m) => m.id === modelo) ?? modelos[0]

  function navegar(mudancas: Partial<{ status: string; q: string; pagina: number; por: string }>) {
    const atual = { status: filtros.status, q: filtros.busca, por: String(filtros.porPagina), pagina: 1, ...mudancas }
    const params = new URLSearchParams()
    if (atual.status !== 'todos') params.set('status', atual.status)
    if (atual.q) params.set('q', atual.q)
    if (atual.por !== '25') params.set('por', atual.por)
    if (atual.pagina > 1) params.set('pagina', String(atual.pagina))
    iniciar(() => router.push(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false }))
  }

  useEffect(() => {
    if (primeiraBusca.current) {
      primeiraBusca.current = false
      return
    }
    const espera = setTimeout(() => busca !== filtros.busca && navegar({ q: busca }), 400)
    return () => clearTimeout(espera)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  async function salvar(c: LinhaColab, local: Partial<LinhaColab>, corpo: Record<string, unknown>) {
    setLinhas((atual) => atual.map((l) => (l.id === c.id ? { ...l, ...local } : l)))
    setDetalhe((atual) => (atual?.id === c.id ? { ...atual, ...local } : atual))
    const r = await fetch(`/api/equipe/colab/${c.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      keepalive: true,
    }).catch(() => null)
    if (!r?.ok) setAviso('Não foi possível salvar. Tente de novo.')
  }

  function chamar(c: LinhaColab) {
    // "Parceiro" e "recusado" não voltam para "conversando" só porque alguém chamou.
    const status = c.status === 'novo' ? 'conversando' : c.status
    salvar(c, { chamadoEm: new Date().toISOString(), chamadoPor: atendente, status }, { chamado: true, status })
  }

  async function importar() {
    setImportando(true)
    const r = await fetch('/api/equipe/importar?tipo=colab', { method: 'POST' }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setImportando(false)
    setAviso(r?.ok ? `Importado: ${dados.novos} novos, ${dados.existentes} já existiam.` : (dados?.erro ?? 'Não foi possível importar.'))
    if (r?.ok) router.refresh()
  }

  const exportarHref = `/api/equipe/exportar?${new URLSearchParams({ tipo: 'colab', ...(filtros.status !== 'todos' ? { status: filtros.status } : {}), ...(filtros.busca ? { q: filtros.busca } : {}) })}`
  const texto = (c: LinhaColab) => (modeloAtual ? preencherMensagem(modeloAtual.texto, { nome: c.nome, atendente }) : undefined)

  return (
    <div className="mt-5 flex flex-col gap-4">
      <Indicadores
        itens={[
          { rotulo: 'Inscritos', valor: resumo.total ?? 0 },
          ...STATUS.map((s) => ({ rotulo: s.rotulo, valor: resumo[s.valor] ?? 0, destaque: s.valor === 'parceiro' })),
          { rotulo: 'Nesta busca', valor: total },
        ]}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome, @perfil ou telefone"
              className="h-9 w-full rounded-lg border border-input bg-background/60 pr-8 pl-9 text-sm outline-none focus-visible:border-primary"
            />
            {busca && (
              <button type="button" aria-label="Limpar busca" onClick={() => setBusca('')} className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground">
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={importar}
              disabled={importando}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-foreground/5 disabled:opacity-60 sm:flex-none"
            >
              {importando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
              Importar planilha
            </button>
            {podeExportar && (
              <BotaoExportar href={exportarHref} />
            )}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Filtro rotulo="Status" valor={filtros.status} opcoes={[{ valor: 'todos', rotulo: 'Todos' }, ...STATUS]} onChange={(v) => navegar({ status: v })} />
          {modelos.length > 0 && (
            <Filtro
              rotulo="Mensagem"
              valor={modelo}
              opcoes={modelos.map((m) => ({ valor: m.id, rotulo: m.rotulo }))}
              onChange={(v) => {
                setModelo(v)
                try {
                  localStorage.setItem(CHAVE_MODELO, v)
                } catch {}
              }}
            />
          )}
        </div>
      </div>

      {aviso && (
        <p role="status" className="flex items-start justify-between gap-3 rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-sm">
          {aviso}
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </p>
      )}

      <div className={cn('overflow-hidden rounded-2xl border border-border bg-card/60 transition-opacity', carregando && 'opacity-60')}>
        {linhas.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma inscrição com esses filtros.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-foreground/[0.03] text-left text-xs text-muted-foreground max-md:sr-only">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Criador</th>
                <th scope="col" className="px-2 py-2 font-medium">Seguidores</th>
                <th scope="col" className="px-2 py-2 font-medium">Inscrição</th>
                <th scope="col" className="px-2 py-2 font-medium">Status</th>
                <th scope="col" className="px-2 py-2 font-medium">Último contato</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((c) => (
                <tr
                  key={c.id}
                  onClick={(e) => !(e.target as HTMLElement).closest('a,button,select') && setDetalhe(c)}
                  className="cursor-pointer transition-colors hover:bg-foreground/[0.03] max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-2 max-md:px-3 max-md:py-2.5"
                >
                  <td className="min-w-0 px-3 py-2 max-md:flex-1 max-md:p-0">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="flex min-w-0 gap-1 text-xs text-muted-foreground">
                      <Perfil c={c} />
                      {c.seguidores && <span className="shrink-0 md:hidden">· {c.seguidores}</span>}
                    </p>
                  </td>
                  <td className="px-2 py-2 text-xs text-muted-foreground max-md:hidden">{c.seguidores ?? '—'}</td>
                  <td className="px-2 py-2 text-xs whitespace-nowrap text-muted-foreground max-md:hidden">
                    {dataCurta(c.criadoEm)}
                    <span className="block">{c.origem}</span>
                  </td>
                  <td className="px-2 py-2 max-md:p-0">
                    <Selo tom={TOM[c.status]}>{rotuloStatus(c.status)}</Selo>
                  </td>
                  <td className="px-2 py-2 text-xs whitespace-nowrap text-muted-foreground max-md:hidden">
                    {c.chamadoEm ? (
                      <>
                        {haQuanto(c.chamadoEm)}
                        <span className="block">por {c.chamadoPor}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 max-md:p-0">
                    <div className="flex justify-end gap-1.5">
                      <a
                        href={waLink(c.whatsapp, texto(c))}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => chamar(c)}
                        aria-label={`Chamar ${c.nome} no WhatsApp`}
                        title="Chamar no WhatsApp"
                        className="inline-flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
                      >
                        <WhatsappIcon className="size-4" />
                      </a>
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          aria-label={`E-mail para ${c.nome}`}
                          title={c.email}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        >
                          <Mail className="size-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Paginacao pagina={filtros.pagina} porPagina={filtros.porPagina} total={total} onPagina={(p) => navegar({ pagina: p })} />
        <Filtro
          rotulo="Por página"
          valor={String(filtros.porPagina)}
          opcoes={[25, 50, 100].map((n) => ({ valor: String(n), rotulo: String(n) }))}
          onChange={(v) => navegar({ por: v })}
        />
      </div>

      <PainelLateral aberto={Boolean(detalhe)} onFechar={() => setDetalhe(null)} titulo={detalhe?.nome ?? ''}>
        {detalhe && <DetalheColab key={detalhe.id} c={detalhe} texto={texto(detalhe) ?? ''} onChamar={() => chamar(detalhe)} onSalvar={salvar} />}
      </PainelLateral>
    </div>
  )
}

function DetalheColab({
  c,
  texto,
  onChamar,
  onSalvar,
}: {
  c: LinhaColab
  texto: string
  onChamar: () => void
  onSalvar: (c: LinhaColab, local: Partial<LinhaColab>, corpo: Record<string, unknown>) => void
}) {
  const [copiado, setCopiado] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const rastreio = linkRastreio(SITE_URL, c.perfil)
  const [observacao, setObservacao] = useState(c.observacao ?? '')
  return (
    <>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Perfil</dt>
          <dd className="flex min-w-0">
            <Perfil c={c} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">WhatsApp</dt>
          <dd className="flex items-center gap-1.5 font-mono">
            {formatE164(c.whatsapp)}
            <button
              type="button"
              aria-label="Copiar telefone"
              onClick={() => navigator.clipboard.writeText(c.whatsapp).then(() => setCopiado(true)).catch(() => {})}
              className="text-muted-foreground hover:text-foreground"
            >
              {copiado ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Seguidores</dt>
          <dd>{c.seguidores ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="truncate">{c.email ? <a href={`mailto:${c.email}`} className="text-primary">{c.email}</a> : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Inscrição</dt>
          <dd>
            {dataCurta(c.criadoEm)} · {c.origem}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Último contato</dt>
          <dd>{c.chamadoEm ? `${haQuanto(c.chamadoEm)} · ${c.chamadoPor}` : '—'}</dd>
        </div>
      </dl>

      <Filtro rotulo="Status" valor={c.status} opcoes={STATUS} onChange={(v) => onSalvar(c, { status: v }, { status: v })} />

      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        Observação
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          onBlur={() => observacao !== (c.observacao ?? '') && onSalvar(c, { observacao }, { observacao })}
          placeholder="Ex.: combinou valor, pediu mídia kit…"
          rows={4}
          maxLength={1000}
          className="w-full resize-y rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
        />
        <span>Salva ao sair do campo.</span>
      </label>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        Link de rastreio (cadastros por ele aparecem como "ref" em Cadastros e Resultados)
        <div className="flex gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground">{rastreio}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(rastreio).then(() => setLinkCopiado(true)).catch(() => {})}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-foreground hover:bg-foreground/5"
          >
            {linkCopiado ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
            {linkCopiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-foreground/[0.04] p-3 text-sm leading-relaxed text-muted-foreground">{texto}</div>
      <a
        href={waLink(c.whatsapp, texto)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onChamar}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground"
      >
        <WhatsappIcon className="size-5" />
        Chamar no WhatsApp
      </a>
    </>
  )
}
