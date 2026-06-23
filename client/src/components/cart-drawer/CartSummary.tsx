import { JSX, useState } from 'react'
import { useCartStore } from "@/stores/cart.store";
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';

const postCheckout = async () => {
  const response = await fetch('http://localhost:3001/orders/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al realizar la compra');
  }

  return data;
}

const CartSummary = ({isAuthenticated}: {isAuthenticated: boolean}): JSX.Element => {
  const subTotal = useCartStore(state => state.subtotal());
  const { data } = useCart(isAuthenticated);
  const total: number = data?.total || 0;
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const totalAmount = isAuthenticated ? total : subTotal;

  const handleClickBuy = async (): Promise<void> => {
    if (!isAuthenticated) return router.push('/auth/signin'); 

    setIsProcessing(true);
    try {
      const res = await postCheckout(); 
    
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    
    } catch (error) {
      console.error("Error en el checkout:", error);
      alert(error instanceof Error ? error.message : 'Hubo un problema al procesar tu compra');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <footer className="border-t p-6 space-y-5 bg-white">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{totalAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>{Number(totalAmount).toFixed(2)}</span>
      </div>

      <button onClick={handleClickBuy} disabled={isProcessing} className="w-full h-12 rounded-xl bg-black text-white font-medium hover:bg-neutral-800 transition cursor-pointer">
        {
        isProcessing ? 'Procesando...' : 'Finalizar Compra'
        }  
      </button>
    </footer>
  );
}

export default CartSummary;