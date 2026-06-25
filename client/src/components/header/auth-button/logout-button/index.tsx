'use client'
import { JSX } from 'react';
import { logoutAction } from './actions';

const LogoutButton = (): JSX.Element => {

  return (
    <button onClick={async () => await logoutAction()} className="bg-neutral-200 rounded-lg px-4 py-2 border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-300 hover:border-gray-400">
      Cerrar Sesión
    </button>
  )
};

export default LogoutButton;