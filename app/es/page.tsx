import type { Metadata } from 'next'
import { IntlHome } from '@/components/intl/intl-home'
import { metadadosIdioma } from '@/lib/i18n'
import { TEXTOS_INTL } from '@/lib/textos-intl'

const { title, description } = TEXTOS_INTL.es.home

export const metadata: Metadata = metadadosIdioma('inicio', 'es', title, description)

export default function HomeEs() {
  return <IntlHome idioma="es" />
}
