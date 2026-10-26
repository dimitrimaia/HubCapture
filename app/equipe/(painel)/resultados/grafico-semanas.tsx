'use client'

import { useEffect, useRef, useState } from 'react'
import type { Semana } from '@/lib/resultados'
import { cn } from '@/lib/utils'

/**
 * Colunas por semana: cadastros x convertidos (mesmo eixo, mesma unidade: pessoas).
 * Cores validadas para a superfície escura do painel (dataviz: azul #3987e5, verde-água #199e70).
 */
const SERIES = [
  { chave: 'cadastros', rotulo: 'Cadastros', cor: '#3987e5' },
  { chave: 'convertidos', rotulo: 'Convertidos', cor: '#199e70' },
] as const

const ALTURA = 220
const MARGEM = { topo: 12, base: 28, esquerda: 32, direita: 8 }

function rotuloSemana(semana: string) {
  const [, mes, dia] = semana.split('-')
  return `${dia}/${mes}`
}

function escala(maximo: number) {
  // Topo "redondo" e 4 linhas de grade.
  const passo = Math.max(1, Math.ceil(maximo / 4 / 5) * 5 || 1)
  return { topo: passo * 4, ticks: [0, 1, 2, 3, 4].map((i) => i * passo) }
}

export function GraficoSemanas({ semanas }: { semanas: Semana[] }) {
  const [ativo, setAtivo] = useState<number | null>(null)
  const [tabela, setTabela] = useState(false)
  const rolagem = useRef<HTMLDivElement>(null)
  // No celular o gráfico rola na horizontal: abre já nas semanas mais recentes.
  useEffect(() => {
    if (rolagem.current) rolagem.current.scrollLeft = rolagem.current.scrollWidth
  }, [tabela, semanas])
  const largura = Math.max(320, semanas.length * 44)
  const { topo, ticks } = escala(Math.max(1, ...semanas.map((s) => s.cadastros)))
  const areaL = largura - MARGEM.esquerda - MARGEM.direita
  const areaA = ALTURA - MARGEM.topo - MARGEM.base
  const grupo = areaL / semanas.length
  const barra = Math.min(16, (grupo - 10) / 2)
  const y = (v: number) => MARGEM.topo + areaA - (v / topo) * areaA
  const s = ativo !== null ? semanas[ativo] : null

  return (
    <figure className="min-w-0 rounded-2xl border border-border bg-card/60 p-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">Cadastros e convertidos por semana</span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          {SERIES.map((serie) => (
            <span key={serie.chave} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: serie.cor }} aria-hidden="true" />
              {serie.rotulo}
            </span>
          ))}
          <button type="button" onClick={() => setTabela((t) => !t)} className="rounded-full border border-border px-2.5 py-1 hover:bg-foreground/5">
            {tabela ? 'Ver gráfico' : 'Ver tabela'}
          </button>
        </span>
      </figcaption>

      {tabela ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 font-medium">Semana de</th>
                <th className="py-1.5 text-right font-medium">Cadastros</th>
                <th className="py-1.5 text-right font-medium">Chamados</th>
                <th className="py-1.5 text-right font-medium">Responderam</th>
                <th className="py-1.5 text-right font-medium">Convertidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {semanas.map((semana) => (
                <tr key={semana.semana}>
                  <td className="py-1.5">{rotuloSemana(semana.semana)}</td>
                  <td className="py-1.5 text-right">{semana.cadastros}</td>
                  <td className="py-1.5 text-right">{semana.chamados}</td>
                  <td className="py-1.5 text-right">{semana.responderam}</td>
                  <td className="py-1.5 text-right">{semana.convertidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={rolagem} className="relative mt-3 overflow-x-auto">
          <svg viewBox={`0 0 ${largura} ${ALTURA}`} width={largura} height={ALTURA} role="img" aria-label="Gráfico de colunas: cadastros e convertidos por semana" className="block max-w-none">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
                <text x={MARGEM.esquerda - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                  {t}
                </text>
              </g>
            ))}
            {semanas.map((semana, i) => {
              const x0 = MARGEM.esquerda + i * grupo + (grupo - (barra * 2 + 2)) / 2
              return (
                <g key={semana.semana}>
                  {SERIES.map((serie, j) => {
                    const valor = semana[serie.chave]
                    const altura = Math.max(valor > 0 ? 2 : 0, (valor / topo) * areaA)
                    const x = x0 + j * (barra + 2)
                    const base = MARGEM.topo + areaA
                    const r = Math.min(4, barra / 2, altura)
                    // Cantos arredondados só em cima, apoiado na linha de base.
                    const d = `M${x},${base} V${base - altura + r} Q${x},${base - altura} ${x + r},${base - altura} H${x + barra - r} Q${x + barra},${base - altura} ${x + barra},${base - altura + r} V${base} Z`
                    return <path key={serie.chave} d={d} fill={serie.cor} opacity={ativo === null || ativo === i ? 1 : 0.45} />
                  })}
                  <text x={MARGEM.esquerda + i * grupo + grupo / 2} y={ALTURA - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                    {rotuloSemana(semana.semana)}
                  </text>
                  {/* Área de toque maior que a barra. */}
                  <rect
                    x={MARGEM.esquerda + i * grupo}
                    y={MARGEM.topo}
                    width={grupo}
                    height={areaA}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`Semana de ${rotuloSemana(semana.semana)}: ${semana.cadastros} cadastros, ${semana.convertidos} convertidos`}
                    onMouseEnter={() => setAtivo(i)}
                    onMouseLeave={() => setAtivo(null)}
                    onFocus={() => setAtivo(i)}
                    onBlur={() => setAtivo(null)}
                    onClick={() => setAtivo((a) => (a === i ? null : i))}
                    className="outline-none"
                  />
                </g>
              )
            })}
          </svg>
          {s && ativo !== null && (
            <div
              role="status"
              className={cn('pointer-events-none absolute top-2 z-10 min-w-40 rounded-xl border border-border bg-background/95 p-2.5 text-xs shadow-lg')}
              style={{ left: Math.min(largura - 170, Math.max(0, MARGEM.esquerda + ativo * grupo + grupo / 2 - 80)) }}
            >
              <p className="font-semibold">Semana de {rotuloSemana(s.semana)}</p>
              <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 tabular-nums">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: SERIES[0].cor }} aria-hidden="true" />
                  Cadastros
                </dt>
                <dd className="text-right">{s.cadastros}</dd>
                <dt className="pl-3.5 text-muted-foreground">Chamados</dt>
                <dd className="text-right">{s.chamados}</dd>
                <dt className="pl-3.5 text-muted-foreground">Responderam</dt>
                <dd className="text-right">{s.responderam}</dd>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: SERIES[1].cor }} aria-hidden="true" />
                  Convertidos
                </dt>
                <dd className="text-right">{s.convertidos}</dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </figure>
  )
}
