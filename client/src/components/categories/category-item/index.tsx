import { JSX } from 'react';
import { CategoryProps } from './types';
import Image from 'next/image';

const CategoryItem = ({name, imgUrl}: CategoryProps): JSX.Element => {
  return (
    <div className="flex flex-col items-center min-w-18">
      <div className="relative w-16 h-16 rounded-full bg-neutral-600 flex items-center justify-center text-sm font-medium overflow-hidden">
        <Image src={imgUrl.replace("/upload/","/upload/e_background_removal,b_rgb:a3a3a3/")} alt="Imagen" fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover rounded-xl" priority />
      </div>
      <span className="text-sm mt-2">{name}</span>
    </div>
  )
};

export default CategoryItem;