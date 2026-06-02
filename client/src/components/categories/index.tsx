import { JSX } from 'react';
import CategoryList from './category-list';

const Categories = (): JSX.Element => {
  return (
    <section className="px-5 py-2">
      <CategoryList />
    </section>
  )
}

export default Categories;