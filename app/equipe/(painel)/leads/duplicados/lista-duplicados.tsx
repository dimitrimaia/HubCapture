'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatE164 } from '@/lib/phone'
import { dataCurta } from '../../formatos'
import { Selo } from '../../ui'

type Lead = {
  id: string
  nome: string
  whatsapp: string
  origem: string
  criadoEm: string
  convertido: boolean
  chamadas: number
  consentimento: boolean
  invalido: boolean
  campanhas: number
  conversas: number
}

/** Sugestão de qual manter: o que tem mais histórico (convertido, conversas, campanhas) e, empatando, o mais antigo. */
function pontos(l: Lead) {
  return (l.convertido ? 1000 : 0) + l.conversas * 100 + l.campanhas * 10 + l.chamadas + (l.consentimento ? 1 : 0) - (l.invalido ? 500 : 0)
}

export function ListaDuplicados({ grupos }: { grupos: Lead[][] }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function remover(l: Lead) {
    if (!window.confirm(`Remover o cadastro de ${l.nome} (${formatE164(l.whatsapp)})? Isso não pode ser desfeito.`)) return
    setOcupado(l.id)
    setErro(null)
    const r = await fetch(`/api/equipe/leads/${l.id}`, { method: 'DELETE' }).catch(() => null)
    const d = await r?.json().catch(() => null)
    setOcupado(null)
    if (!d?.ok) setErro(d?.erro ?? 'Não foi possível remover agora.')
    router.refresh()
  }

  if (grupos.length === 0) {
    return <p className="mt-6 rounded-2xl border border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">Nenhum duplicado encontrado. 🎉</p>
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm">
        <strong>{grupos.length}</strong> {grupos.length === 1 ? 'grupo' : 'grupos'} de possíveis duplicados.
      </p>
      {erro && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </p>
      )}
      {grupos.map((grupo) => {
        const manter = [...grupo].sort((a, b) => pontos(b) - pontos(a) || a.criadoEm.localeCompare(b.criadoEm))[0]
        return (
          <section key={grupo[0].id} className="overflow-hidden rounded-2xl border border-border bg-card/60">
            <ul className="divide-y divide-border">
              {grupo.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {l.nome}
                      {l.id === manter.id && <Selo tom="verde">Sugestão: manter</Selo>}
                      {l.convertido && <Selo tom="verde">Convertido</Selo>}
                      {l.invalido && <Selo tom="vermelho">Inválido/saiu</Selo>}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{formatE164(l.whatsapp)}</p>
                    <p className="text-xs text-muted-foreground">
                      Cadastro {dataCurta(l.criadoEm)} · {l.origem} · {l.consentimento ? 'aceitou mensagens' : 'sem aceite'} · {l.chamadas} chamadas · {l.campanhas}{' '}
                      campanhas · {l.conversas} conversas
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={ocupado !== null}
                    onClick={() => remover(l)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-destructive/40 px-3 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    {ocupado === l.id ? 'Removendo…' : 'Remover'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
