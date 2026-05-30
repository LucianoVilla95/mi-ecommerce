import { JSX } from 'react';
import MenuButton from './mobile-menu-button';
import Logo from './logo';
import CartButton from './cart-button';

const Header = (): JSX.Element => {
  return (
    <header className="px-5 h-16 flex items-center justify-between">
      <MenuButton />
      <Logo />      
      <CartButton />
    </header>
  )
};

export default Header;