import type { Metadata } from 'next'
import { IntlHome } from '@/components/intl/intl-home'
import { metadadosIdioma } from '@/lib/i18n'
import { TEXTOS_INTL } from '@/lib/textos-intl'

const { title, description } = TEXTOS_INTL.en.home

export const metadata: Metadata = metadadosIdioma('inicio', 'en', title, description)

export default function HomeEn() {
  return <IntlHome idioma="en" />
}
