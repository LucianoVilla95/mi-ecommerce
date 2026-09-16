import { JSX } from 'react';
import { Metadata } from 'next'
import Image from 'next/image'
import type { Props } from './types';
import { Product } from '../types';
import { cookies } from 'next/headers';
import AddToCartButton from './add-to-cart-button';

const getApiUrl = (): string => process.env.BACKEND_API_URL || '';

export const fetchProduct = async (slug: string): Promise<Product> => {
  
  const response = await fetch(`${getApiUrl()}/products/${slug}`);
  const result = await response.json();
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProduct(slug);
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.imgUrl],
      },
    }
  } catch {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscás no existe.'
    }
  }
}

export default async function ProductDetailPage({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params
  const cookieStore = await cookies();
  const isAuthenticated: boolean = cookieStore.has('access_token');

  const data = await fetchProduct(slug);

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500 col-span-full">
        {`No se encontraron productos para "${slug}"`}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-8">
              <Image src={data.imgUrl.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} width={100} height={100} className="w-full h-full mx-auto rounded-xl object-cover" alt="Imagen" priority />
            </div>
          </div>
          <div className="flex flex-col justify-center lg:max-w-lg">
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {data.name}
                </h1>
                <p className="mt-3 text-3xl font-medium tracking-tight text-gray-900">
                  ${data.price}
                </p>
              </div>
            </div>
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Descripción
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                {data.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-x-2 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 5.25h12.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H3.5A1.125 1.125 0 0 1 2.375 16.125v-9.75C2.375 5.874 2.879 5.25 3.5 5.25Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h3.375c.621 0 1.125.504 1.125 1.125v3.5m0 0H16.5m3.75 0 1.173 1.611a1.124 1.124 0 0 1 .177.597V15.75m-4.25-3.25V16.5" />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                Envío gratis en compras mayores a $50
              </span>
            </div>
            <div className="mt-8">
              <AddToCartButton product={data} isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
