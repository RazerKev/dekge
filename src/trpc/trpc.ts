// From the Quickstart guide. Instead of creating router instance in 'server/trpc.ts' and 'server/index.ts', it's instead in 'trpc' folder so 'trpc/trpc.ts' and 'trpc/index.ts'

import { initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure; // Creates an API endpoint that anyone can call, authenticated or not (pubic API)
