import type { Metadata } from 'next'
import { obterConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { CentralAtendimento } from './central'

export const metadata: Metadata = { title: 'Atendimento' }

export default async function AtendimentoPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const sessao = await exigirSessaoPagina()
  const { c } = await searchParams
  const modelos = await obterConfig('modelos_cadastro')
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Atendimento</h1>
      <p className="mt-1 text-sm text-muted-foreground">Conversas do chat do site e do WhatsApp. O robô responde sozinho até alguém assumir.</p>
      <CentralAtendimento modelos={modelos} atendente={sessao.nome} inicial={c && /^[0-9a-f-]{36}$/i.test(c) ? c : null} />
    </>
  )
}
