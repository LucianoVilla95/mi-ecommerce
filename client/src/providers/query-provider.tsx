"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
        // queryCache: new QueryCache({
        //   onError: (error: any) => {
        //     if (error.message?.includes("401") || error.status === 401) {
        //       console.warn("Token expirado detectado en Query. Limpiando sesión...");
        //     }
        //   },
        // }),
        // mutationCache: new MutationCache({
        //   onError: (error: any) => {
        //     if (error.message?.includes("401") || error.status === 401) {
        //       console.warn("Acción no autorizada en Mutation. Token inválido.");
        //     }
        //   },
        // }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}