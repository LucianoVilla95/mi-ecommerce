import { JSX } from 'react';
import { MobileMenuProps } from './types';
import AcountButton from './acount-button';
import LoginOutButton from './login-out-button';
import CloseButton from './close-button';

const MobileMenu = ({isOpen, onClose}: MobileMenuProps): JSX.Element => {
  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />
      <aside className={`fixed top-0 left-0 h-screen w-[85%] max-w-sm bg-white z-50 rounded-r-3xl p-6 transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">
            Menú
          </h2>
        <CloseButton onClose={onClose} />
        </div>
        <nav className="flex flex-col gap-6">
          <AcountButton />
        </nav>
        <LoginOutButton />
      </aside>
    </>
  )
};

export default MobileMenu;