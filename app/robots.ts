import type { MetadataRoute } from 'next'

const BASE_URL = 'https://app.medescolha.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/perfil', '/criar-senha', '/esqueci-senha'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
