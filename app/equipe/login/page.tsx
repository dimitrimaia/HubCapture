import { redirect } from 'next/navigation'
import { Logo } from '@/components/landing/logo'
import { lerSessao } from '@/lib/equipe'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  if (await lerSessao()) redirect('/equipe/leads')

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-sm rounded-3xl p-6 sm:p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Área da equipe</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Leads do cadastro e chamados no WhatsApp.</p>
        <LoginForm />
      </div>
    </main>
  )
}
