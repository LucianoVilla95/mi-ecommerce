'use client';
import { JSX } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useUICartStore } from '@/stores/uicart.store';

const CartButton = (): JSX.Element => {
  const openCart = useUICartStore((state) => state.openCart);

  return (
      <button onClick={openCart} className="relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:scale-105">
        <ShoppingCart className="w-6 h-6"/>
      </button>
  )
};

export default CartButton;