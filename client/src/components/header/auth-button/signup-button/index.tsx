import { JSX } from 'react';
import Link from 'next/link';

const SignupButton = (): JSX.Element => {
  return (
    <Link href="/auth/signup">
      <button className="bg-black text-white px-5 h-12 rounded-xl font-medium cursor-pointer transition-colors duration-200 hover:bg-gray-700">
        Crea tu cuenta
    </button>
    </Link>
  )
}

export default SignupButton;