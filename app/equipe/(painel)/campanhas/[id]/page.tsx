import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirSessaoPagina } from '@/lib/equipe'
import { DetalheCampanha } from './detalhe-campanha'

export const metadata: Metadata = { title: 'Campanha' }

export default async function CampanhaPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessaoPagina('admin')
  const { id } = await params
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <Link href="/equipe/campanhas" className="hover:text-foreground">
          Campanhas
        </Link>{' '}
        › Detalhe
      </p>
      <DetalheCampanha id={id} />
    </>
  )
}
