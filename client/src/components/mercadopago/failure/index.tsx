import { JSX } from 'react';
import Link from 'next/link';

const FailurePage = (): JSX.Element => {
  return (
    <div className="p-10 text-center">
      <h1>¡Ups! Hubo un problema con tu pago ❌</h1>
      <p>No pudimos procesar la transacción. Por favor, intenta nuevamente con otro medio de pago.</p>
      <div className="mt-5">
        <Link href="/" className="px-5 py-2.5 bg-[#009ee3] text-white rounded-[5px] no-underline">
          Volver al Carrito
        </Link>
      </div>
    </div>
  );
}

export default FailurePage;
