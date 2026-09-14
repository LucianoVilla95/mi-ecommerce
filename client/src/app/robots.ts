import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.BASE_URL;

  if (!SITE_URL) {
    console.error("Error: Falta configurar la variable de entorno BASE_URL en el archivo .env")
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      }
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',    
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
