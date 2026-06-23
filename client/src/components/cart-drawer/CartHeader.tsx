import { useCartStore } from "@/stores/cart.store";
import { JSX } from 'react';
import { useCart } from "@/hooks/use-cart";

const CartHeader = ({isAuthenticated}: {isAuthenticated: boolean}): JSX.Element => {
  const totalItems = useCartStore((state) => state.totalItems());
  const { data } = useCart(isAuthenticated);
  const total: number = data?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const totalProducts: number = isAuthenticated ? total : totalItems;

  return (
    <header className="h-20 border-b px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Tu carrito
        </h2>
        <p className="text-sm text-neutral-500">
          {totalProducts} productos
        </p>
      </div>
    </header>
  );
}

export default CartHeader;