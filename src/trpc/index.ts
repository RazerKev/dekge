import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

import { useQuery } from '@tanstack/react-query'

export const appRouter = router({
  // Added export
  // Get request to the database to see if the user exists or not
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    // Guard Clause - anything past this error statement means there is some id and email that can be used for checking database or creating new user
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Check if user is in databaase. 'dbUser' refer to database user
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id, // Reference to login user
      },
    });

    // If the user in datbase that was check does not exists, then create the user in the database
    if (!dbUser) {
      // Creates user in the DB
      await db.user.create({
        data: {
          // ID in database (left) matches the Kinde ID (right)
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
