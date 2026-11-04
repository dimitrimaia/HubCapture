import { obterConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { etiquetasEmUso, explicarErroBanco, lerFiltrosLeads, paginaLeads, resumoLeads } from '@/lib/leads'
import { rotuloOrigem } from '@/lib/rastreio'
import { AvisoBanco } from '../aviso-banco'
import { type LinhaLead, LeadsTabela } from './leads-tabela'

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sessao = await exigirSessaoPagina()
  const filtros = lerFiltrosLeads(await searchParams)

  let pagina: Awaited<ReturnType<typeof paginaLeads>> = null
  let resumo: Awaited<ReturnType<typeof resumoLeads>> = null
  let etiquetas: string[] = []
  let erroBanco: ReturnType<typeof explicarErroBanco> | null = null
  // Tudo ao mesmo tempo: a página espera pela consulta mais lenta, não pela soma delas.
  const [lidos, modelos] = await Promise.all([
    Promise.all([paginaLeads(filtros), resumoLeads(), etiquetasEmUso()]).catch((error) => {
      console.error('[equipe] Falha ao ler o banco:', error)
      erroBanco = explicarErroBanco(error)
      return null
    }),
    obterConfig('modelos_cadastro'),
  ])
  if (lidos) [pagina, resumo, etiquetas] = lidos

  const linhas: LinhaLead[] | null = pagina
    ? pagina.itens.map((lead) => ({
        id: lead.id,
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        origem: lead.origem,
        criadoEm: lead.criadoEm.toISOString(),
        ultimaAcao: lead.ultimaAcao,
        chamadoEm: lead.chamadoEm?.toISOString() ?? null,
        chamadoPor: lead.chamadoPor,
        chamadas: lead.chamadas,
        convertidoEm: lead.convertidoEm?.toISOString() ?? null,
        respondeuWhatsappEm: lead.respondeuWhatsappEm?.toISOString() ?? null,
        consentimento: lead.consentimentoWhatsapp,
        numeroInvalido: Boolean(lead.numeroInvalidoEm),
        optOut: Boolean(lead.optOutEm),
        nota: lead.nota,
        etiquetas: lead.etiquetas,
        fonte: rotuloOrigem({ origem: lead.origem, utmSource: lead.utmSource ?? undefined, utmCampaign: lead.utmCampaign ?? undefined, ref: lead.ref ?? undefined }),
      }))
    : null

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Cadastros</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quem deixou nome e WhatsApp no site. Para chamar um por um, na ordem certa, use a <strong>Fila de chamadas</strong>.
      </p>
      {!linhas || !pagina ? (
        <AvisoBanco erro={erroBanco} />
      ) : (
        <LeadsTabela
          linhas={linhas}
          total={pagina.total}
          filtros={filtros}
          resumo={resumo}
          modelos={modelos}
          atendente={sessao.nome}
          podeExportar={sessao.papel === 'admin'}
          etiquetasEmUso={etiquetas}
        />
      )}
    </>
  )
}
