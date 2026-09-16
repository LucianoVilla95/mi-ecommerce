import { Product } from '../types';

export type Props = {
  params: Promise<{ slug: string }>
}

export interface AddToCartButtonProps {
  product: Product;
  isAuthenticated: boolean;
}