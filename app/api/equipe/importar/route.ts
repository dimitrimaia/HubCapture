import { registrarAuditoria, registrarErro } from '@/lib/auditoria'
import { importarColabs } from '@/lib/colabs'
import { exigirSessaoApi } from '@/lib/equipe'
import { importarLeads } from '@/lib/leads'
import { toE164 } from '@/lib/phone'
import { lerLinhasPlanilha, parseDataPlanilha } from '@/lib/webhook'

export const maxDuration = 60

/**
 * Traz para o banco quem já está na planilha: ?tipo=cadastro (aba Cadastro, padrão) ou ?tipo=colab
 * (aba Colab da planilha de influencers). Um registro por telefone, mantendo o mais antigo.
 */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const tipo = new URL(request.url).searchParams.get('tipo') === 'colab' ? 'colab' : 'cadastro'

  const leitura = await lerLinhasPlanilha(tipo)
  if (!leitura.ok) return Response.json({ ok: false, erro: leitura.erro }, { status: 502 })

  let ignorados = 0
  const porTelefone = new Map<string, { nome: string; whatsapp: string; criadoEm?: Date; perfil: string; seguidores: string; email: string }>()
  for (const linha of leitura.linhas) {
    const whatsapp = toE164(String(linha.whatsapp ?? ''))
    const nome = String(linha.nome ?? '').trim().slice(0, 120)
    if (!whatsapp || nome.length < 2) {
      ignorados += 1
      continue
    }
    const criadoEm = parseDataPlanilha(linha.criadoEm)
    const atual = porTelefone.get(whatsapp)
    if (!atual || (criadoEm && atual.criadoEm && criadoEm < atual.criadoEm)) {
      porTelefone.set(whatsapp, {
        nome,
        whatsapp,
        criadoEm,
        perfil: String(linha.perfil ?? '').trim().slice(0, 120) || '—',
        seguidores: String(linha.seguidores ?? '').slice(0, 40),
        email: String(linha.email ?? '').trim().toLowerCase().slice(0, 160),
      })
    }
  }

  const lista = [...porTelefone.values()]
  const resultado = await (tipo === 'colab'
    ? importarColabs(lista)
    : importarLeads(lista.map(({ nome, whatsapp, criadoEm }) => ({ nome, whatsapp, criadoEm })))
  ).catch(async (error) => {
    await registrarErro('importar', error)
    return null
  })
  if (!resultado) return Response.json({ ok: false, erro: 'Configure o banco (DATABASE_URL) antes de importar.' }, { status: 503 })
  await registrarAuditoria('importacao', sessao, { detalhe: `${tipo}: ${resultado.novos} novos` })
  return Response.json({ ok: true, ...resultado, ignorados })
}
