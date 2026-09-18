import { JSX } from 'react';
import CategoryItem from '../category-item';
import { Category } from './types';

const getApiUrl = () => process.env.BACKEND_API_URL;

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${getApiUrl()}/categories`, {
    next: { revalidate: 3600 } 
  });
  const categories: Category[] = await response.json();
  return categories;
};


const CategoryList = async (): Promise<JSX.Element> => {
  const fetchData: Category[] = await fetchCategories();

  return (
    <div className="flex justify-around gap-4 overflow-x-auto no-scrollbar px-1 sm:justify-center">
      {
        fetchData.map((item) => (
        <CategoryItem key={item.id} name={item.name} imgUrl={item.imgUrl} />
      ))
      }
    </div>
  )
}

export default CategoryList;