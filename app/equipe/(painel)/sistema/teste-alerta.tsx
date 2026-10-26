'use client'

import { BellRing, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function TesteAlerta() {
  const [testando, setTestando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; erro?: string } | null>(null)
  return (
    <section aria-label="Alertas por e-mail" className="glass mt-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <BellRing className="size-4 text-primary" aria-hidden="true" />
          Alerta de erro por e-mail
        </p>
        <button
          type="button"
          disabled={testando}
          onClick={async () => {
            setTestando(true)
            const r = await fetch('/api/equipe/alerta-teste', { method: 'POST' }).catch(() => null)
            setResultado(await r?.json().catch(() => null))
            setTestando(false)
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm hover:bg-foreground/5 disabled:opacity-60"
        >
          {testando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Enviar e-mail de teste
        </button>
      </div>
      {resultado && (
        <p role="status" className={`mt-3 text-sm ${resultado.ok ? '' : 'text-destructive'}`}>
          {resultado.ok ? 'Enviado. Confira sua caixa de entrada (e o spam).' : resultado.erro}
        </p>
      )}
    </section>
  )
}
