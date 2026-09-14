import { Category } from "../categories/category-list/types";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imgUrl: string;
  imgPublicId: string;
  slug: string;
  isActive: boolean;
  category: Category;
  orderDetails: [];
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number,
  currentPage: number,
  lastPage: number
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ProductsProps {
  isAuthenticated: boolean;
  searchQuery: string;
  currentPage: number;
}