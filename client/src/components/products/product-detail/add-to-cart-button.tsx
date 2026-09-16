'use client';

import { useCartStore } from '@/stores/cart.store';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { useCart } from '@/hooks/use-cart';
import { Check } from 'lucide-react';
import { AddToCartButtonProps } from './types';

export default function AddToCartButton({ product, isAuthenticated }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { mutate: handleAddToCart } = useAddToCart();
  const items = useCartStore((state) => state.items);
  const { data: dataCart } = useCart(isAuthenticated);

  const cartRepeated = items.some((item) => item.productId === product.id);
  const cartRepeatedDb = dataCart?.details.some((i) => i.product.id === product.id);
  const isDisabled = cartRepeated || cartRepeatedDb;

  const handleClickCart = (): void => {
    if (isDisabled) return;

    if (isAuthenticated) {
      handleAddToCart({ productId: product.id, quantity: 1 });
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        image: product.imgUrl,
        price: Number(product.price),
        description: product.description,
      });
    }
  };

  return (
    <button
      onClick={handleClickCart}
      disabled={isDisabled}
      className={`flex w-full items-center justify-center rounded-lg bg-black px-8 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-900 transition-colors uppercase tracking-wide ${
        isDisabled
          ? 'bg-green-500 text-white cursor-not-allowed hover:bg-green-500'
          : 'text-gray-900 cursor-pointer focus:bg-gray-400 focus:border focus:border-gray-900 hover:bg-gray-300'
      }`}
    >
      {isDisabled ? (
        <Check className="w-4 h-4 mx-auto" />
      ) : <p>Añadir al Carrito</p>}
    </button>
  );
}
