import { CircleCheck, CircleDashed, CircleX } from 'lucide-react'
import { ultimosErros, ultimosEventos } from '@/lib/auditoria'
import { exigirSessaoPagina } from '@/lib/equipe'
import { configuracaoLembretes, resumoLembretes } from '@/lib/lembretes'
import { estadoVariaveis, statusBanco } from '@/lib/sistema'
import { AvisoBanco } from '../aviso-banco'
import { TesteAssistente } from './teste-assistente'
import { TestePlanilha } from './teste-planilha'
import { TesteAlerta } from './teste-alerta'
import { TesteWhatsapp } from './teste-whatsapp'

function dataHora(data: Date) {
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Sao_Paulo' })
}

export default async function SistemaPage() {
  await exigirSessaoPagina('admin')
  const [banco, erros, eventos, lembretes] = await Promise.all([
    statusBanco(),
    ultimosErros().catch(() => []),
    ultimosEventos().catch(() => []),
    resumoLembretes().catch(() => null),
  ])
  const variaveis = estadoVariaveis()
  const configLembretes = configuracaoLembretes()

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Saúde do sistema</h1>
      <p className="mt-1 text-sm text-muted-foreground">Testes rápidos, configuração e os últimos erros. Os valores secretos nunca aparecem aqui.</p>

      {banco.ok ? (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['Banco', `ok · ${banco.ms} ms`],
            ['Cadastros', banco.leads],
            ['Colab', banco.colabs],
            ['Usuários', banco.usuarios],
            ['Erros 24 h', banco.erros24h],
          ].map(([rotulo, valor]) => (
            <div key={String(rotulo)} className="rounded-2xl border border-border bg-card/60 p-4">
              <dt className="text-xs text-muted-foreground">{rotulo}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <AvisoBanco erro={'erro' in banco ? (banco.erro ?? null) : null} />
      )}

      <h2 className="mt-8 text-lg font-semibold">Testes</h2>
      <TesteAssistente />
      <TestePlanilha />
      <TesteWhatsapp />
      <TesteAlerta />

      <h2 className="mt-8 text-lg font-semibold">Lembretes automáticos (Meta, pagos)</h2>
      <div className="mt-3 rounded-2xl border border-border bg-card/60 p-4 text-sm">
        <p>
          Situação: <strong>{configLembretes.ligado ? 'LIGADOS' : 'desligados'}</strong>
          {configLembretes.ligado && !configLembretes.modelo1 && ' · falta WHATSAPP_MODELO_LEMBRETE_1'}
        </p>
        {lembretes && (
          <p className="mt-1 text-muted-foreground">
            {lembretes.consentiram} cadastros aceitaram receber mensagens · {lembretes.sairam} pediram para sair · {lembretes.enviados}{' '}
            lembretes enviados · {lembretes.comErro} com erro
          </p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Variáveis da Vercel</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {variaveis.map((v) => (
          <li key={v.nome} className="flex items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm">
            {v.definida ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Definida" />
            ) : v.obrigatoria ? (
              <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Faltando" />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="Opcional, não definida" />
            )}
            <span className="min-w-0">
              <code className="break-all text-xs">{v.nome}</code>
              <span className="block text-xs text-muted-foreground">{v.para}</span>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Últimos erros</h2>
      {erros.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum erro registrado. 🎉</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border text-sm">
          {erros.map((erro) => (
            <li key={erro.id} className="px-4 py-2.5">
              <span className="font-mono text-xs text-muted-foreground">
                {dataHora(erro.criadoEm)} · {erro.origem}
              </span>
              <p className="break-words">{erro.mensagem}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold">Auditoria</h2>
      <ul className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border text-sm">
        {eventos.map((evento) => (
          <li key={evento.id} className="flex flex-wrap justify-between gap-x-4 px-4 py-2">
            <span>
              <strong>{evento.tipo.replaceAll('_', ' ')}</strong> {evento.usuarioNome ? `· ${evento.usuarioNome}` : ''}{' '}
              {evento.detalhe ? <span className="text-muted-foreground">· {evento.detalhe}</span> : null}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {dataHora(evento.criadoEm)}
              {evento.ip ? ` · ${evento.ip}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
