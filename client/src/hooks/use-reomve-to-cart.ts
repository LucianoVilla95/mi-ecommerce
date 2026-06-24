import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCart } from "@/services/cart-service";
import { CartItem, queryKeys } from "@/services/types";

export const useDecreaseCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: CartItem) => removeCart({productId, quantity}),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.cart});
    },
  });
};