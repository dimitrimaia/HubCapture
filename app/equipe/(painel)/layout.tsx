import Link from 'next/link'
import { exigirSessaoPagina } from '@/lib/equipe'
import { MenuLateral, MenuMovel } from './nav-equipe'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessaoPagina()
  const menu = { nome: sessao.nome, admin: sessao.papel === 'admin' }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <MenuLateral {...menu} />
      <div className="min-w-0 pb-16">
        <MenuMovel {...menu} />
        {sessao.trocarSenha && (
          <p className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
            <Link href="/equipe/conta?trocar=1" className="block rounded-2xl border border-primary/40 bg-primary/10 p-3 text-sm">
              Sua senha é temporária. <strong>Toque aqui para criar a sua.</strong>
            </Link>
          </p>
        )}
        <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-8">{children}</main>
      </div>
    </div>
  )
}
