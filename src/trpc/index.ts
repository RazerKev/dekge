import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
  // Added export
  // Get request to the database to see if the user exists or not. With 'publicProcedure', anyone can query this API endpoint.
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
  // Another API Endpoint - getUserFiles - pass in user ID and get back all the files that user owns. No 'publicProcedure', only signed in users can call this API (not public)
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  // Another API Endpoint - Deleting files from the trashcan button. 'input()' is like a post-body input instead of 'get' from 'query()'
  // Force API endpoint to run at runtime with zod (TypeScript is buildtime) and when passing an object, it needs to have an id property of type string. API will throw an error if doesn't come true & can't call endpoint
  deleteFiles: privateProcedure.input(
    z.object({ id: z.string() })
  ).mutation(async ({ctx}) => {
    const {userId} = ctx

    const file = await
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
