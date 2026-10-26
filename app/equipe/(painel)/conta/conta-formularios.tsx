'use client'

import { KeyRound, Loader2, LogOut, ShieldCheck, ShieldOff } from 'lucide-react'
import { useActionState, useState, useTransition } from 'react'
import { ctaClasses } from '@/components/landing/cta-link'
import { inputClass } from '../../login/login-form'
import { ativar2FA, desativar2FA, encerrarOutrasSessoes, type EstadoConta, preparar2FA, type Preparo2FA, trocarSenha } from './actions'

function Mensagem({ estado }: { estado: EstadoConta }) {
  if (estado.erro) return <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{estado.erro}</p>
  if (estado.ok) return <p role="status" className="rounded-xl bg-primary/10 p-3 text-sm">{estado.ok}</p>
  return null
}

function Cartao({ titulo, children, destaque = false }: { titulo: string; children: React.ReactNode; destaque?: boolean }) {
  return (
    <section className={`mt-6 rounded-3xl border p-5 sm:p-6 ${destaque ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/60'}`}>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function ContaFormularios({ trocar, doisFatores }: { trocar: boolean; doisFatores: boolean }) {
  const [estadoSenha, acaoSenha, trocando] = useActionState<EstadoConta, FormData>(trocarSenha, {})
  const [estadoAtivar, acaoAtivar, ativando] = useActionState<EstadoConta, FormData>(ativar2FA, {})
  const [estadoDesativar, acaoDesativar, desativando] = useActionState<EstadoConta, FormData>(desativar2FA, {})
  const [preparo, setPreparo] = useState<Preparo2FA | null>(null)
  const [estadoSessoes, setEstadoSessoes] = useState<EstadoConta>({})
  const [gerando, iniciar] = useTransition()

  const ligado = (doisFatores || Boolean(estadoAtivar.ok)) && !estadoDesativar.ok

  return (
    <>
      <Cartao titulo={trocar ? 'Crie sua senha' : 'Trocar senha'} destaque={trocar}>
        {trocar && <p className="text-sm text-muted-foreground">Sua senha atual é temporária. Escolha uma só sua (mínimo 10 caracteres).</p>}
        <form action={acaoSenha} className="flex flex-col gap-3 sm:max-w-sm">
          <input name="atual" type="password" placeholder="Senha atual" aria-label="Senha atual" autoComplete="current-password" required className={inputClass} />
          <input name="nova" type="password" placeholder="Nova senha" aria-label="Nova senha" autoComplete="new-password" minLength={10} required className={inputClass} />
          <input name="confirmacao" type="password" placeholder="Repita a nova senha" aria-label="Repita a nova senha" autoComplete="new-password" minLength={10} required className={inputClass} />
          <Mensagem estado={estadoSenha} />
          <button type="submit" disabled={trocando} className={ctaClasses({ className: 'w-full sm:w-fit disabled:opacity-70' })}>
            {trocando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
            Salvar senha
          </button>
        </form>
      </Cartao>

      <Cartao titulo="Verificação em duas etapas">
        {ligado ? (
          <>
            <p className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              Ligada. Além da senha, o login pede o código do app autenticador.
            </p>
            <form action={acaoDesativar} className="flex flex-col gap-3 sm:max-w-sm">
              <input name="codigo" inputMode="numeric" autoComplete="one-time-code" placeholder="Código de 6 dígitos" aria-label="Código do autenticador" required className={inputClass} />
              <Mensagem estado={estadoDesativar} />
              <button type="submit" disabled={desativando} className={ctaClasses({ variant: 'outline', className: 'w-full sm:w-fit' })}>
                <ShieldOff className="size-4" aria-hidden="true" />
                Desligar
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Recomendado. Mesmo que alguém descubra sua senha, não entra sem o código que muda a cada 30 segundos no seu celular
              (Google Authenticator, Microsoft Authenticator, 1Password…).
            </p>
            {!preparo || 'erro' in preparo ? (
              <>
                {preparo && 'erro' in preparo && <Mensagem estado={{ erro: preparo.erro }} />}
                <button
                  type="button"
                  disabled={gerando}
                  onClick={() => iniciar(async () => setPreparo(await preparar2FA()))}
                  className={ctaClasses({ className: 'w-full sm:w-fit' })}
                >
                  {gerando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
                  Ligar verificação em duas etapas
                </button>
              </>
            ) : (
              <form action={acaoAtivar} className="flex flex-col gap-3 sm:max-w-sm">
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>No app autenticador, toque em “+” e leia o QR code.</li>
                  <li>Digite o código de 6 dígitos que aparecer.</li>
                </ol>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preparo.qr} alt="QR code para o app autenticador" width={220} height={220} className="rounded-xl bg-white p-2" />
                <p className="break-all font-mono text-xs text-muted-foreground">Sem câmera? Digite a chave: {preparo.segredo}</p>
                <input type="hidden" name="segredo" value={preparo.segredo} />
                <input name="codigo" inputMode="numeric" autoComplete="one-time-code" placeholder="Código de 6 dígitos" aria-label="Código do autenticador" required className={inputClass} />
                <Mensagem estado={estadoAtivar} />
                <button type="submit" disabled={ativando} className={ctaClasses({ className: 'w-full sm:w-fit' })}>
                  Confirmar e ligar
                </button>
              </form>
            )}
          </>
        )}
      </Cartao>

      <Cartao titulo="Sessões">
        <p className="text-sm text-muted-foreground">Esqueceu o painel aberto em outro computador ou celular? Encerre as outras sessões.</p>
        <Mensagem estado={estadoSessoes} />
        <button
          type="button"
          onClick={async () => setEstadoSessoes(await encerrarOutrasSessoes())}
          className={ctaClasses({ variant: 'outline', className: 'w-full sm:w-fit' })}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Encerrar sessões nos outros aparelhos
        </button>
      </Cartao>
    </>
  )
}
