import { JSX } from 'react';
import { PaginationResult, Product, ProductsProps } from './types';
import ProductItem from './product-item';
import Pagination from '../pagination';

export const fetchProducts = async (page = 1): Promise<PaginationResult<Product>> => {
  const response = await fetch(`http://localhost:3001/products?page=${page}&limit=10`, {
    next: { revalidate: 60 }
  });
  const results: PaginationResult<Product>= await response.json();
  return results;
}

export const fetchSearchResults = async (name: string, page = 1) => {
  const response = await fetch(`http://localhost:3001/products/search?name=${encodeURIComponent(name)}&page=${page}&limit=10`, {
    cache: 'no-store'
  });
  return await response.json();
}

const Products = async ({isAuthenticated, searchParams}: ProductsProps): Promise<JSX.Element> => {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.search || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  let fetchData: PaginationResult<Product>;

  if (searchQuery.trim() !== '') {
    fetchData = await fetchSearchResults(searchQuery, currentPage);
  } else {
    fetchData = await fetchProducts(currentPage); // Pasamos la página correspondiente al catálogo común
  }

  if (!fetchData.data || fetchData.data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 col-span-full">
        No se encontraron productos para "{searchQuery}"
      </div>
    );
  }

  const totalPages = fetchData.meta?.lastPage || 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-2 gap-5 p-4 md:grid-cols-3 lg:grid-cols-4">
        {
          fetchData.data.map((item) => (
            <ProductItem key={item.id} productId={item.id} name={item.name} imgUrl={item.imgUrl} price={item.price} description={item.description} isAuthenticated={isAuthenticated} />
          ))
        }
      </div>
      <div className="mt-auto">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  )
};

export default Products;