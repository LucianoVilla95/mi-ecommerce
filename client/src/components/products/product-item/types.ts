export interface ProductProps {
  productId: string;
  name: string;
  imgUrl: string;
  price: string;
  description: string;
  isAuthenticated?: boolean;
}