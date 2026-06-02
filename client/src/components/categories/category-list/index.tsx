import { JSX } from 'react';
import CategoryItem from '../category-item';
import { Category } from './types';

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("http://localhost:3001/categories", {
    next: { revalidate: 300 } 
  });
  const categories: Category[] = await response.json();
  return categories;
};


const CategoryList = async (): Promise<JSX.Element> => {
  const fetchData: Category[] = await fetchCategories();

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-1">
      {
        fetchData.map((item) => (
        <CategoryItem key={item.id} name={item.name} imgUrl={item.imgUrl} />
      ))
      }
    </div>
  )
}

export default CategoryList;