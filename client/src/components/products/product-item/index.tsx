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
    <div>
      <div className="bg-gray-200 rounded-2xl p-4 h-56 relative overflow-hidden grid place-items-center">
        <button onClick={handleClickCart} disabled={cartRepeated || cartRepeatedDb} className={`absolute p-2 top-4 right-4 z-10 cursor-pointer text-gray-900 rounded-sm transition-all duration-200 focus:bg-gray-400 focus:border focus:border-gray-900 ${cartRepeated || cartRepeatedDb ? 'bg-green-500 text-white cursor-not-allowed' : 'text-gray-900 cursor-pointer focus:bg-gray-400 focus:border focus:border-gray-900 hover:bg-gray-300'}`}>
          {
            cartRepeated || cartRepeatedDb ? <Check className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />
          }
        </button>
        <Image src={imgUrl.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} width={100} height={100} className="w-40 h-44 rounded-xl object-cover" alt="Imagen" priority/>
      </div>
      <h4 className="mt-4 font-medium text-center">{name}</h4>
      <p className="mt-2 font-bold text-center">{price}</p>
    </div>
  )
};

export default ProductItem;