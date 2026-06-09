import { JSX } from 'react';
import { ProductProps } from './types';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const ProductItem = ({name, imgUrl, price}: ProductProps): JSX.Element => {
  return (
    <div>
      <div className="bg-neutral-100 rounded-2xl p-4 h-48 relative overflow-hidden">
        <button className="absolute top-2 right-2 z-10">
          <ShoppingCart className="w-5 h-5 text-amber-100" />
        </button>
        <Image src={imgUrl.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} fill sizes="(max-width: 768px) 100vw, 448px" className="w-full h-44 object-cover" alt="Imagen" priority/>
      </div>
      <h4 className="mt-4 font-medium">{name}</h4>
      <p className="mt-2 font-bold">{price}</p>
    </div>
  )
};

export default ProductItem;