import { JSX, Suspense } from 'react';
import Logo from './logo';
import CartButton from './cart-button';
import { cookies } from 'next/headers'; 
import SearchBar from './search-bar';
import AuthButton from './auth-button';
import LogoutButton from './auth-button/logout-button';
import MenuButton from './mobile-menu-button';

const Header = async (): Promise<JSX.Element> => {
  const cookieStore = await cookies();
  const isAuthenticated: boolean = cookieStore.has('access_token');

  return (
    <header className="max-w-7xl mx-auto px-5 h-16 border-b flex items-center justify-between gap-4" >
      <MenuButton isLoggedIn={isAuthenticated} />
      <Logo />
      <div className="hidden sm:block flex-1 max-w-lg">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      {
        isAuthenticated ? <div className="hidden md:inline-block"><LogoutButton /></div> : <AuthButton /> 
      }
      <CartButton />
    </header>
  )
};

export default Header;