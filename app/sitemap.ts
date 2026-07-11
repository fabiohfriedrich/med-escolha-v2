import type { MetadataRoute } from 'next'
import descriptionsData from '@/data/descriptions.json'
import guiasData from '@/data/guias_especialidades.json'

const BASE_URL = 'https://app.medescolha.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const especialidades = (descriptionsData as any).specialties as Array<{ id: number }>
  const guias = (guiasData as any).especialidades as Array<{ slug: string }>

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/quiz-rapido`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/especialidades`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/guias`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/comparar`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/ebooks`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const especialidadeRoutes: MetadataRoute.Sitemap = especialidades.map((e) => ({
    url: `${BASE_URL}/especialidades/${e.id}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const guiaRoutes: MetadataRoute.Sitemap = guias.map((g) => ({
    url: `${BASE_URL}/guias/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...especialidadeRoutes, ...guiaRoutes]
}
