'use client';

import { JSX, useState } from 'react';
import { Menu } from 'lucide-react';
import MobileMenu from './mobile-menu';
import { MenuButtonProps } from './types';

const MenuButton = ({isLoggedIn}: MenuButtonProps): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <>
      <button onClick={() => setIsMenuOpen(true)} className="md:hidden">
        <Menu className="w-7 h-7"/>
      </button>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isLoggedIn={isLoggedIn} />
    </>
  )
};

export default MenuButton;