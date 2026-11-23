import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirSessaoPagina } from '@/lib/equipe'
import { explicarErroBanco, gruposDuplicados } from '@/lib/leads'
import { AvisoBanco } from '../../aviso-banco'
import { ListaDuplicados } from './lista-duplicados'

export const metadata: Metadata = { title: 'Cadastros duplicados' }

export default async function DuplicadosPage() {
  await exigirSessaoPagina('admin')
  let grupos: Awaited<ReturnType<typeof gruposDuplicados>> = null
  let erro: ReturnType<typeof explicarErroBanco> | null = null
  try {
    grupos = await gruposDuplicados()
  } catch (e) {
    erro = explicarErroBanco(e)
  }
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <Link href="/equipe/leads" className="hover:text-foreground">
          Cadastros
        </Link>{' '}
        › Duplicados
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Cadastros duplicados</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        O mesmo celular salvo de jeitos diferentes (por exemplo, com e sem o 9 depois do DDD). Mantenha o cadastro certo e remova o outro: assim a pessoa não
        recebe campanha duas vezes.
      </p>
      {!grupos ? (
        <AvisoBanco erro={erro} />
      ) : (
        <ListaDuplicados
          grupos={grupos.map((g) =>
            g.map((l) => ({
              id: l.id,
              nome: l.nome,
              whatsapp: l.whatsapp,
              origem: l.origem,
              criadoEm: new Date(l.criado_em).toISOString(),
              convertido: l.convertido,
              chamadas: l.chamadas,
              consentimento: l.consentimento,
              invalido: l.invalido,
              campanhas: l.campanhas,
              conversas: l.conversas,
            })),
          )}
        />
      )}
    </>
  )
}
