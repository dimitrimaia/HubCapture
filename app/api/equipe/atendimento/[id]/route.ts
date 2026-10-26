import { assumir, conversaCompleta, devolverAoBot, JANELA_WHATSAPP_MS, podeResponder, resolver } from '@/lib/atendimento'
import { exigirSessaoApi } from '@/lib/equipe'
import { formatE164 } from '@/lib/phone'

/** Conversa completa. ?lida=1 zera as não lidas (quando a conversa está aberta na tela). */
export async function GET(request: Request, ctx: RouteContext<'/api/equipe/atendimento/[id]'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const dados = await conversaCompleta(id, { marcarLida: new URL(request.url).searchParams.get('lida') === '1' }).catch(() => null)
  if (!dados) return Response.json({ ok: false }, { status: 404 })
  const a = dados.atendimento
  return Response.json(
    {
      ok: true,
      atendimento: {
        id: a.id,
        canal: a.canal,
        nome: a.nome ?? (a.canal === 'whatsapp' ? formatE164(`+${a.contato}`) : 'Visitante do site'),
        telefone: a.canal === 'whatsapp' ? formatE164(`+${a.contato}`) : null,
        whatsapp: a.canal === 'whatsapp' ? a.contato : null,
        status: a.status,
        atendente: a.atendenteNome,
        meu: a.atendenteId === sessao.id,
        leadId: a.leadId,
        criadoEm: a.criadoEm.toISOString(),
        janelaAberta: podeResponder(a),
        janelaFechaEm: a.canal === 'whatsapp' && a.ultimaDoClienteEm ? new Date(a.ultimaDoClienteEm.getTime() + JANELA_WHATSAPP_MS).toISOString() : null,
      },
      mensagens: dados.mensagens.map((m) => ({ id: m.id, autor: m.autor, autorNome: m.autorNome, texto: m.texto, erro: m.erro, em: m.criadoEm.toISOString() })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

/** { acao: 'assumir' | 'devolver' | 'resolver' } */
export async function POST(request: Request, ctx: RouteContext<'/api/equipe/atendimento/[id]'>) {
  const sessao = await exigirSessaoApi(request)
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const { id } = await ctx.params
  const { acao } = await request.json().catch(() => ({}))
  const executar = acao === 'assumir' ? assumir : acao === 'devolver' ? devolverAoBot : acao === 'resolver' ? resolver : null
  if (!executar) return Response.json({ ok: false }, { status: 400 })
  await executar(id, sessao).catch(() => null)
  return Response.json({ ok: true })
}
