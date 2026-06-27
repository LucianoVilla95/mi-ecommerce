import { JSX } from 'react';
import Link from 'next/link';

const SuccessPage = (): JSX.Element => {
  return (
    <div className="p-10 text-center">
      <h1>¡Muchas gracias por tu compra! 🎉</h1>
      <p>Tu pago ha sido procesado con éxito y estamos preparando tu pedido.</p>
      <div className="mt-5">
        <Link href="/" className="px-5 py-2.5 bg-[#00a650] text-white rounded-[5px] no-underline">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default SuccessPage;
