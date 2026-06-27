import { JSX } from 'react';
import Link from 'next/link';

const PendingPage = (): JSX.Element => {
  return (
    <div className="p-10 text-center">
      <h1>Tu pago está pendiente de aprobación ⏳</h1>
      <p>Si pagaste en efectivo, puede demorar hasta 24-48 horas hábiles en acreditarse.</p>
      <div className="mt-5">
        <Link href="/" className="px-5 py-2.5 bg-[#666] text-white rounded-[5px] no-underline">
          Ir a mi cuenta
        </Link>
      </div>
    </div>
  );
}

export default PendingPage;
