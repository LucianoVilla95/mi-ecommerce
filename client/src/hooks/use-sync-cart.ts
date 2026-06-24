import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mergeCart } from "@/services/cart-service";
import { useCartStore } from "@/stores/cart.store";
import { queryKeys } from "@/services/types";

export const useSyncCart = () => {
  const queryClient = useQueryClient();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: () => {
      const cleanItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      return mergeCart(cleanItems);
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({queryKey: queryKeys.cart});
    },

    onError: (error: any) => {
      console.error("Error crítico al sincronizar el carrito:", error.message || error);
    }
  });
};