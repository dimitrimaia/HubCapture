import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirSessaoPagina } from '@/lib/equipe'
import { etiquetasEmUso } from '@/lib/leads'
import { NovaCampanha } from './nova-campanha'

export const metadata: Metadata = { title: 'Nova campanha' }

export default async function NovaCampanhaPage() {
  const sessao = await exigirSessaoPagina('admin')
  const etiquetas = await etiquetasEmUso().catch(() => [])
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <Link href="/equipe/campanhas" className="hover:text-foreground">
          Campanhas
        </Link>{' '}
        › Nova
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nova campanha</h1>
      <NovaCampanha etiquetas={etiquetas} nomeAdmin={sessao.nome} />
    </>
  )
}
