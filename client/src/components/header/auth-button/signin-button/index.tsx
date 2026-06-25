import { JSX } from 'react';
import Link from 'next/link';

const SigninButton = (): JSX.Element => {
  return (
    <Link href="/auth/signin">
      <button className="px-4 py-2 rounded-lg border border-transparent transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 cursor-pointer">
        Iniciar sesión
    </button>
    </Link>
  )
}

export default SigninButton;