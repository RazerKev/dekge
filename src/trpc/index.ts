import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // Added export
  // Get request to the database to see if the user exists or not
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = getUser()

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" })

    // Check if user is in databaase
    return { success: true }
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
