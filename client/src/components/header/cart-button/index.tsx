import { JSX } from 'react';
import { ShoppingCart } from 'lucide-react';

const CartButton = (): JSX.Element => {
  return (
    <button className="relative">
      <ShoppingCart className="w-6 h-6"/>
      <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        2
      </span>
    </button>
  )
};

export default CartButton;