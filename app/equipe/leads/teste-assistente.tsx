'use client'

import { Bot, CircleCheck, CircleX, Loader2 } from 'lucide-react'
import { useState } from 'react'

type Tentativa = { modelo: string; ok: boolean; status?: number; erro?: string; ms: number }
type Resultado = {
  ok: boolean
  modelo: string | null
  status?: number
  erro?: string
  variavel: string | null
  tentativas?: Tentativa[]
}

const DICAS: Record<number, string> = {
  400: 'A chave é inválida ou foi copiada incompleta. Gere outra em aistudio.google.com e atualize na Vercel.',
  403: 'A chave não tem permissão para a API Gemini (ou o projeto foi bloqueado). Crie a chave pelo aistudio.google.com.',
  404: 'Nenhum dos modelos está disponível para esta chave. Defina ASSISTENTE_MODELO com um modelo listado no AI Studio.',
  429: 'A cota gratuita acabou por agora. Ela renova sozinha (o limite diário vira por volta das 4h–5h de Brasília).',
}

const DICA_TIMEOUT =
  'O Google demorou demais para responder. Pode ser instabilidade momentânea: teste de novo em alguns minutos. Se continuar, defina ASSISTENTE_MODELO=gemini-flash-lite-latest na Vercel (mais rápido) e faça Redeploy.'

/** Botão do painel que mostra por que o chat do site não está respondendo. */
export function TesteAssistente() {
  const [testando, setTestando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  async function testar() {
    setTestando(true)
    const response = await fetch('/api/equipe/assistente', { method: 'POST' }).catch(() => null)
    setResultado(await response?.json().catch(() => null))
    setTestando(false)
  }

  return (
    <section aria-label="Assistente do site" className="glass mt-6 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Bot className="size-4 text-primary" aria-hidden="true" />
          Assistente do site (chat e WhatsApp)
        </p>
        <button
          type="button"
          onClick={testar}
          disabled={testando}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm transition-colors hover:bg-foreground/5 disabled:opacity-60"
        >
          {testando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Testar assistente
        </button>
      </div>
      {resultado && (
        <div role="status" className="mt-3 flex gap-2 text-sm">
          {resultado.ok ? (
            <>
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>
                Funcionando com o modelo <strong>{resultado.modelo}</strong> (chave em <code>{resultado.variavel}</code>).
              </p>
            </>
          ) : (
            <>
              <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                {!resultado.variavel ? (
                  <p>
                    Nenhuma chave encontrada nesta implantação. Na Vercel, crie <code>GEMINI_API_KEY</code> em{' '}
                    <strong>Production</strong> e faça <strong>Redeploy</strong>.
                  </p>
                ) : (
                  <>
                    <p>
                      Não funcionou{resultado.status ? ` (erro ${resultado.status})` : ''}
                      {resultado.modelo ? ` no modelo ${resultado.modelo}` : ''}: {resultado.erro}
                    </p>
                    {resultado.status && DICAS[resultado.status] ? (
                      <p className="text-muted-foreground">{DICAS[resultado.status]}</p>
                    ) : resultado.erro?.includes('timeout') ? (
                      <p className="text-muted-foreground">{DICA_TIMEOUT}</p>
                    ) : null}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {resultado?.tentativas && resultado.tentativas.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
          {resultado.tentativas.map((t, i) => (
            <li key={i} className="break-words">
              {t.ok ? '✓' : '✗'} {t.modelo} · {(t.ms / 1000).toFixed(1)} s{t.ok ? '' : ` · ${t.status ? `${t.status} ` : ''}${t.erro}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
