// From the 'Adapters' Section on Docs. Adapters act as the glue between the host system and my tRPC API.

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}), // Don't need the 3 '...'; additional stuff
  });

export { handler as GET, handler as POST };