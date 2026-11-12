'use client'

import { AlertTriangle, Loader2, Send, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Filtro } from '../../ui'

type Modelo = { nome: string; idioma: string; categoria: string; texto: string; variaveis: number; suportado: boolean }
type Variavel = { tipo: 'nome' | 'fixo'; valor?: string }
type Filtros = { situacao: string; origem: string; periodo: string; etiqueta: string; semCampanhaDias: number }

/** Custo aproximado por mensagem entregue no Brasil (confira a tabela oficial da Meta). */
const CUSTO_USD: Record<string, number> = { MARKETING: 0.0625, UTILITY: 0.0068, AUTHENTICATION: 0.0068 }

function Etapa({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{n}</span>
        {titulo}
      </h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

const campo = 'h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-primary'

export function NovaCampanha({ etiquetas, nomeAdmin }: { etiquetas: string[]; nomeAdmin: string }) {
  const router = useRouter()
  const [modelos, setModelos] = useState<Modelo[] | null>(null)
  const [erroModelos, setErroModelos] = useState<string | null>(null)
  const [escolhido, setEscolhido] = useState('')
  const [nome, setNome] = useState('')
  const [variaveis, setVariaveis] = useState<Variavel[]>([])
  const [filtros, setFiltros] = useState<Filtros>({ situacao: 'nao-convertidos', origem: 'todas', periodo: 'todos', etiqueta: '', semCampanhaDias: 7 })
  const [publico, setPublico] = useState<{ publico: number; consentiram: number; total: number } | null>(null)
  const [telefoneTeste, setTelefoneTeste] = useState('')
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    fetch('/api/equipe/campanhas/modelos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => (d.ok ? setModelos(d.modelos) : setErroModelos(d.erro)))
      .catch(() => setErroModelos('Não foi possível falar com a Meta.'))
  }, [])

  useEffect(() => {
    const espera = setTimeout(() => {
      fetch('/api/equipe/campanhas/publico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filtros }) })
        .then((r) => r.json())
        .then((d) => d.ok && setPublico(d))
        .catch(() => null)
    }, 300)
    return () => clearTimeout(espera)
  }, [filtros])

  const modelo = modelos?.find((m) => `${m.nome}|${m.idioma}` === escolhido)
  useEffect(() => {
    setVariaveis(Array.from({ length: modelo?.variaveis ?? 0 }, (_, i) => (i === 0 ? { tipo: 'nome' } : { tipo: 'fixo', valor: '' })))
  }, [modelo?.nome, modelo?.idioma, modelo?.variaveis])

  const previa = modelo
    ? modelo.texto.replace(/\{\{(\d+)\}\}/g, (_, n) => {
        const v = variaveis[Number(n) - 1]
        return v?.tipo === 'fixo' ? v.valor || `{{${n}}}` : 'Maria'
      })
    : ''
  const custo = modelo && publico ? (CUSTO_USD[modelo.categoria] ?? 0.0625) * publico.publico : 0

  async function testar() {
    if (!modelo) return
    setOcupado(true)
    setAviso(null)
    const r = await fetch('/api/equipe/campanhas/teste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelo: modelo.nome, idioma: modelo.idioma, variaveis, telefone: telefoneTeste }),
    }).catch(() => null)
    const d = await r?.json().catch(() => null)
    setOcupado(false)
    setAviso(d?.ok ? { ok: true, texto: 'Teste enviado. Confira no seu WhatsApp.' } : { ok: false, texto: d?.erro ?? 'Falhou.' })
  }

  async function criar() {
    if (!modelo) return
    setOcupado(true)
    setAviso(null)
    const r = await fetch('/api/equipe/campanhas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, modelo: modelo.nome, idioma: modelo.idioma, variaveis, filtros }),
    }).catch(() => null)
    const d = await r?.json().catch(() => null)
    setOcupado(false)
    if (d?.ok) router.push(`/equipe/campanhas/${d.id}`)
    else setAviso({ ok: false, texto: d?.erro ?? 'Não foi possível criar.' })
  }

  const pronto = Boolean(modelo?.suportado && nome.trim().length >= 3 && publico?.publico && variaveis.every((v) => v.tipo === 'nome' || v.valor?.trim()))

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-4">
        <Etapa n={1} titulo="Nome e modelo aprovado na Meta">
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Nome interno da campanha
            <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} placeholder="Ex.: Lembrete de cadastro – novembro" />
          </label>
          {erroModelos ? (
            <p className="flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              {erroModelos}
            </p>
          ) : !modelos ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Buscando modelos na Meta…
            </p>
          ) : modelos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum modelo aprovado. Crie um no WhatsApp Manager e espere a aprovação.</p>
          ) : (
            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              Modelo
              <select className={campo} value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
                <option value="">Escolha…</option>
                {modelos.map((m) => (
                  <option key={`${m.nome}|${m.idioma}`} value={`${m.nome}|${m.idioma}`} disabled={!m.suportado}>
                    {m.nome} · {m.idioma} · {m.categoria}
                    {m.suportado ? '' : ' (mídia/botão variável: ainda não suportado)'}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Etapa>

        {modelo && variaveis.length > 0 && (
          <Etapa n={2} titulo="O que vai em cada variável">
            {variaveis.map((v, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[6rem_10rem_1fr] sm:items-center">
                <span className="font-mono text-sm">{`{{${i + 1}}}`}</span>
                <select
                  className={campo}
                  value={v.tipo}
                  onChange={(e) => setVariaveis((atual) => atual.map((x, j) => (j === i ? { tipo: e.target.value as Variavel['tipo'], valor: '' } : x)))}
                >
                  <option value="nome">Primeiro nome</option>
                  <option value="fixo">Texto fixo</option>
                </select>
                {v.tipo === 'fixo' && (
                  <input
                    className={campo}
                    value={v.valor ?? ''}
                    maxLength={200}
                    placeholder="Texto igual para todos"
                    onChange={(e) => setVariaveis((atual) => atual.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)))}
                  />
                )}
              </div>
            ))}
          </Etapa>
        )}

        <Etapa n={modelo && variaveis.length ? 3 : 2} titulo="Quem recebe">
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Só cadastros que marcaram “aceito receber mensagens”, sem quem pediu SAIR ou tem número inválido. É regra do WhatsApp e da LGPD.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Filtro
              rotulo="Situação"
              valor={filtros.situacao}
              opcoes={[
                { valor: 'nao-convertidos', rotulo: 'Ainda não converteram' },
                { valor: 'nunca-chamados', rotulo: 'Nunca chamados' },
                { valor: 'convertidos', rotulo: 'Convertidos' },
                { valor: 'todos', rotulo: 'Todos' },
              ]}
              onChange={(v) => setFiltros((f) => ({ ...f, situacao: v }))}
            />
            <Filtro
              rotulo="Cadastro"
              valor={filtros.periodo}
              opcoes={[
                { valor: 'todos', rotulo: 'Qualquer data' },
                { valor: '7d', rotulo: 'Últimos 7 dias' },
                { valor: '30d', rotulo: 'Últimos 30 dias' },
                { valor: '90d', rotulo: 'Últimos 90 dias' },
              ]}
              onChange={(v) => setFiltros((f) => ({ ...f, periodo: v }))}
            />
            <Filtro
              rotulo="Origem"
              valor={filtros.origem}
              opcoes={[
                { valor: 'todas', rotulo: 'Todas' },
                { valor: 'site', rotulo: 'Site' },
                { valor: 'planilha', rotulo: 'Planilha' },
              ]}
              onChange={(v) => setFiltros((f) => ({ ...f, origem: v }))}
            />
            <Filtro
              rotulo="Etiqueta"
              valor={filtros.etiqueta}
              opcoes={[{ valor: '', rotulo: 'Qualquer' }, ...etiquetas.map((e) => ({ valor: e, rotulo: e }))]}
              onChange={(v) => setFiltros((f) => ({ ...f, etiqueta: v }))}
            />
            <div className="sm:col-span-2">
              <Filtro
                rotulo="Não repetir para quem recebeu campanha nos últimos"
                valor={String(filtros.semCampanhaDias)}
                opcoes={[
                  { valor: '0', rotulo: 'não pular' },
                  { valor: '3', rotulo: '3 dias' },
                  { valor: '7', rotulo: '7 dias' },
                  { valor: '15', rotulo: '15 dias' },
                  { valor: '30', rotulo: '30 dias' },
                ]}
                onChange={(v) => setFiltros((f) => ({ ...f, semCampanhaDias: Number(v) }))}
              />
            </div>
          </div>
        </Etapa>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <section className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="text-sm font-semibold">Prévia</h2>
          <div className="mt-3 rounded-2xl rounded-tl-md bg-[#005c4b] p-3 text-sm whitespace-pre-wrap text-white">
            {previa || 'Escolha um modelo para ver a mensagem.'}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm tabular-nums">
            <div className="rounded-xl bg-foreground/[0.04] p-2.5">
              <dt className="text-xs text-muted-foreground">Vai receber</dt>
              <dd className="text-xl font-semibold">{publico?.publico ?? '…'}</dd>
            </div>
            <div className="rounded-xl bg-foreground/[0.04] p-2.5">
              <dt className="text-xs text-muted-foreground">Custo estimado</dt>
              <dd className="text-xl font-semibold">{modelo ? `US$ ${custo.toFixed(2)}` : '—'}</dd>
            </div>
          </dl>
          {publico && (
            <p className="mt-2 text-xs text-muted-foreground">
              {publico.consentiram} de {publico.total} cadastros aceitaram mensagens. Custo aproximado por mensagem entregue ({modelo?.categoria ?? 'categoria'}
              ); confira a tabela da Meta.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="text-sm font-semibold">Teste no seu WhatsApp</h2>
          <div className="mt-3 flex gap-2">
            <input className={campo} value={telefoneTeste} onChange={(e) => setTelefoneTeste(e.target.value)} placeholder="(11) 90000-0000" inputMode="tel" />
            <button
              type="button"
              disabled={!modelo || ocupado || telefoneTeste.replace(/\D/g, '').length < 10}
              onClick={testar}
              className="h-10 shrink-0 rounded-lg border border-border px-3 text-sm hover:bg-foreground/5 disabled:opacity-50"
            >
              Testar
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            O {'{{nome}}'} vai como “{nomeAdmin.split(' ')[0]}”.
          </p>
        </section>

        {aviso && (
          <p
            role="status"
            className={cn(
              'rounded-xl border p-3 text-sm',
              aviso.ok ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            {aviso.texto}
          </p>
        )}

        <button
          type="button"
          disabled={!pronto || ocupado}
          onClick={criar}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground disabled:opacity-50"
        >
          {ocupado ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          Salvar e revisar
        </button>
        <p className="text-center text-xs text-muted-foreground">Nada é enviado agora: na próxima tela você confere e inicia o disparo.</p>
      </aside>
    </div>
  )
}
