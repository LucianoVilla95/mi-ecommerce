import { JSX, useState } from 'react';
import Image from "next/image";
import type { CartItem } from '../../stores/types'
import { useCartStore } from "@/stores/cart.store";
import { Trash2 } from "lucide-react";
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { useDecreaseCart } from '@/hooks/use-reomve-to-cart';
import { useRemoveCart } from '@/hooks/use-delete-to-cart';

const CartItem = ({productId, orderDetailId , name, price, image, quantity, description, isAuthenticated, stock}: CartItem): JSX.Element => {
  const increment = useCartStore(state => state.increaseQuantity);
  const decrement = useCartStore(state => state.decreaseQuantity);
  const remove = useCartStore(state => state.removeItem);
  const { mutate: handleAddToCart } = useAddToCart();
  const { mutate: handleDecreaseCart } = useDecreaseCart();
  const { mutate: handleRemoveCart } = useRemoveCart();
  const [stockError, setStockError] = useState<string | null>(null);

  const isLimitReached: boolean = quantity >= stock!;

    const limit = isLimitReached 
    ? `Has alcanzado el máximo disponible (${stock})` 
    : stockError;

  const handleIncrease = () => {
    setStockError(null);
    if (isAuthenticated) {
      handleAddToCart({ productId, quantity: 1 },
        {
          onError: (error: any) => {
            setStockError(error.message || "Stock insuficiente");
          }
        }
      );
    } else {
      increment(productId);
    }
  };

  const handleDecrease = () => {
    setStockError(null);
    if (isAuthenticated) {
      if ( quantity > 1) {
        handleDecreaseCart({ productId, quantity: quantity - 1 });
      }
    } else {
      decrement(productId);
    }
  };

  const handleRemove = () => {
    if (isAuthenticated && orderDetailId) {
      handleRemoveCart(orderDetailId);
    } else {
      remove(productId);
    }
  };

  return (
    <article className="flex gap-4">
      <Image src={image.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} alt="Producto" width={90} height={90} className="rounded-xl object-cover" />

      <div className="flex-1">
        <h3 className="font-medium">
          {name}
        </h3>

        <p className="text-sm text-neutral-500">
          {description}
        </p>

        <p className="text-sm text-neutral-500">
          Stock: {stock}
        </p>
        
        {limit && (
        <p className="text-xs text-red-500 font-medium mt-1 bg-red-50 p-1.5 rounded-md border border-red-200">
          {limit}
        </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <button onClick={handleDecrease} className="px-3 py-1 cursor-pointer">
              -
            </button>
            
            <span className="px-3">
              {quantity}
            </span>

            <button onClick={handleIncrease} disabled={isLimitReached} className="px-3 py-1 cursor-pointer">
              +
            </button>
          </div>

          <p className="font-semibold">
            {price}
          </p>
          <button onClick={handleRemove} className="p-1.5 cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:rounded-lg">
            <Trash2 />
          </button>
        </div>
      </div>
    </article>
  );
}

export default CartItem;