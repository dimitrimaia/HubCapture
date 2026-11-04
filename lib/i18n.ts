import { SITE_URL } from './site'

/**
 * Idiomas do site público. O português fica na raiz (endereços que já ranqueiam no Google não mudam);
 * inglês em /en e espanhol em /es. O painel /equipe continua só em português.
 */
export type Idioma = 'pt' | 'en' | 'es'

export const IDIOMAS: { id: Idioma; rotulo: string; nome: string; hreflang: string; og: string }[] = [
  { id: 'en', rotulo: 'EN', nome: 'English', hreflang: 'en', og: 'en_US' },
  { id: 'es', rotulo: 'ES', nome: 'Español', hreflang: 'es', og: 'es_ES' },
  { id: 'pt', rotulo: 'PT', nome: 'Português', hreflang: 'pt-BR', og: 'pt_BR' },
]

/** Cada página que existe nos 3 idiomas, com o endereço em cada um. */
export const PAGINAS_TRADUZIDAS = {
  inicio: { pt: '/', en: '/en', es: '/es' },
  convide: { pt: '/convide-e-ganhe', en: '/en/invite-and-earn', es: '/es/invita-y-gana' },
  hubRobotics: { pt: '/hub-robotics', en: '/en/hub-robotics', es: '/es/hub-robotics' },
} as const satisfies Record<string, Record<Idioma, string>>

export type PaginaTraduzida = keyof typeof PAGINAS_TRADUZIDAS

export function idiomaDoCaminho(caminho: string): Idioma {
  if (caminho === '/en' || caminho.startsWith('/en/')) return 'en'
  if (caminho === '/es' || caminho.startsWith('/es/')) return 'es'
  return 'pt'
}

/** A mesma página no outro idioma; sem tradução, a página inicial daquele idioma. */
export function caminhoEquivalente(caminho: string, destino: Idioma) {
  const atual = idiomaDoCaminho(caminho)
  const pagina = Object.values(PAGINAS_TRADUZIDAS).find((p) => p[atual] === caminho)
  return pagina ? pagina[destino] : PAGINAS_TRADUZIDAS.inicio[destino]
}

/**
 * Metadados de idioma para o Google (hreflang): diz quais endereços são a mesma página em outros
 * idiomas. x-default é a versão em português (público principal).
 */
export function alternatesIdiomas(pagina: PaginaTraduzida, idioma: Idioma) {
  const p = PAGINAS_TRADUZIDAS[pagina]
  return {
    canonical: p[idioma],
    languages: { 'pt-BR': p.pt, en: p.en, es: p.es, 'x-default': p.pt },
  }
}

/** Mesma lista, com URL completa, para o sitemap. */
export function idiomasSitemap(pagina: PaginaTraduzida) {
  const p = PAGINAS_TRADUZIDAS[pagina]
  return { languages: { 'pt-BR': `${SITE_URL}${p.pt}`, en: `${SITE_URL}${p.en}`, es: `${SITE_URL}${p.es}` } }
}

/** Metadados completos de uma página traduzida (título, descrição, canonical, hreflang, Open Graph). */
export function metadadosIdioma(pagina: PaginaTraduzida, idioma: Idioma, title: string, description: string) {
  const og = IDIOMAS.find((i) => i.id === idioma)!.og
  return {
    title: { absolute: title },
    description,
    alternates: alternatesIdiomas(pagina, idioma),
    openGraph: {
      type: 'website' as const,
      title,
      description,
      url: PAGINAS_TRADUZIDAS[pagina][idioma],
      locale: og,
      alternateLocale: IDIOMAS.filter((i) => i.id !== idioma).map((i) => i.og),
    },
    twitter: { title, description },
  }
}
