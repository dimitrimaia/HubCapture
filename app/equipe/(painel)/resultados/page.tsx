import Link from 'next/link'
import { obterConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { explicarErroBanco } from '@/lib/leads'
import { type Etapas, lerSemanas, PERIODOS_RESULTADOS, type Recorte, resultados } from '@/lib/resultados'
import { cn } from '@/lib/utils'
import { AvisoBanco } from '../aviso-banco'
import { GraficoSemanas } from './grafico-semanas'

function taxa(parte: number, todo: number) {
  return todo ? `${Math.round((parte / todo) * 100)}%` : '—'
}

const ETAPAS: { chave: keyof Etapas; rotulo: string }[] = [
  { chave: 'cadastros', rotulo: 'Cadastros' },
  { chave: 'chamados', rotulo: 'Chamados' },
  { chave: 'responderam', rotulo: 'Responderam' },
  { chave: 'convertidos', rotulo: 'Convertidos' },
]

/** Funil do período: barras horizontais de uma cor só (uma série, sem legenda). */
function Funil({ total }: { total: Etapas }) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card/60 p-4">
      <h2 className="text-sm font-semibold">Funil do período</h2>
      <ol className="mt-3 flex flex-col gap-2.5">
        {ETAPAS.map((etapa, i) => {
          const valor = total[etapa.chave]
          return (
            <li key={etapa.chave} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[8rem_1fr_9rem]">
              <span className="text-muted-foreground">{etapa.rotulo}</span>
              <span className="h-5 overflow-hidden rounded-r-[4px] bg-foreground/[0.04]">
                <span className="block h-full rounded-r-[4px]" style={{ width: total.cadastros ? `${(valor / total.cadastros) * 100}%` : 0, background: '#199e70' }} />
              </span>
              <span className="text-right tabular-nums">
                <strong>{valor}</strong>
                {i > 0 && <span className="text-xs text-muted-foreground"> · {taxa(valor, total.cadastros)}</span>}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Conta os cadastros feitos no período e onde cada um está hoje (% sobre os cadastros). Conversão total: <strong className="text-foreground">{taxa(total.convertidos, total.cadastros)}</strong>.
      </p>
    </section>
  )
}

function TabelaRecorte({ titulo, coluna, linhas, rotulo }: { titulo: string; coluna: string; linhas: Recorte[]; rotulo?: (chave: string) => string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/60">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhum chamado registrado no período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">{coluna}</th>
                <th className="px-2 py-2 text-right font-medium">Contatos</th>
                <th className="px-2 py-2 text-right font-medium">Responderam</th>
                <th className="px-2 py-2 text-right font-medium">Convertidos</th>
                <th className="px-4 py-2 text-right font-medium">Conversão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((l) => (
                <tr key={l.chave}>
                  <td className="px-4 py-2">{rotulo ? rotulo(l.chave) : l.chave}</td>
                  <td className="px-2 py-2 text-right">{l.contatos}</td>
                  <td className="px-2 py-2 text-right">{l.responderam}</td>
                  <td className="px-2 py-2 text-right">{l.convertidos}</td>
                  <td className="px-4 py-2 text-right font-medium">{taxa(l.convertidos, l.contatos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default async function ResultadosPage({ searchParams }: { searchParams: Promise<{ semanas?: string }> }) {
  await exigirSessaoPagina('admin')
  const semanas = lerSemanas((await searchParams).semanas)
  let dados: Awaited<ReturnType<typeof resultados>> = null
  let erroBanco: ReturnType<typeof explicarErroBanco> | null = null
  try {
    dados = await resultados(semanas)
  } catch (error) {
    erroBanco = explicarErroBanco(error)
  }
  const modelos = await obterConfig('modelos_cadastro')
  const nomeModelo = (id: string) => modelos.find((m) => m.id === id)?.rotulo ?? (id === 'fila' ? 'Fila' : id)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resultados</h1>
          <p className="mt-1 text-sm text-muted-foreground">O que converte: por semana, por mensagem, por atendente e por origem.</p>
        </div>
        <nav aria-label="Período" className="flex gap-1 rounded-full border border-border p-1 text-sm">
          {PERIODOS_RESULTADOS.map((p) => (
            <Link
              key={p}
              href={`/equipe/resultados?semanas=${p}`}
              aria-current={p === semanas ? 'page' : undefined}
              className={cn('rounded-full px-3 py-1', p === semanas ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {p} sem.
            </Link>
          ))}
        </nav>
      </div>
      {!dados ? (
        <AvisoBanco erro={erroBanco} />
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <Funil total={dados.total} />
            <GraficoSemanas semanas={dados.semanas} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TabelaRecorte titulo="Por mensagem usada" coluna="Mensagem" linhas={dados.mensagens} rotulo={nomeModelo} />
            <TabelaRecorte titulo="Por atendente" coluna="Atendente" linhas={dados.atendentes} />
          </div>
          <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/60">
            <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Por origem (links de rastreio)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Origem</th>
                    <th className="px-2 py-2 text-right font-medium">Cadastros</th>
                    <th className="px-2 py-2 text-right font-medium">Chamados</th>
                    <th className="px-2 py-2 text-right font-medium">Responderam</th>
                    <th className="px-2 py-2 text-right font-medium">Convertidos</th>
                    <th className="px-4 py-2 text-right font-medium">Conversão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dados.origens.map((o) => (
                    <tr key={o.origem}>
                      <td className="px-4 py-2">{o.origem}</td>
                      <td className="px-2 py-2 text-right">{o.cadastros}</td>
                      <td className="px-2 py-2 text-right">{o.chamados}</td>
                      <td className="px-2 py-2 text-right">{o.responderam}</td>
                      <td className="px-2 py-2 text-right">{o.convertidos}</td>
                      <td className="px-4 py-2 text-right font-medium">{taxa(o.convertidos, o.cadastros)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Divulgue com links como <code>hubcapture.app/cadastro?utm_source=instagram&amp;utm_campaign=reels-1</code> ou o link de rastreio de cada
              influencer (aba Colab).
            </p>
          </section>
        </div>
      )}
    </>
  )
}
