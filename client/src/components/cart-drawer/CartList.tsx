import { JSX } from 'react';
import CartItem from "./CartItem";
import { useCartStore } from "@/stores/cart.store";
import { useCart } from '@/hooks/use-cart';
import { CartItem as CartProduct } from '@/stores/types';
import Loading from '../loading';

const CartList = ({isAuthenticated}: {isAuthenticated: boolean}): JSX.Element => {
  const items: CartProduct[] = useCartStore(state => state.items);
  const { data, isLoading } = useCart(isAuthenticated);
  const cartItems: CartProduct[] = data?.details?.map((item) => ({
    productId: item.product.id,
    orderDetailId: item.id,
    name: item.product.name,
    price: Number(item.product.price),
    image: item.product.imgUrl,
    quantity: item.quantity,
    description: item.product.description,
    stock: item.product.stock
  })) ?? [];;

  if (isAuthenticated && isLoading) {
    return <Loading />;
  }
  const result: CartProduct[] = isAuthenticated ? cartItems : items;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      {
        result.map((product) => (<CartItem key={product.productId} productId={product.productId} orderDetailId={product.orderDetailId} name={product.name} price={product.price} image={product.image} quantity={product.quantity} description={product.description} isAuthenticated={isAuthenticated} stock={product.stock} />))
      }             
    </div>
  );
}

export default CartList;