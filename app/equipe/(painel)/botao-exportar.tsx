'use client'

import { Dialog } from '@base-ui/react/dialog'
import { Download, Loader2, LockKeyhole } from 'lucide-react'
import { useState } from 'react'

/**
 * Exportar CSV com dados pessoais: pede a senha (e o código das 2 etapas) de novo.
 * Depois de confirmar, outras exportações ficam liberadas por 10 minutos.
 */
export function BotaoExportar({ href }: { href: string }) {
  const [aberto, setAberto] = useState(false)
  const [doisFatores, setDoisFatores] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function baixar() {
    window.location.href = href
  }

  async function clicar() {
    setVerificando(true)
    const r = await fetch('/api/equipe/exportar/liberar', { cache: 'no-store' }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setVerificando(false)
    if (dados?.liberada) return baixar()
    setDoisFatores(Boolean(dados?.doisFatores))
    setErro(null)
    setAberto(true)
  }

  async function confirmar(formData: FormData) {
    setVerificando(true)
    setErro(null)
    const r = await fetch('/api/equipe/exportar/liberar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: formData.get('senha'), codigo: formData.get('codigo') }),
    }).catch(() => null)
    const dados = await r?.json().catch(() => null)
    setVerificando(false)
    if (!r?.ok) return setErro(dados?.erro ?? 'Não foi possível confirmar.')
    setAberto(false)
    baixar()
  }

  const campo = 'h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-primary'

  return (
    <>
      <button
        type="button"
        onClick={clicar}
        disabled={verificando && !aberto}
        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-foreground/5 disabled:opacity-60 sm:flex-none"
      >
        {verificando && !aberto ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
        Exportar CSV
      </button>
      <Dialog.Root open={aberto} onOpenChange={setAberto}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl outline-none">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
              <LockKeyhole className="size-5 text-primary" aria-hidden="true" />
              Confirme para exportar
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              O arquivo tem nomes e telefones (dados pessoais, LGPD). Fica liberado por 10 minutos e fica registrado.
            </Dialog.Description>
            <form action={confirmar} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                Sua senha
                <input name="senha" type="password" autoComplete="current-password" required autoFocus className={campo} />
              </label>
              {doisFatores && (
                <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  Código do autenticador
                  <input name="codigo" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className={campo} />
                </label>
              )}
              {erro && (
                <p role="alert" className="text-sm text-destructive">
                  {erro}
                </p>
              )}
              <div className="mt-1 flex justify-end gap-2">
                <Dialog.Close className="h-10 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">Cancelar</Dialog.Close>
                <button type="submit" disabled={verificando} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                  {verificando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Confirmar e baixar
                </button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
