import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from '@/lib/auditoria'
import { obterConfigDetalhada, restaurarConfig, salvarConfig } from '@/lib/configuracoes'
import { type Bloco, BLOCOS, validarFaq, validarHero, validarTutoriais } from '@/lib/conteudo'
import { exigirSessaoApi } from '@/lib/equipe'

function blocoValido(valor: unknown): valor is Bloco {
  return typeof valor === 'string' && valor in BLOCOS
}

/** Atualiza as páginas que mostram o bloco (o site é estático e só muda quando é revalidado). */
function revalidar(bloco: Bloco) {
  revalidatePath('/')
  if (bloco === 'tutoriais') revalidatePath('/tutoriais')
}

/** Conteúdo atual de um bloco (só admin). */
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

/** Salva ({ bloco, valor }) ou volta ao padrão ({ bloco, restaurar: true }). Só admin. */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false, erro: 'Só administradores podem editar o site.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const bloco = body.bloco
  if (!blocoValido(bloco)) return Response.json({ ok: false }, { status: 400 })

  try {
    if (body.restaurar === true) {
      await restaurarConfig(bloco)
      await registrarAuditoria('conteudo_restaurado', sessao, { detalhe: bloco })
    } else if (bloco === 'conteudo_hero') {
      const valor = validarHero(body.valor)
      if (!valor) return Response.json({ ok: false, erro: 'Preencha título, subtítulo, os dois textos e os dois valores.' }, { status: 400 })
      await salvarConfig(bloco, valor, sessao.nome)
    } else if (bloco === 'tutoriais') {
      const valor = validarTutoriais(body.valor)
      if (!valor)
        return Response.json(
          { ok: false, erro: 'Cada passo precisa de título (3+ letras) e descrição (10+). O vídeo deve ser um link do YouTube ou um MP4 em https.' },
          { status: 400 },
        )
      await salvarConfig(bloco, valor, sessao.nome)
    } else {
      const valor = validarFaq(body.valor)
      if (!valor) return Response.json({ ok: false, erro: 'Cada pergunta precisa de 5+ letras e cada resposta de 10+.' }, { status: 400 })
      await salvarConfig(bloco, valor, sessao.nome)
    }
  } catch {
    return Response.json({ ok: false, erro: 'Não foi possível salvar (banco indisponível).' }, { status: 503 })
  }
  if (body.restaurar !== true) await registrarAuditoria('conteudo_salvo', sessao, { detalhe: bloco })
  revalidar(bloco)
  return Response.json({ ok: true })
}
