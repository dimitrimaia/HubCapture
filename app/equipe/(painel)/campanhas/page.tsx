import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LIMITE_DIARIO, listarCampanhas } from '@/lib/campanhas'
import { exigirSessaoPagina } from '@/lib/equipe'
import { explicarErroBanco } from '@/lib/leads'
import { AvisoBanco } from '../aviso-banco'
import { dataCurta, Selo } from '../ui'

export const metadata: Metadata = { title: 'Campanhas' }

export const STATUS_CAMPANHA: Record<string, { rotulo: string; tom: 'neutro' | 'verde' | 'vermelho' | 'amarelo' }> = {
  rascunho: { rotulo: 'Rascunho', tom: 'neutro' },
  enviando: { rotulo: 'Enviando', tom: 'amarelo' },
  pausada: { rotulo: 'Pausada', tom: 'vermelho' },
  concluida: { rotulo: 'Concluída', tom: 'verde' },
  cancelada: { rotulo: 'Cancelada', tom: 'neutro' },
}

function pct(parte: number, todo: number) {
  return todo ? `${Math.round((parte / todo) * 100)}%` : '—'
}

export default async function CampanhasPage() {
  await exigirSessaoPagina('admin')
  let lista: Awaited<ReturnType<typeof listarCampanhas>> = null
  let erro: ReturnType<typeof explicarErroBanco> | null = null
  try {
    lista = await listarCampanhas()
  } catch (e) {
    erro = explicarErroBanco(e)
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campanhas no WhatsApp</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Disparos com modelos aprovados na Meta, só para quem aceitou receber mensagens. As respostas chegam na aba Atendimento. Limite atual:{' '}
            <strong className="text-foreground">{LIMITE_DIARIO} contatos/dia</strong>.
          </p>
        </div>
        <Link href="/equipe/campanhas/nova" className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" aria-hidden="true" />
          Nova campanha
        </Link>
      </div>

      {!lista ? (
        <AvisoBanco erro={erro} />
      ) : lista.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          Nenhuma campanha ainda. Crie a primeira em <strong className="text-foreground">Nova campanha</strong>.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card/60">
          <table className="w-full text-sm tabular-nums">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Campanha</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 text-right font-medium">Público</th>
                <th className="px-2 py-2 text-right font-medium">Entregues</th>
                <th className="px-2 py-2 text-right font-medium">Lidas</th>
                <th className="px-2 py-2 text-right font-medium">Responderam</th>
                <th className="px-4 py-2 text-right font-medium">Falhas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((c) => (
                <tr key={c.id} className="hover:bg-foreground/[0.03]">
                  <td className="px-4 py-2.5">
                    <Link href={`/equipe/campanhas/${c.id}`} className="font-medium hover:text-primary">
                      {c.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.modelo} · {dataCurta(c.criadoEm.toISOString())} · {c.criadoPor}
                    </p>
                  </td>
                  <td className="px-2 py-2.5">
                    <Selo tom={STATUS_CAMPANHA[c.status]?.tom ?? 'neutro'}>{STATUS_CAMPANHA[c.status]?.rotulo ?? c.status}</Selo>
                  </td>
                  <td className="px-2 py-2.5 text-right">{c.total}</td>
                  <td className="px-2 py-2.5 text-right">
                    {c.entregues} <span className="text-xs text-muted-foreground">{pct(c.entregues, c.total)}</span>
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {c.lidos} <span className="text-xs text-muted-foreground">{pct(c.lidos, c.total)}</span>
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {c.responderam} <span className="text-xs text-muted-foreground">{pct(c.responderam, c.total)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">{c.falhas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
