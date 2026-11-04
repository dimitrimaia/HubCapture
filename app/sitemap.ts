import type { MetadataRoute } from 'next'
import { idiomasSitemap, PAGINAS_TRADUZIDAS } from '@/lib/i18n'
import { CADASTRO_PATH, CONFIAVEL_PATH, GUIA_PATH, HUB_ROBOTICS_PATH, QUANTO_PAGA_PATH, SITE_URL, TREINAR_IA_PATH, TUTORIAIS_PATH } from '@/lib/site'

/**
 * Datas da última mudança REAL de cada página (atualize ao mudar o conteúdo).
 * Usar "agora" a cada deploy faz o Google parar de confiar na data.
 */
const ATUALIZADO = {
  home: '2026-11-03',
  guia: '2026-11-04',
  quantoPaga: '2026-11-04',
  hubRobotics: '2026-11-04',
  convide: '2026-11-04',
  idiomas: '2026-11-04',
  confiavel: '2026-10-20',
  treinarIa: '2026-11-03',
  tutoriais: '2026-10-26',
  cadastro: '2026-10-26',
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: ATUALIZADO.home, changeFrequency: 'weekly', priority: 1, alternates: idiomasSitemap('inicio') },
    { url: `${SITE_URL}${TREINAR_IA_PATH}`, lastModified: ATUALIZADO.treinarIa, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}${HUB_ROBOTICS_PATH}`, lastModified: ATUALIZADO.hubRobotics, changeFrequency: 'monthly', priority: 0.9, alternates: idiomasSitemap('hubRobotics') },
    { url: `${SITE_URL}${PAGINAS_TRADUZIDAS.convide.pt}`, lastModified: ATUALIZADO.convide, changeFrequency: 'monthly', priority: 0.9, alternates: idiomasSitemap('convide') },
    // Versões em inglês e espanhol
    ...(['en', 'es'] as const).flatMap((idioma) =>
      (['inicio', 'convide', 'hubRobotics'] as const).map((pagina) => ({
        url: `${SITE_URL}${PAGINAS_TRADUZIDAS[pagina][idioma]}`,
        lastModified: ATUALIZADO.idiomas,
        changeFrequency: 'monthly' as const,
        priority: pagina === 'inicio' ? 0.8 : 0.7,
        alternates: idiomasSitemap(pagina),
      })),
    ),
    { url: `${SITE_URL}${GUIA_PATH}`, lastModified: ATUALIZADO.guia, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}${QUANTO_PAGA_PATH}`, lastModified: ATUALIZADO.quantoPaga, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}${CONFIAVEL_PATH}`, lastModified: ATUALIZADO.confiavel, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}${TUTORIAIS_PATH}`, lastModified: ATUALIZADO.tutoriais, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}${CADASTRO_PATH}`, lastModified: ATUALIZADO.cadastro, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
