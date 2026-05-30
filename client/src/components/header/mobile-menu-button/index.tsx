'use client';

import { JSX, useState } from 'react';
import { Menu } from 'lucide-react';
import MobileMenu from './mobile-menu';

const MenuButton = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsMenuOpen(true)}>
        <Menu className="w-7 h-7"/>
      </button>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
};

export default MenuButton;