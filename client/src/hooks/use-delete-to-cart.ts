import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCart} from "@/services/cart-service";
import { queryKeys } from "@/services/types";

export const useRemoveCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCart(id),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.cart});
    },
  });
};