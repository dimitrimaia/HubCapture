import { exigirSessaoPagina } from '@/lib/equipe'
import { listarUsuarios } from '@/lib/usuarios'
import { UsuariosPainel } from './usuarios-painel'

export default async function UsuariosPage() {
  const sessao = await exigirSessaoPagina('admin')
  const usuarios = await listarUsuarios()

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Usuários</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada pessoa da equipe tem login e senha próprios. <strong>Admin</strong> vê tudo; <strong>equipe</strong> vê fila, cadastros e
        colab.
      </p>
      <UsuariosPainel usuarios={usuarios} eu={sessao.id} />
    </>
  )
}
