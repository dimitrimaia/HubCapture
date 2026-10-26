'use client'

import { Copy, Loader2, ShieldCheck, UserPlus } from 'lucide-react'
import { useActionState, useState } from 'react'
import { ctaClasses } from '@/components/landing/cta-link'
import type { UsuarioLista } from '@/lib/usuarios'
import { cn } from '@/lib/utils'
import { inputClass } from '../../login/login-form'
import { criarConta, type EstadoUsuarios, gerenciarConta } from './actions'

function quando(iso: string | null) {
  if (!iso) return 'nunca entrou'
  return `último acesso ${new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })}`
}

function Resultado({ estado }: { estado: EstadoUsuarios }) {
  const [copiado, setCopiado] = useState(false)
  if (estado.erro) return <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{estado.erro}</p>
  if (!estado.ok) return null
  return (
    <div role="status" className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
      <p>{estado.ok}</p>
      {estado.senhaTemporaria && (
        <div className="mt-2 flex flex-col gap-2">
          <p>
            Senha temporária de <strong>{estado.para}</strong> (aparece só agora; no 1º login a pessoa cria a própria):
          </p>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-background px-3 py-2 font-mono text-base">{estado.senhaTemporaria}</code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(estado.senhaTemporaria!).catch(() => {})
                setCopiado(true)
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/12 px-3 text-xs"
            >
              <Copy className="size-3.5" aria-hidden="true" />
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function UsuariosPainel({ usuarios, eu }: { usuarios: UsuarioLista[]; eu: string }) {
  const [estadoCriar, acaoCriar, criando] = useActionState<EstadoUsuarios, FormData>(criarConta, {})
  const [estado, acao, salvando] = useActionState<EstadoUsuarios, FormData>(gerenciarConta, {})

  return (
    <div className="mt-6 flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-card/60 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Nova conta</h2>
        <form action={acaoCriar} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <input name="nome" placeholder="Nome" aria-label="Nome" required className={inputClass} />
          <input name="usuario" placeholder="Usuário ou e-mail" aria-label="Usuário" autoCapitalize="none" required className={inputClass} />
          <select name="papel" aria-label="Papel" defaultValue="equipe" className={inputClass}>
            <option value="equipe">Equipe</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={criando} className={ctaClasses({ className: 'h-12' })}>
            {criando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
            Criar
          </button>
        </form>
        <div className="mt-3">
          <Resultado estado={estadoCriar} />
        </div>
      </section>

      <Resultado estado={estado} />

      <ul className="flex flex-col gap-3">
        {usuarios.map((u) => (
          <li key={u.id} className={cn('rounded-2xl border p-4', u.ativo ? 'border-border bg-card/60' : 'border-border/60 opacity-60')}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold">
                  {u.nome} {u.id === eu && <span className="text-xs font-normal text-muted-foreground">(você)</span>}
                </p>
                <p className="truncate font-mono text-sm text-muted-foreground">{u.usuario}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className={cn('rounded-full border px-2.5 py-1', u.papel === 'admin' ? 'border-primary/40 bg-primary/10' : 'border-border')}>
                  {u.papel === 'admin' ? 'Admin' : 'Equipe'}
                </span>
                {u.doisFatores && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2.5 py-1">
                    <ShieldCheck className="size-3" aria-hidden="true" /> 2 etapas
                  </span>
                )}
                {!u.ativo && <span className="rounded-full border border-destructive/40 px-2.5 py-1 text-destructive">Desativado</span>}
                {u.trocarSenha && <span className="rounded-full border border-border px-2.5 py-1">Senha temporária</span>}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{quando(u.ultimoLoginEm)}</p>
            <form action={acao} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={u.id} />
              {[
                u.papel === 'admin' ? ['tornar-equipe', 'Tornar equipe'] : ['tornar-admin', 'Tornar admin'],
                u.ativo ? ['desativar', 'Desativar'] : ['ativar', 'Reativar'],
                ['nova-senha', 'Nova senha temporária'],
                ...(u.doisFatores ? [['tirar-2fa', 'Remover 2 etapas']] : []),
                ['encerrar-sessoes', 'Desconectar'],
              ].map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="submit"
                  name="acao"
                  value={valor}
                  disabled={salvando}
                  onClick={(event) => {
                    if (['desativar', 'nova-senha', 'tirar-2fa'].includes(valor) && !window.confirm(`${rotulo}: ${u.nome}?`)) event.preventDefault()
                  }}
                  className="h-9 rounded-full border border-foreground/12 px-3 text-xs transition-colors hover:bg-foreground/5 disabled:opacity-50"
                >
                  {rotulo}
                </button>
              ))}
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
