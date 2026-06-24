import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postCart } from "@/services/cart-service";
import { queryKeys } from "@/services/types";
import { CartItem } from "@/services/types";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: CartItem ) => postCart({productId, quantity}),

    retry: false,

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.cart});
    },

    onError: (error: Error) => {
      const serverMessage = error.message || "Insuficiente stock";
      console.warn("Error controlado del backend:", serverMessage);
    }
  });
};