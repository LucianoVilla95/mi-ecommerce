import { ImageResponse } from 'next/og'
import { Product } from '../types'

export const runtime = 'edge' 
export const alt = 'Detalle del Producto'
export const size = { width: 1200, height: 630 } 
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const BACKEND_API_URL = process.env.BACKEND_API_URL;
  let product: Product | undefined;

  try {
    const res = await fetch(`${BACKEND_API_URL}/products/${slug}`)
    if (res.ok) {
      product = await res.json();
      return product;
    }
  } catch (error) {
    console.error("Error al traer datos para la imagen OG:", error)
  }

  return new ImageResponse(
    (
      <div tw="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-600 text-white font-sans p-8">
        
        <h1 tw="text-6xl font-bold text-center tracking-tight drop-shadow-md">
          {product?.name}
        </h1>
        
        <p tw="text-4xl mt-6 text-blue-200 font-medium bg-blue-950/40 px-6 py-3 rounded-full border border-blue-400/20">
          ¡Compralo ahora por solo ${product?.price}!
        </p>
        
      </div>
    ),
    { ...size }
  )
}
