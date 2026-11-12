import { registrarAuditoria, registrarErro } from '@/lib/auditoria'
import { criarCampanha, limparFiltros, listarCampanhas, type Variavel } from '@/lib/campanhas'
import { exigirSessaoApi } from '@/lib/equipe'
import { listarModelosAprovados } from '@/lib/whatsapp'

export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const lista = await listarCampanhas().catch(async (error) => {
    await registrarErro('campanhas', error)
    return null
  })
  return lista ? Response.json({ ok: true, campanhas: lista }, { headers: { 'Cache-Control': 'no-store' } }) : Response.json({ ok: false }, { status: 503 })
}

/** Cria um rascunho. O modelo é conferido de novo na Meta (texto e idioma vêm de lá, não do navegador). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
  if (nome.length < 3) return Response.json({ ok: false, erro: 'Dê um nome à campanha.' }, { status: 400 })
  let modelos
  try {
    modelos = await listarModelosAprovados()
  } catch (error) {
    return Response.json({ ok: false, erro: error instanceof Error ? error.message : 'Não foi possível falar com a Meta.' })
  }
  const modelo = modelos.find((m) => m.nome === body.modelo && m.idioma === body.idioma)
  if (!modelo || !modelo.suportado) return Response.json({ ok: false, erro: 'Escolha um modelo aprovado (sem mídia ou botão com variável).' }, { status: 400 })
  const variaveis: Variavel[] = Array.from({ length: modelo.variaveis }, (_, i) => {
    const v = Array.isArray(body.variaveis) ? body.variaveis[i] : null
    return v?.tipo === 'fixo' ? { tipo: 'fixo', valor: String(v.valor ?? '').slice(0, 200) } : { tipo: 'nome' }
  })
  const campanha = await criarCampanha({
    nome,
    modelo: modelo.nome,
    idioma: modelo.idioma,
    categoria: modelo.categoria,
    textoModelo: modelo.texto,
    variaveis,
    filtros: limparFiltros(body.filtros),
    por: sessao.nome,
  })
  await registrarAuditoria('campanha_criada', sessao, { detalhe: `${nome} (${modelo.nome})` })
  return Response.json({ ok: true, id: campanha.id })
}
