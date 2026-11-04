import { ChevronRight, House } from 'lucide-react'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

export type ItemTrilha = { nome: string; href?: string }

/**
 * Caminho de navegação ("Hub Capture › Página") no topo das páginas internas, com a marcação
 * BreadcrumbList que o Google usa para mostrar o caminho no resultado da busca.
 * O primeiro item é sempre a página inicial do idioma; o último é a página atual (sem link).
 */
export function Trilha({ itens, rotulo = 'Você está em', className }: { itens: ItemTrilha[]; rotulo?: string; className?: string }) {
  const dados = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      ...(item.href ? { item: `${SITE_URL}${item.href === '/' ? '' : item.href}` } : {}),
    })),
  }
  return (
    <nav aria-label={rotulo} className={className ?? 'mb-6'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, '\\u003c') }} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {itens.map((item, i) => (
          <li key={item.nome} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />}
            {item.href && i < itens.length - 1 ? (
              <Link href={item.href} className="inline-flex items-center gap-1 rounded transition-colors hover:text-foreground">
                {i === 0 && <House className="size-3.5" aria-hidden="true" />}
                {item.nome}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.nome}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
