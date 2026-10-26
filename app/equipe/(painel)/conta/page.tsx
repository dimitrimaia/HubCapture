import { exigirSessaoPagina } from '@/lib/equipe'
import { ContaFormularios } from './conta-formularios'

export default async function ContaPage({ searchParams }: { searchParams: Promise<{ trocar?: string; bemvindo?: string }> }) {
  const sessao = await exigirSessaoPagina()
  const params = await searchParams

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Minha conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {sessao.nome} · usuário <strong>{sessao.usuario}</strong> · {sessao.papel === 'admin' ? 'administrador' : 'equipe'}
      </p>
      {params.bemvindo && (
        <p className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm">
          Administrador criado. Recomendado agora: ligue a <strong>verificação em duas etapas</strong> abaixo e depois crie as contas
          da equipe em <strong>Usuários</strong>.
        </p>
      )}
      <ContaFormularios trocar={Boolean(params.trocar) || sessao.trocarSenha} doisFatores={sessao.doisFatores} />
    </>
  )
}
