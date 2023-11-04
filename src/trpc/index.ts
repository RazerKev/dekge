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

  // API Endpoint, getFile: getting info of a file. Checking if the input being obtained is an object schema and if the key for checking the database is a string.
  // For the Polling Approach backend (API Endpoint)
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId, // Makes sure the file pertain to current logged in user
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" }); //404 Error

      return file
    }),

  // Another API Endpoint - Deleting files from the trashcan button. 'input()' is like a post-request-body input instead of 'get' from 'query()'
  // Force API endpoint to run at runtime with zod (TypeScript is buildtime) and when passing an object, it needs to have an id property of type string. API will throw an error if doesn't come true & can't call endpoint
  deleteFiles: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id, // Make sure the input.id matches the ID of the file in database. 'input.id' is type string from the 'privateProcedure.input()' line

          // Note - Extremely insecure, anyone can pass in any id and find & delete the file. So make sure the file has the userID of the user that's calling the API endpoint below.
          userId,

          // Overall, searches for the currernt logged in user ID and the current filels the logged in user owns.
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
          // userId
        },
      });
      return file;
    }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
