import { JSX } from 'react';
import Link from 'next/link';

const Logo = (): JSX.Element => {
  return (
    <Link href="/">
      <h1 className="text-2xl cursor-pointer font-bold tracking-tight sm:text-3xl">
        AVORA
      </h1>
    </Link>
  )
};

export default Logo;