// From the Quickstart guide. Instead of creating router instance in 'server/trpc.ts' and 'server/index.ts', it's instead in 'trpc' folder so 'trpc/trpc.ts' and 'trpc/index.ts'

import { authMiddleware, getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

// NEW CODE ADDED - AUTH Procedure for people signed in
const middleware = t.middleware;
const isAuth = middleware(async (option) => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // Guard Clause
  if (!user || !user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return option.next({
    // Context, 'ctx', allows to pass any value fom this middlware directly into API that uses the private procedure
    ctx: {
      userId: user.id,
      user,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure; // Creates an API endpoint that anyone can call, authenticated or not (pubic API)
export const privateProcedure = t.procedure.use(isAuth) // If someonne calls the 'privateProcedure', then it make sure to run the 'isAuth' middlware first before API endpoint is called. 
