"use client"; // Making this component client side instead of server side

import { Children, PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { httpBatchLink } from "@trpc/client";
import { absoluteUrl } from "@/lib/utils";

// Destructing the 'children' with ': PropsWithChildren' can also be done with ': {children: ReactNode}'

// tRPC is a thin typesafe wrapper around React query
const Providers = ({ children }: PropsWithChildren) => {
  // Reason for using "useState" in the creation of the "queryClient" and the "trpcClient", as opposed to declaring them outside of the component, is to ensure that each request gets a unique client when using SSR. If you use client side rendering then you can move them if you wish.
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // Will need to be changed to "absoluteUrl("/api/trpc")"
          // url: "http://localhost:3000/api/trpc",
          url: absoluteUrl("/api/trpc")
        }),
      ],
    })
  );
  return (
    // Wrapping the entire app and rendering it here. QueryClientProvider is another tool for react query.
    // Add '<QueryClientProvider></QueryClientProvider>' wrapper if you want to use React Query independently of tRPC. Both can be used independently.
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
