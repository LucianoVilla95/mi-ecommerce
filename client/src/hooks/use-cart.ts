import { useQuery } from "@tanstack/react-query";
import { getCart } from '../services/cart-service';
import { queryKeys, GetCart, Details } from "@/services/types";

export const useCart = (isAuthenticated: boolean = false) => {
  return useQuery<GetCart<Details>>({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
    retry: false,                   // No reintentar si da error 401
    refetchOnWindowFocus: false,    // No revalidar al hacer clic en la ventana
    refetchOnReconnect: false,      // No revalidar al recuperar internet
    refetchOnMount: false,          // No revalidar cada vez que el componente se monta
  });
};