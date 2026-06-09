import { JSX } from 'react';
import { PaginationResult, Product } from './types';
import ProductItem from './product-item';

export const fetchProducts = async (): Promise<PaginationResult<Product>> => {
  const response = await fetch('http://localhost:3001/products', {
    next: { revalidate: 300 }
  });
  const results: PaginationResult<Product>= await response.json();
  return results;
}

const Products = async (): Promise<JSX.Element> => {
  const fetchData: PaginationResult<Product> = await fetchProducts();

  return (
    <div className="grid grid-cols-2 gap-5 p-4">
      {
        fetchData.data.map((item) => (
          <ProductItem key={item.id} name={item.name} imgUrl={item.imgUrl} price={item.price} />
        ))
      }
    </div>
  )
};

export default Products;