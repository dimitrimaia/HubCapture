import { listarColabs, resumoColabs, STATUS_COLAB } from '@/lib/colabs'
import { obterConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { explicarErroBanco } from '@/lib/leads'
import { AvisoBanco } from '../aviso-banco'
import { ColabTabela, type LinhaColab } from './colab-tabela'

export default async function ColabPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sessao = await exigirSessaoPagina()
  const params = await searchParams
  const filtros = {
    status: (STATUS_COLAB as readonly string[]).includes(params.status ?? '') ? params.status! : 'todos',
    busca: params.q?.slice(0, 60) ?? '',
    pagina: Math.max(1, Math.min(10_000, Number.parseInt(params.pagina ?? '1', 10) || 1)),
    porPagina: [25, 50, 100].includes(Number(params.por)) ? Number(params.por) : 25,
  }

  let pagina: Awaited<ReturnType<typeof listarColabs>> = null
  let resumo: Awaited<ReturnType<typeof resumoColabs>> = null
  let erroBanco: ReturnType<typeof explicarErroBanco> | null = null
  try {
    ;[pagina, resumo] = await Promise.all([listarColabs(filtros), resumoColabs()])
  } catch (error) {
    erroBanco = explicarErroBanco(error)
  }
  const modelos = await obterConfig('modelos_colab')

  const linhas: LinhaColab[] | null = pagina
    ? pagina.itens.map((c) => ({
        id: c.id,
        nome: c.nome,
        perfil: c.perfil,
        seguidores: c.seguidores,
        email: c.email,
        whatsapp: c.whatsapp,
        origem: c.origem,
        status: c.status,
        observacao: c.observacao,
        chamadoEm: c.chamadoEm?.toISOString() ?? null,
        chamadoPor: c.chamadoPor,
        criadoEm: c.criadoEm.toISOString(),
      }))
    : null

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Colab com Influencers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Criadores que se inscreveram para a parceria. Acompanhe a conversa pelo status.</p>
      {!linhas || !pagina ? (
        <AvisoBanco erro={erroBanco} />
      ) : (
        <ColabTabela
          linhas={linhas}
          total={pagina.total}
          filtros={filtros}
          resumo={resumo ?? {}}
          modelos={modelos}
          atendente={sessao.nome}
          podeExportar={sessao.papel === 'admin'}
        />
      )}
    </>
  )
}
