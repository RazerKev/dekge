"use client"; // Making this component client side instead of server side

import { Children, PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { httpBatchLink } from "@trpc/client";

// Destructing the 'children' with ': PropsWithChildren' can also be done with ': {children: ReactNode}'

// trpc is a thin typesafe wrapper around React query
const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    })
  );
  return (
    // Wrapping the entire app and rendering it here. QueryClientProvider is another tool for react query.
    // Add '<QueryClientProvider></QueryClientProvider>' wrapper if you want to use React Query independently of TRPC. Both can be used independently.
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
