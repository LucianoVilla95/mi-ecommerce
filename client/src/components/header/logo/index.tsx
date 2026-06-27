import { JSX } from 'react';
import Link from 'next/link';

const Logo = (): JSX.Element => {
  return (
    <Link href="/">
      <h1 className="text-3xl font-bold tracking-tight cursor-pointer">
        AVORA
      </h1>
    </Link>
  )
};

export default Logo;