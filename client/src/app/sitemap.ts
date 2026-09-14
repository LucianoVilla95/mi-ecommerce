import { PaginationResult, Product } from '@/components/products/types';
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.BASE_URL;
  const BACKEND_API_URL = process.env.BACKEND_API_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]

  const allProducts: Product[] = []
  let page = 1
  let lastPage = 1
  const limit = 10

  try {
    do {
      const res = await fetch(`${BACKEND_API_URL}/products?page=${page}&limit=${limit}`, {
        next: { revalidate: 3600 }
      })

      if (!res.ok) {
        throw new Error(`Error HTTP en página ${page}: ${res.status}`)
      }

      const result: PaginationResult<Product>= await res.json()

      if (result.data && result.data.length > 0) {
        allProducts.push(...result.data)
      }

      lastPage = result.meta.lastPage
      page++

    } while (page <= lastPage)

  } catch (error) {
    console.error("Error conectando al backend para generar el sitemap:", error)
  }

  const productRoutes: MetadataRoute.Sitemap = allProducts.map((prod) => ({
    url: `${BASE_URL}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
