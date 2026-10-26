'use client'

import { Ban, Check, Copy, Loader2, MessageCircleReply, MousePointerClick, Plus, Search, ShieldCheck, Tag, Upload, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'
import type { FiltrosLeads } from '@/lib/leads'
import { ETIQUETAS_SUGERIDAS, limparEtiqueta } from '@/lib/leads-tipos'
import { type ModeloMensagem, preencherMensagem } from '@/lib/mensagens'
import { formatE164, waLink } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { BotaoExportar } from '../botao-exportar'
import { BotaoIcone, dataCurta, Filtro, haQuanto, Indicadores, PainelLateral, Paginacao, Selo } from '../ui'

export type LinhaLead = {
  id: string
  nome: string
  whatsapp: string
  origem: string
  criadoEm: string
  ultimaAcao: string | null
  chamadoEm: string | null
  chamadoPor: string | null
  chamadas: number
  convertidoEm: string | null
  respondeuWhatsappEm: string | null
  consentimento: boolean
  numeroInvalido: boolean
  optOut: boolean
  nota: string | null
  etiquetas: string[]
  /** De onde veio: ref, utm_source ou origem (lib/rastreio.ts → rotuloOrigem). */
  fonte: string
}

type Resumo = { total: number; ultimas24h: number; tocaramCadastrar: number; chamados: number; responderam: number; convertidos: number } | null

const SITUACOES = [
  { valor: 'pendentes', rotulo: 'A trabalhar' },
  { valor: 'nunca-chamados', rotulo: 'Nunca chamados' },
  { valor: 'chamados', rotulo: 'Já chamados' },
  { valor: 'convertidos', rotulo: 'Convertidos' },
  { valor: 'invalidos', rotulo: 'Inválidos / saíram' },
  { valor: 'todos', rotulo: 'Todos' },
]

const CHAVE_MODELO = 'hubcapture:equipe-modelo'

const ACOES_ROTULO: Record<string, string> = {
  formulario: 'Enviou o formulário',
  'acao:cadastrar': 'Abriu o cadastro da Hub',
  'acao:whatsapp': 'Tocou em "Tirar dúvidas no WhatsApp"',
  'acao:comunidade': 'Tocou em "Entrar na comunidade"',
  chamado: 'Chamado no WhatsApp',
  convertido: 'Marcado como convertido',
  desconvertido: 'Conversão desfeita',
  numero_invalido: 'Número marcado como inválido',
  numero_valido: 'Número marcado como válido',
  nota: 'Nota',
  etiquetas: 'Etiquetas',
}

function Situacao({ l }: { l: LinhaLead }) {
  if (l.optOut) return <Selo tom="vermelho">Saiu</Selo>
  if (l.numeroInvalido) return <Selo tom="vermelho">Nº inválido</Selo>
  if (l.convertidoEm) return <Selo tom="verde">Convertido</Selo>
  if (l.chamadas > 0) return <Selo tom="amarelo">{l.chamadas}º contato feito</Selo>
  return <Selo>Novo</Selo>
}

function Sinais({ l }: { l: LinhaLead }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      {l.ultimaAcao === 'cadastrar' && <MousePointerClick className="size-3.5" aria-label="Abriu o cadastro da Hub" />}
      {l.respondeuWhatsappEm && <MessageCircleReply className="size-3.5 text-primary" aria-label="Escreveu no WhatsApp" />}
      {l.consentimento && <ShieldCheck className="size-3.5" aria-label="Aceitou receber mensagens" />}
    </span>
  )
}

async function post(url: string, corpo: object) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), keepalive: true }).catch(() => null)
  return Boolean(r?.ok)
}

export function LeadsTabela({
  linhas: iniciais,
  total,
  filtros,
  resumo,
  modelos,
  atendente,
  podeExportar,
  etiquetasEmUso,
}: {
  linhas: LinhaLead[]
  total: number
  filtros: FiltrosLeads
  resumo: Resumo
  modelos: ModeloMensagem[]
  atendente: string
  podeExportar: boolean
  etiquetasEmUso: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [carregando, iniciar] = useTransition()
  const [linhas, setLinhas] = useState(iniciais)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [modelo, setModelo] = useState(modelos[0]?.id ?? '')
  const [detalhe, setDetalhe] = useState<LinhaLead | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState(filtros.busca)
  const [importando, setImportando] = useState(false)
  const primeiraBusca = useRef(true)

  useEffect(() => {
    setLinhas(iniciais)
    setSelecionados(new Set())
  }, [iniciais])

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_MODELO)
      if (salvo && modelos.some((m) => m.id === salvo)) setModelo(salvo)
    } catch {}
  }, [modelos])

  const modeloAtual = modelos.find((m) => m.id === modelo) ?? modelos[0]

  function navegar(mudancas: Partial<Record<keyof FiltrosLeads | 'q' | 'por', string | number | boolean>>, manterPagina = false) {
    const params = new URLSearchParams()
    const atual: Record<string, string | number | boolean> = {
      situacao: filtros.situacao,
      origem: filtros.origem,
      periodo: filtros.periodo,
      consentiu: filtros.consentiu ? '1' : '',
      etiqueta: filtros.etiqueta,
      q: filtros.busca,
      ordem: filtros.ordem,
      por: filtros.porPagina,
      pagina: manterPagina ? filtros.pagina : 1,
      ...mudancas,
    }
    const padroes: Record<string, string> = { situacao: 'pendentes', origem: 'todas', periodo: 'todos', ordem: 'recentes', por: '25', pagina: '1' }
    for (const [chave, valor] of Object.entries(atual)) {
      const texto = valor === true ? '1' : valor === false ? '' : String(valor)
      if (texto && padroes[chave] !== texto) params.set(chave, texto)
    }
    iniciar(() => router.push(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false }))
  }

  // Busca com espera de 400 ms enquanto a pessoa digita.
  useEffect(() => {
    if (primeiraBusca.current) {
      primeiraBusca.current = false
      return
    }
    const espera = setTimeout(() => busca !== filtros.busca && navegar({ q: busca }), 400)
    return () => clearTimeout(espera)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  function atualizar(id: string, dados: Partial<LinhaLead>) {
    setLinhas((atual) => atual.map((l) => (l.id === id ? { ...l, ...dados } : l)))
    setDetalhe((atual) => (atual?.id === id ? { ...atual, ...dados } : atual))
  }

  function chamar(event: React.MouseEvent, l: LinhaLead) {
    if (l.chamadoEm && !window.confirm(`${l.chamadoPor ?? 'Alguém'} já chamou ${l.nome} ${haQuanto(l.chamadoEm)}. Chamar de novo?`)) {
      event.preventDefault()
      return
    }
    post(`/api/equipe/leads/${l.id}/chamar`, { modelo: modeloAtual?.id ?? 'outro' }).then((ok) => !ok && setAviso('O chamado não foi registrado.'))
    atualizar(l.id, { chamadoEm: new Date().toISOString(), chamadoPor: atendente, chamadas: l.chamadas + 1 })
  }

  async function alternarConvertido(l: LinhaLead) {
    const convertido = !l.convertidoEm
    atualizar(l.id, { convertidoEm: convertido ? new Date().toISOString() : null })
    if (!(await post(`/api/equipe/leads/${l.id}/convertido`, { convertido }))) {
      atualizar(l.id, { convertidoEm: l.convertidoEm })
      setAviso('Não foi possível salvar.')
    }
  }

  async function alternarInvalido(l: LinhaLead) {
    const invalido = !l.numeroInvalido
    atualizar(l.id, { numeroInvalido: invalido })
    if (!(await post(`/api/equipe/leads/${l.id}/invalido`, { invalido }))) atualizar(l.id, { numeroInvalido: l.numeroInvalido })
  }

  async function salvarNotas(l: LinhaLead, dados: { nota?: string; etiquetas?: string[] }) {
    atualizar(l.id, dados)
    const r = await fetch(`/api/equipe/leads/${l.id}/notas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) }).catch(() => null)
    if (!r?.ok) {
      atualizar(l.id, { nota: l.nota, etiquetas: l.etiquetas })
      setAviso('Não foi possível salvar a nota/etiqueta.')
      return false
    }
    return true
  }

  async function emLote(acao: 'convertido' | 'invalido') {
    const ids = [...selecionados]
    if (!window.confirm(`${acao === 'convertido' ? 'Marcar como convertidos' : 'Marcar número inválido'}: ${ids.length} contatos?`)) return
    const r = await fetch('/api/equipe/leads/lote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, acao }) }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setAviso(r?.ok ? `${dados.total} contatos atualizados.` : 'Não foi possível atualizar.')
    router.refresh()
  }

  async function importar() {
    setImportando(true)
    const r = await fetch('/api/equipe/importar', { method: 'POST' }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setImportando(false)
    setAviso(r?.ok ? `Planilha importada: ${dados.novos} novos, ${dados.existentes} já existiam${dados.ignorados ? `, ${dados.ignorados} sem telefone válido` : ''}.` : (dados?.erro ?? 'Não foi possível importar.'))
    if (r?.ok) router.refresh()
  }

  const todosSelecionados = linhas.length > 0 && linhas.every((l) => selecionados.has(l.id))
  const taxa = resumo && resumo.total ? Math.round((resumo.convertidos / resumo.total) * 100) : 0
  const exportarHref = useMemo(() => {
    const p = new URLSearchParams({ tipo: 'cadastros', situacao: filtros.situacao, origem: filtros.origem, periodo: filtros.periodo, ordem: filtros.ordem })
    if (filtros.consentiu) p.set('consentiu', '1')
    if (filtros.etiqueta) p.set('etiqueta', filtros.etiqueta)
    if (filtros.busca) p.set('q', filtros.busca)
    return `/api/equipe/exportar?${p}`
  }, [filtros])

  return (
    <div className="mt-5 flex flex-col gap-4">
      {resumo && (
        <Indicadores
          itens={[
            { rotulo: 'Cadastros', valor: resumo.total },
            { rotulo: 'Últimas 24 h', valor: resumo.ultimas24h },
            { rotulo: 'Abriram cadastro', valor: resumo.tocaramCadastrar },
            { rotulo: 'Chamados', valor: resumo.chamados },
            { rotulo: 'Responderam', valor: resumo.responderam },
            { rotulo: `Convertidos · ${taxa}%`, valor: resumo.convertidos, destaque: true },
          ]}
        />
      )}

      {/* Barra de ferramentas */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar por nome ou telefone</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou telefone"
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
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
          <Filtro rotulo="Situação" valor={filtros.situacao} opcoes={SITUACOES} onChange={(v) => navegar({ situacao: v })} />
          <Filtro
            rotulo="Origem"
            valor={filtros.origem}
            opcoes={[
              { valor: 'todas', rotulo: 'Todas' },
              { valor: 'site', rotulo: 'Site' },
              { valor: 'planilha', rotulo: 'Planilha' },
            ]}
            onChange={(v) => navegar({ origem: v })}
          />
          <Filtro
            rotulo="Período"
            valor={filtros.periodo}
            opcoes={[
              { valor: 'todos', rotulo: 'Tudo' },
              { valor: 'hoje', rotulo: 'Hoje' },
              { valor: '7d', rotulo: '7 dias' },
              { valor: '30d', rotulo: '30 dias' },
            ]}
            onChange={(v) => navegar({ periodo: v })}
          />
          <Filtro
            rotulo="Ordem"
            valor={filtros.ordem}
            opcoes={[
              { valor: 'recentes', rotulo: 'Mais recentes' },
              { valor: 'antigos', rotulo: 'Mais antigos' },
              { valor: 'nome', rotulo: 'Nome (A–Z)' },
              { valor: 'contato', rotulo: 'Último contato' },
            ]}
            onChange={(v) => navegar({ ordem: v })}
          />
          <Filtro
            rotulo="Etiqueta"
            valor={filtros.etiqueta}
            opcoes={[{ valor: '', rotulo: 'Todas' }, ...[...new Set([...etiquetasEmUso, filtros.etiqueta].filter(Boolean))].map((e) => ({ valor: e, rotulo: e }))]}
            onChange={(v) => navegar({ etiqueta: v })}
          />
          <label className="col-span-2 flex h-9 items-center gap-2 text-xs text-muted-foreground lg:col-span-1">
            <input type="checkbox" checked={filtros.consentiu} onChange={(e) => navegar({ consentiu: e.target.checked })} className="size-4 accent-primary" />
            Só quem aceitou mensagens
          </label>
        </div>
        {modelos.length > 0 && (
          <Filtro
            rotulo="Mensagem do botão WhatsApp"
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

      {aviso && (
        <p role="status" className="flex items-start justify-between gap-3 rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-sm">
          {aviso}
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </p>
      )}

      {selecionados.size > 0 && (
        <div className="sticky top-16 z-30 lg:top-2 flex flex-wrap items-center gap-2 rounded-xl border border-primary/40 bg-background/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
          <strong>{selecionados.size} selecionados</strong>
          <button type="button" onClick={() => emLote('convertido')} className="h-8 rounded-full border border-border px-3 hover:bg-foreground/5">
            Marcar convertidos
          </button>
          <button type="button" onClick={() => emLote('invalido')} className="h-8 rounded-full border border-border px-3 hover:bg-foreground/5">
            Número inválido
          </button>
          <button type="button" onClick={() => setSelecionados(new Set())} className="ml-auto h-8 px-2 text-muted-foreground">
            Limpar
          </button>
        </div>
      )}

      <div className={cn('overflow-hidden rounded-2xl border border-border bg-card/60 transition-opacity', carregando && 'opacity-60')}>
        {linhas.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhum contato com esses filtros.{' '}
            <button type="button" className="text-primary underline" onClick={() => navegar({ situacao: 'todos', origem: 'todas', periodo: 'todos', consentiu: false, etiqueta: '', q: '' })}>
              Limpar filtros
            </button>
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-foreground/[0.03] text-left text-xs text-muted-foreground max-md:sr-only">
              <tr>
                <th scope="col" className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos da página"
                    checked={todosSelecionados}
                    onChange={() => setSelecionados(todosSelecionados ? new Set() : new Set(linhas.map((l) => l.id)))}
                    className="size-4 accent-primary"
                  />
                </th>
                <th scope="col" className="px-2 py-2 font-medium">Contato</th>
                <th scope="col" className="px-2 py-2 font-medium">Cadastro</th>
                <th scope="col" className="px-2 py-2 font-medium">Situação</th>
                <th scope="col" className="px-2 py-2 font-medium">Último contato</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((l) => {
                const texto = modeloAtual ? preencherMensagem(modeloAtual.texto, { nome: l.nome, atendente }) : undefined
                return (
                  <tr
                    key={l.id}
                    onClick={(e) => !(e.target as HTMLElement).closest('a,button,input') && setDetalhe(l)}
                    className={cn('cursor-pointer transition-colors hover:bg-foreground/[0.03] max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-2 max-md:px-3 max-md:py-2.5', selecionados.has(l.id) && 'bg-primary/5')}
                  >
                    <td className="w-10 px-3 py-2 max-md:order-1 max-md:w-auto max-md:p-0">
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${l.nome}`}
                        checked={selecionados.has(l.id)}
                        onChange={() =>
                          setSelecionados((atual) => {
                            const novo = new Set(atual)
                            if (novo.has(l.id)) novo.delete(l.id)
                            else novo.add(l.id)
                            return novo
                          })
                        }
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="min-w-0 px-2 py-2 max-md:order-2 max-md:flex-1 max-md:p-0">
                      <p className="flex items-center gap-1.5 truncate font-medium">
                        <span className="truncate">{l.nome}</span>
                        <Sinais l={l} />
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatE164(l.whatsapp)}
                        <span className="md:hidden"> · {dataCurta(l.criadoEm)}</span>
                      </p>
                      {l.etiquetas.length > 0 && (
                        <p className="mt-1 flex flex-wrap gap-1">
                          {l.etiquetas.slice(0, 3).map((e) => (
                            <span key={e} className="rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {e}
                            </span>
                          ))}
                          {l.etiquetas.length > 3 && <span className="text-[10px] text-muted-foreground">+{l.etiquetas.length - 3}</span>}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-muted-foreground max-md:hidden">
                      {dataCurta(l.criadoEm)}
                      <span className="block max-w-36 truncate" title={l.fonte}>
                        {l.fonte}
                      </span>
                    </td>
                    <td className="px-2 py-2 max-md:order-3 max-md:p-0">
                      <Situacao l={l} />
                    </td>
                    <td className="px-2 py-2 text-xs whitespace-nowrap text-muted-foreground max-md:hidden">
                      {l.chamadoEm ? (
                        <>
                          {haQuanto(l.chamadoEm)}
                          <span className="block">por {l.chamadoPor}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 max-md:order-4 max-md:p-0">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={waLink(l.whatsapp, texto)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => chamar(e, l)}
                          aria-label={`Chamar ${l.nome} no WhatsApp`}
                          title={`Chamar no WhatsApp (${modeloAtual?.rotulo ?? ''})`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                        >
                          <WhatsappIcon className="size-4" />
                        </a>
                        <BotaoIcone rotulo={l.convertidoEm ? 'Desfazer convertido' : 'Marcar convertido'} ativo={Boolean(l.convertidoEm)} onClick={() => alternarConvertido(l)}>
                          <Check className="size-4" aria-hidden="true" />
                        </BotaoIcone>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Paginacao pagina={filtros.pagina} porPagina={filtros.porPagina} total={total} onPagina={(p) => navegar({ pagina: p }, true)} />
        <Filtro
          rotulo="Por página"
          valor={String(filtros.porPagina)}
          opcoes={[25, 50, 100].map((n) => ({ valor: String(n), rotulo: String(n) }))}
          onChange={(v) => navegar({ por: v })}
        />
      </div>

      <DetalheLead
        lead={detalhe}
        onFechar={() => setDetalhe(null)}
        texto={detalhe && modeloAtual ? preencherMensagem(modeloAtual.texto, { nome: detalhe.nome, atendente }) : ''}
        onChamar={chamar}
        onConvertido={alternarConvertido}
        onInvalido={alternarInvalido}
        onNotas={salvarNotas}
        sugestoes={[...new Set([...ETIQUETAS_SUGERIDAS, ...etiquetasEmUso])]}
      />
    </div>
  )
}

function DetalheLead({
  lead,
  onFechar,
  texto,
  onChamar,
  onConvertido,
  onInvalido,
  onNotas,
  sugestoes,
}: {
  lead: LinhaLead | null
  onFechar: () => void
  texto: string
  onChamar: (e: React.MouseEvent, l: LinhaLead) => void
  onConvertido: (l: LinhaLead) => void
  onInvalido: (l: LinhaLead) => void
  onNotas: (l: LinhaLead, dados: { nota?: string; etiquetas?: string[] }) => Promise<boolean>
  sugestoes: string[]
}) {
  const [versao, setVersao] = useState(0)
  const [eventos, setEventos] = useState<{ tipo: string; detalhe: string | null; por: string | null; em: string }[] | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    setEventos(null)
    setCopiado(false)
    if (!lead) return
    fetch(`/api/equipe/leads/${lead.id}/historico`)
      .then((r) => r.json())
      .then((d) => setEventos(d.eventos ?? []))
      .catch(() => setEventos([]))
  }, [lead?.id, versao])

  return (
    <PainelLateral aberto={Boolean(lead)} onFechar={onFechar} titulo={lead?.nome ?? ''}>
      {lead && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Situacao l={lead} />
            {lead.consentimento && <Selo>Aceitou mensagens</Selo>}
            {lead.respondeuWhatsappEm && <Selo tom="verde">Escreveu no WhatsApp</Selo>}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">WhatsApp</dt>
              <dd className="flex items-center gap-1.5 font-mono">
                {formatE164(lead.whatsapp)}
                <button
                  type="button"
                  aria-label="Copiar telefone"
                  onClick={() => navigator.clipboard.writeText(lead.whatsapp).then(() => setCopiado(true)).catch(() => {})}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copiado ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cadastro</dt>
              <dd>
                {dataCurta(lead.criadoEm)} · {lead.fonte}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Contatos feitos</dt>
              <dd>{lead.chamadas}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Último contato</dt>
              <dd>{lead.chamadoEm ? `${haQuanto(lead.chamadoEm)} · ${lead.chamadoPor}` : '—'}</dd>
            </div>
          </dl>

          <div className="rounded-2xl bg-foreground/[0.04] p-3 text-sm leading-relaxed text-muted-foreground">{texto}</div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={waLink(lead.whatsapp, texto)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => onChamar(e, lead)}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground"
            >
              <WhatsappIcon className="size-5" />
              Chamar no WhatsApp
            </a>
            <button type="button" onClick={() => onConvertido(lead)} className={cn('inline-flex h-10 items-center justify-center gap-1.5 rounded-full border text-sm', lead.convertidoEm ? 'border-primary bg-primary/15' : 'border-border')}>
              <Check className="size-4" aria-hidden="true" />
              {lead.convertidoEm ? 'Convertido' : 'Marcar convertido'}
            </button>
            <button type="button" onClick={() => onInvalido(lead)} className={cn('inline-flex h-10 items-center justify-center gap-1.5 rounded-full border text-sm', lead.numeroInvalido ? 'border-destructive/50 text-destructive' : 'border-border')}>
              <Ban className="size-4" aria-hidden="true" />
              {lead.numeroInvalido ? 'Nº inválido' : 'Número inválido'}
            </button>
          </div>

          <NotasEtiquetas
            key={lead.id}
            lead={lead}
            sugestoes={sugestoes}
            onSalvar={async (dados) => (await onNotas(lead, dados)) && setVersao((v) => v + 1)}
          />

          <section>
            <h3 className="text-sm font-semibold">Histórico</h3>
            {!eventos ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
              </p>
            ) : eventos.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sem eventos registrados (veio da planilha).</p>
            ) : (
              <ol className="mt-2 flex flex-col gap-2 border-l border-border pl-4 text-sm">
                {eventos.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-primary" aria-hidden="true" />
                    <p>
                      {ACOES_ROTULO[e.tipo] ?? e.tipo.replace('lote:', 'Em lote: ')}
                      {e.detalhe ? <span className="text-muted-foreground"> · {e.detalhe}</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dataCurta(e.em)}
                      {e.por ? ` · ${e.por}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </PainelLateral>
  )
}

function NotasEtiquetas({
  lead,
  sugestoes,
  onSalvar,
}: {
  lead: LinhaLead
  sugestoes: string[]
  onSalvar: (dados: { nota?: string; etiquetas?: string[] }) => void
}) {
  const [nota, setNota] = useState(lead.nota ?? '')
  const [nova, setNova] = useState('')
  const disponiveis = sugestoes.filter((e) => !lead.etiquetas.includes(e)).slice(0, 8)

  function adicionar(valor: string) {
    const etiqueta = limparEtiqueta(valor)
    if (!etiqueta || lead.etiquetas.includes(etiqueta) || lead.etiquetas.length >= 10) return
    onSalvar({ etiquetas: [...lead.etiquetas, etiqueta] })
    setNova('')
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Tag className="size-4" aria-hidden="true" /> Etiquetas e nota
      </h3>
      <ul className="flex flex-wrap gap-1.5" aria-label="Etiquetas">
        {lead.etiquetas.map((e) => (
          <li key={e}>
            <button
              type="button"
              onClick={() => onSalvar({ etiquetas: lead.etiquetas.filter((x) => x !== e) })}
              aria-label={`Remover etiqueta ${e}`}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/40 bg-primary/12 px-2.5 text-xs"
            >
              {e}
              <X className="size-3" aria-hidden="true" />
            </button>
          </li>
        ))}
        {disponiveis.map((e) => (
          <li key={e}>
            <button
              type="button"
              onClick={() => adicionar(e)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-border px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3" aria-hidden="true" />
              {e}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          adicionar(nova)
        }}
      >
        <input
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          maxLength={30}
          placeholder="Nova etiqueta"
          aria-label="Nova etiqueta"
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-primary"
        />
        <button type="submit" className="h-9 rounded-lg border border-border px-3 text-sm hover:bg-foreground/5">
          Adicionar
        </button>
      </form>
      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        Nota
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={() => nota !== (lead.nota ?? '') && onSalvar({ nota })}
          rows={3}
          maxLength={2000}
          placeholder="Ex.: pediu ajuda com o Minute, voltar a chamar sexta…"
          className="w-full resize-y rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
        />
        <span>Salva ao sair do campo.</span>
      </label>
    </section>
  )
}
