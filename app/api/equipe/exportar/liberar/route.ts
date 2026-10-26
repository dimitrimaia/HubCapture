import { falhasLoginRecentes, registrarAuditoria } from '@/lib/auditoria'
import { exigirSessaoApi, exportacaoLiberada, liberarExportacao } from '@/lib/equipe'
import { ipDoPedido } from '@/lib/ip'
import { senhaConfere } from '@/lib/senha'
import { codigoTotpValido } from '@/lib/totp'
import { buscarPorId } from '@/lib/usuarios'

/** Situação: { liberada, doisFatores } para o botão Exportar decidir se pede a senha. */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, liberada: await exportacaoLiberada(sessao), doisFatores: sessao.doisFatores }, { headers: { 'Cache-Control': 'no-store' } })
}

/** Confere { senha, codigo? } e libera exportações por 10 minutos. Erros contam no bloqueio de login. */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })
  const ip = ipDoPedido(request.headers)
  if ((await falhasLoginRecentes({ ip, usuario: sessao.usuario }).catch(() => 0)) >= 10) {
    return Response.json({ ok: false, erro: 'Muitas tentativas erradas. Espere 15 minutos.' }, { status: 429 })
  }
  const body = await request.json().catch(() => ({}))
  const conta = await buscarPorId(sessao.id)
  const senhaOk = conta ? await senhaConfere(String(body.senha ?? ''), conta.senhaHash) : false
  const codigoOk = !conta?.totpSegredo || codigoTotpValido(conta.totpSegredo, String(body.codigo ?? ''))
  if (!senhaOk || !codigoOk) {
    // detalhe = usuário, como no login: conta no bloqueio por usuário também.
    await registrarAuditoria('login_falhou', sessao, { ip, detalhe: sessao.usuario })
    return Response.json({ ok: false, erro: senhaOk ? 'Código do autenticador incorreto.' : 'Senha incorreta.' }, { status: 400 })
  }
  await liberarExportacao(sessao)
  await registrarAuditoria('exportacao_liberada', sessao, { ip })
  return Response.json({ ok: true })
}
