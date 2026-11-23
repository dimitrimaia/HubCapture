'use client'

import { AlertTriangle, Loader2, Send, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CUSTO_USD } from '@/lib/campanhas-info'
import { cn } from '@/lib/utils'
import { Filtro } from '../../ui'

type Modelo = { nome: string; idioma: string; categoria: string; texto: string; textoCompleto?: string; variaveis: number; suportado: boolean }
type Variavel = { tipo: 'nome' | 'fixo'; valor?: string }
type Filtros = {
  situacao: string
  chamado: string
  chamadoDias: number
  origem: string
  periodo: string
  de: string
  ate: string
  etiqueta: string
  semCampanhaDias: number
  limite: number
  ordem: string
}

const LIMITES_RAPIDOS = [25, 50, 100, 250]


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

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        'h-8 rounded-full border px-3 text-sm transition-colors',
        ativo ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
      )}
    >
      {children}
    </button>
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
  const [filtros, setFiltros] = useState<Filtros>({
    situacao: 'nao-convertidos',
    chamado: 'nunca',
    chamadoDias: 7,
    origem: 'todas',
    periodo: '7d',
    de: '',
    ate: '',
    etiqueta: '',
    semCampanhaDias: 7,
    limite: 50,
    ordem: 'recentes',
  })
  const [publico, setPublico] = useState<{ publico: number; encontrados: number; consentiram: number; total: number } | null>(null)
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

  const mudar = (parte: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...parte }))
  const modelo = modelos?.find((m) => `${m.nome}|${m.idioma}` === escolhido)
  useEffect(() => {
    setVariaveis(Array.from({ length: modelo?.variaveis ?? 0 }, (_, i) => (i === 0 ? { tipo: 'nome' } : { tipo: 'fixo', valor: '' })))
  }, [modelo?.nome, modelo?.idioma, modelo?.variaveis])

  const previa = modelo
    ? (modelo.textoCompleto ?? modelo.texto).replace(/\{\{(\d+)\}\}/g, (_, n) => {
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
                { valor: 'convertidos', rotulo: 'Convertidos' },
                { valor: 'todos', rotulo: 'Todos' },
              ]}
              onChange={(v) => mudar({ situacao: v })}
            />
            <Filtro
              rotulo="Origem"
              valor={filtros.origem}
              opcoes={[
                { valor: 'todas', rotulo: 'Todas' },
                { valor: 'site', rotulo: 'Site' },
                { valor: 'planilha', rotulo: 'Planilha' },
              ]}
              onChange={(v) => mudar({ origem: v })}
            />
          </div>

          <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <legend className="px-1 text-xs font-medium">Já chamados pela equipe</legend>
            <div className="flex flex-wrap gap-1.5">
              {[
                { valor: 'nunca', rotulo: 'Nunca chamados' },
                { valor: 'nao-recente', rotulo: 'Não chamados recentemente' },
                { valor: 'ja-chamados', rotulo: 'Só quem já foi chamado' },
                { valor: 'qualquer', rotulo: 'Tanto faz' },
              ].map((o) => (
                <Chip key={o.valor} ativo={filtros.chamado === o.valor} onClick={() => mudar({ chamado: o.valor })}>
                  {o.rotulo}
                </Chip>
              ))}
            </div>
            {filtros.chamado === 'nao-recente' && (
              <Filtro
                rotulo="Sem contato há pelo menos"
                valor={String(filtros.chamadoDias)}
                opcoes={[1, 3, 7, 15, 30, 60].map((d) => ({ valor: String(d), rotulo: d === 1 ? '1 dia' : `${d} dias` }))}
                onChange={(v) => mudar({ chamadoDias: Number(v) })}
              />
            )}
            <p className="text-[11px] text-muted-foreground">Conta o botão “Chamar no WhatsApp”, a Fila e campanhas anteriores.</p>
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <legend className="px-1 text-xs font-medium">Data do cadastro</legend>
            <div className="flex flex-wrap gap-1.5">
              {[
                { valor: 'hoje', rotulo: 'Hoje' },
                { valor: 'ontem', rotulo: 'Ontem' },
                { valor: '3d', rotulo: '3 dias' },
                { valor: '7d', rotulo: '7 dias' },
                { valor: '15d', rotulo: '15 dias' },
                { valor: '30d', rotulo: '30 dias' },
                { valor: '90d', rotulo: '90 dias' },
                { valor: 'todos', rotulo: 'Qualquer data' },
                { valor: 'personalizado', rotulo: 'Escolher datas' },
              ].map((o) => (
                <Chip key={o.valor} ativo={filtros.periodo === o.valor} onClick={() => mudar({ periodo: o.valor })}>
                  {o.rotulo}
                </Chip>
              ))}
            </div>
            {filtros.periodo === 'personalizado' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  De
                  <input type="date" className={campo} value={filtros.de} max={filtros.ate || undefined} onChange={(e) => mudar({ de: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Até
                  <input type="date" className={campo} value={filtros.ate} min={filtros.de || undefined} onChange={(e) => mudar({ ate: e.target.value })} />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <legend className="px-1 text-xs font-medium">Quantas pessoas</legend>
            <div className="flex flex-wrap items-center gap-1.5">
              {LIMITES_RAPIDOS.map((n) => (
                <Chip key={n} ativo={filtros.limite === n} onClick={() => mudar({ limite: n })}>
                  {n}
                </Chip>
              ))}
              <Chip ativo={filtros.limite === 0} onClick={() => mudar({ limite: 0 })}>
                Todas
              </Chip>
              <input
                type="number"
                min={1}
                max={10000}
                inputMode="numeric"
                aria-label="Outro número"
                placeholder="Outro"
                className="h-8 w-24 rounded-full border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-primary"
                value={filtros.limite && !LIMITES_RAPIDOS.includes(filtros.limite) ? filtros.limite : ''}
                onChange={(e) => mudar({ limite: Math.max(0, Math.min(10000, Math.floor(Number(e.target.value) || 0))) })}
              />
            </div>
            {filtros.limite > 0 && (
              <Filtro
                rotulo="Começar pelos"
                valor={filtros.ordem}
                opcoes={[
                  { valor: 'recentes', rotulo: 'Cadastros mais recentes' },
                  { valor: 'antigos', rotulo: 'Cadastros mais antigos' },
                ]}
                onChange={(v) => mudar({ ordem: v })}
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              Para mandar aos próximos depois, crie outra campanha: quem já recebeu fica de fora pela regra abaixo.
            </p>
          </fieldset>

          <div className="grid gap-2 sm:grid-cols-2">
            <Filtro
              rotulo="Etiqueta"
              valor={filtros.etiqueta}
              opcoes={[{ valor: '', rotulo: 'Qualquer' }, ...etiquetas.map((e) => ({ valor: e, rotulo: e }))]}
              onChange={(v) => mudar({ etiqueta: v })}
            />
            <Filtro
              rotulo="Pular quem recebeu campanha há menos de"
              valor={String(filtros.semCampanhaDias)}
              opcoes={[
                { valor: '0', rotulo: 'não pular' },
                { valor: '3', rotulo: '3 dias' },
                { valor: '7', rotulo: '7 dias' },
                { valor: '15', rotulo: '15 dias' },
                { valor: '30', rotulo: '30 dias' },
              ]}
              onChange={(v) => mudar({ semCampanhaDias: Number(v) })}
            />
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
              {publico && publico.encontrados > publico.publico && (
                <dd className="text-[11px] text-muted-foreground">de {publico.encontrados} encontrados</dd>
              )}
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
