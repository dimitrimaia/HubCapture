import { exigirSessaoApi } from '@/lib/equipe'
import { importarLeads } from '@/lib/leads'
import { toE164 } from '@/lib/phone'
import { lerCadastrosDaPlanilha, parseDataPlanilha } from '@/lib/webhook'

export const maxDuration = 60

/** Traz para o banco quem já está na aba "Cadastro" da planilha (ex.: os leads de antes do banco existir). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })

  const leitura = await lerCadastrosDaPlanilha()
  if (!leitura.ok) return Response.json({ ok: false, erro: leitura.erro }, { status: 502 })

  // Um por telefone, mantendo o cadastro mais antigo.
  const porTelefone = new Map<string, { nome: string; whatsapp: string; criadoEm?: Date }>()
  let ignorados = 0
  for (const linha of leitura.linhas) {
    const whatsapp = toE164(String(linha.whatsapp ?? ''))
    const nome = String(linha.nome ?? '').trim().slice(0, 120)
    if (!whatsapp || nome.length < 2) {
      ignorados += 1
      continue
    }
    const criadoEm = parseDataPlanilha(linha.criadoEm)
    const atual = porTelefone.get(whatsapp)
    if (!atual || (criadoEm && atual.criadoEm && criadoEm < atual.criadoEm)) porTelefone.set(whatsapp, { nome, whatsapp, criadoEm })
  }

  const resultado = await importarLeads([...porTelefone.values()]).catch((error) => {
    console.error('[equipe] Falha ao importar:', error)
    return null
  })
  if (!resultado) return Response.json({ ok: false, erro: 'Configure o banco (DATABASE_URL) antes de importar.' }, { status: 503 })
  return Response.json({ ok: true, ...resultado, ignorados })
}
