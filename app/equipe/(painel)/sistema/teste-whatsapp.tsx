'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { WhatsappIcon } from '@/components/landing/whatsapp-icon'

type Resultado = { ok: boolean; erro?: string; numero?: string; nome?: string; qualidade?: string }

export function TesteWhatsapp() {
  const [testando, setTestando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  return (
    <section aria-label="WhatsApp" className="glass mt-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <WhatsappIcon className="size-4 text-primary" />
          WhatsApp Cloud API (Meta)
        </p>
        <button
          type="button"
          disabled={testando}
          onClick={async () => {
            setTestando(true)
            const r = await fetch('/api/equipe/whatsapp-teste', { method: 'POST' }).catch(() => null)
            setResultado(await r?.json().catch(() => null))
            setTestando(false)
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm hover:bg-foreground/5 disabled:opacity-60"
        >
          {testando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Testar conexão
        </button>
      </div>
      {resultado && (
        <p role="status" className={`mt-3 text-sm ${resultado.ok ? '' : 'text-destructive'}`}>
          {resultado.ok
            ? `Conectado: ${resultado.nome ?? ''} ${resultado.numero ?? ''} · qualidade ${resultado.qualidade ?? 'desconhecida'}`
            : resultado.erro}
        </p>
      )}
    </section>
  )
}
