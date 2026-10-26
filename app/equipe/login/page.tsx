import { Database } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/landing/logo'
import { lerSessao } from '@/lib/equipe'
import { contarUsuarios } from '@/lib/usuarios'
import { LoginForm, PrimeiroAdminForm } from './login-form'

export default async function LoginPage() {
  if (await lerSessao()) redirect('/equipe/fila')
  const usuarios = await contarUsuarios().catch(() => null)

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-sm rounded-3xl p-6 sm:p-8">
        <Logo tagline="Equipe" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{usuarios === 0 ? 'Configurar o painel' : 'Área da equipe'}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Leads, fila de chamadas, colab e administração.</p>
        {usuarios === null ? (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Database className="size-6 text-primary" aria-hidden="true" />
            <p>
              O painel precisa do banco de dados. Confira a <code>DATABASE_URL</code> na Vercel e se o{' '}
              <code>db/atualizacao-2.sql</code> foi rodado no Supabase (docs/painel.md).
            </p>
          </div>
        ) : usuarios === 0 ? (
          <PrimeiroAdminForm />
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  )
}
