'use client'

import { CircleCheck, CircleX, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useState } from 'react'

type Diagnostico = {
  variavel: string | null
  implantacao: string | null
  tokenConfigurado: boolean
  situacao: 'sem-url' | 'sem-token' | 'ok' | 'codigo-antigo' | 'token-invalido' | 'sem-acesso' | 'erro'
  linhas?: number
  detalhe?: string
}

const EXPLICACAO: Record<Diagnostico['situacao'], string> = {
  'sem-url': 'Nenhuma URL da planilha configurada. Crie CADASTRO_WEBHOOK_URL na Vercel com a URL /exec do Apps Script e faça Redeploy.',
  'sem-token': 'Falta PLANILHA_LEITURA_TOKEN na Vercel (mesmo valor do TOKEN_LEITURA do Apps Script). Crie e faça Redeploy.',
  ok: '',
  'codigo-antigo':
    'Essa implantação ainda roda o código ANTIGO. No Apps Script: Implantar → Gerenciar implantações → abra a implantação com este código → lápis ✏ → Versão: Nova versão → Implantar. Não precisa mexer na Vercel.',
  'token-invalido':
    'O código novo respondeu, mas o token não bate. Confira se PLANILHA_LEITURA_TOKEN (Vercel) é exatamente igual ao TOKEN_LEITURA (Apps Script) e faça Redeploy.',
  'sem-acesso':
    'O Google pediu login. Na implantação, "Quem pode acessar" precisa ser "Qualquer pessoa" (lápis ✏ → Qualquer pessoa → Implantar).',
  erro: 'A planilha respondeu com erro.',
}

/** Mostra qual implantação do Apps Script o site está usando e se a leitura (importação) funciona. */
export function TestePlanilha() {
  const [testando, setTestando] = useState(false)
  const [resultado, setResultado] = useState<Diagnostico | null>(null)

  async function testar() {
    setTestando(true)
    const response = await fetch('/api/equipe/planilha', { method: 'POST' }).catch(() => null)
    setResultado(await response?.json().catch(() => null))
    setTestando(false)
  }

  return (
    <section aria-label="Planilha de cadastros" className="glass mt-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FileSpreadsheet className="size-4 text-primary" aria-hidden="true" />
          Planilha de cadastros (Apps Script)
        </p>
        <button
          type="button"
          onClick={testar}
          disabled={testando}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/12 px-4 text-sm transition-colors hover:bg-foreground/5 disabled:opacity-60"
        >
          {testando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Testar planilha
        </button>
      </div>
      {resultado && (
        <div role="status" className="mt-3 flex gap-2 text-sm">
          {resultado.situacao === 'ok' ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            {resultado.situacao === 'ok' ? (
              <p>
                Leitura funcionando: <strong>{resultado.linhas}</strong> linhas na aba Cadastro. Pode tocar em “Importar da planilha”.
              </p>
            ) : (
              <p>{EXPLICACAO[resultado.situacao]}</p>
            )}
            {resultado.detalhe && <p className="break-words text-muted-foreground">{resultado.detalhe}</p>}
            <p className="break-words font-mono text-xs text-muted-foreground">
              Variável: {resultado.variavel ?? '—'} · Implantação: {resultado.implantacao ?? '—'} · Token:{' '}
              {resultado.tokenConfigurado ? 'configurado' : 'faltando'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
