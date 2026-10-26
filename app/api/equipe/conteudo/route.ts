import { obterConfigDetalhada } from '@/lib/configuracoes'
import { blocoValido, salvarBloco } from '@/lib/conteudo-servidor'
import { exigirSessaoApi } from '@/lib/equipe'

/** Conteúdo atual de um bloco (só admin). Salvar é pela Server Action em components/landing/acoes-edicao.ts. */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const bloco = new URL(request.url).searchParams.get('bloco')
  if (!blocoValido(bloco)) return Response.json({ ok: false }, { status: 400 })
  try {
    const dados = await obterConfigDetalhada(bloco)
    return Response.json({ ok: true, ...dados }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ ok: false, erro: 'Banco indisponível.' }, { status: 503 })
  }
}

/** Mesmo salvamento por API ({ bloco, valor } ou { bloco, restaurar: true }), para scripts. Só admin. */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false, erro: 'Só administradores podem editar o site.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (!blocoValido(body.bloco)) return Response.json({ ok: false }, { status: 400 })
  const resultado = await salvarBloco(sessao, body.bloco, { valor: body.valor, restaurar: body.restaurar === true })
  return Response.json(resultado, { status: resultado.ok ? 200 : 400 })
}
