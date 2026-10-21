import type { MetadataRoute } from 'next'
import { CADASTRO_PATH, CONFIAVEL_PATH, GUIA_PATH, QUANTO_PAGA_PATH, SITE_URL, TUTORIAIS_PATH } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}${GUIA_PATH}`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${QUANTO_PAGA_PATH}`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${CONFIAVEL_PATH}`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${TUTORIAIS_PATH}`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}${CADASTRO_PATH}`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
