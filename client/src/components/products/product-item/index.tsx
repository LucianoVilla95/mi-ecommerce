'use client';
import { JSX } from 'react';
import { ProductProps } from './types';
import { ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart.store';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { useCart } from '@/hooks/use-cart';

const ProductItem = ({productId, name, imgUrl, price, description, isAuthenticated}: ProductProps): JSX.Element => {
  const addItem = useCartStore((state) => state.addItem);
  const { mutate: handleAddToCart } = useAddToCart();
  const items = useCartStore(state => state.items);
  const { data } = useCart(isAuthenticated);

  const cartRepeated = items.some((item) => item.productId === productId);
  const cartRepeatedDb = data?.details.some(i => i.product.id === productId);

  const handleClickCart = (): void => {
    if (cartRepeated || cartRepeatedDb) return;

    if (isAuthenticated) {
      handleAddToCart({productId, quantity: 1});
    } else {
      addItem({productId, name, image: imgUrl, price: Number(price), description});
    }
  }

  return (
    <div className="flex flex-col place-items-center">
      <div className="w-60 border rounded-2xl p-4 h-56 relative">
        <button onClick={handleClickCart} disabled={cartRepeated || cartRepeatedDb} className={`absolute w-8 h-8 top-3 right-1 z-10 cursor-pointer text-gray-900 rounded-sm transition-all duration-200 focus:bg-gray-400 focus:border focus:border-gray-900 ${cartRepeated || cartRepeatedDb ? 'bg-green-500 text-white cursor-not-allowed' : 'text-gray-900 cursor-pointer focus:bg-gray-400 focus:border focus:border-gray-900 hover:bg-gray-300'}`}>
          {
            cartRepeated || cartRepeatedDb ? <Check className="w-4 h-4 mx-auto" /> : <ShoppingCart className="w-6 h-6 mx-auto" />
          }
        </button>
        <Image src={imgUrl.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} width={100} height={100} className="w-40 h-44 mx-auto rounded-xl object-cover" alt="Imagen" priority/>
      </div>
      <h4 className="mt-4 font-medium text-center">{name}</h4>
      <p className="mt-2 font-bold text-center">{price}</p>
    </div>
  )
};

export default ProductItem;