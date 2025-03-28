import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

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

    console.log("One stage before checking if user in database");
    // If the user in datbase that was check does not exists, then create the user in the database
    if (!dbUser) {
      console.log("Creating the database user");
      // Creates user in the DB
      await db.user.create({
        data: {
          // ID in database (left) matches the Kinde ID (right)
          id: user.id,
          email: user.email,
        },
      });
      console.log("Finished Creating the database user with this data");
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

  // API Endpoint - createStripeSession - Create a new session for the user when they want to upgrade to pro plan. No input & can straight away call the input. Always redirect them to appropriate stripe session whether they're customer or not
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    // Since we're on server-side with tRPC & API Endpoints, need "ABSOLUTE URL" and we can't use relative URL. Will have to create helper function that will help us do that so new code added "src\lib\utils.ts"
    const billingUrl = absoluteUrl("/dashboard/billing"); // Always will return correct URL no matter where we're are

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Seeing database entries for user
    const dbUser = await db.user.findFirst({
      // Find the first user where id matches userId
      where: {
        id: userId,
      },
    });
    // No database user, return error
    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    // If the user is already subscribed, take them to page where they can cancel or manage their subscriptions. If they're not, take them to a page to get them subscribe & directly pay
    const subscriptionPlan = await getUserSubscriptionPlan();

    // If on pro plan, can activate this when any of the uploadstatus of the files are failed due to not being subscribed earlier but checking if the user is subscribed can now activate some of the those files that were once failed.

    // New PROBLEM - This IF statement will no go through if file is failed and user clicked the button to upgrade since the upgrade succession is not complete (This if statement is reached before user finish the checkout)... Whole if block needs to be checked AFTER the session is completed and done, NOT DURING.
    console.log("One stage before entering new code I created");
    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      console.log(
        "We have enter the subscription plan and dbUser Stripe Id Part on tRPC"
      );
      // New Part of the Code 3/14/2024
      const proPlan = PLANS.find((plan) => plan.slug === "pro");
      const files = await db.file.findMany({
        where: {
          userId: ctx.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: proPlan?.quota,
      });

      const eligibleFiles = files.filter(
        (file) =>
          file.uploadStatus === "FAILED" &&
          file.pageAmt <= proPlan?.pagesPerPdf!
      ); // Note: adding the "!" at the end forces typescript that "('proPlan.pagesPerPdf' is possibly 'undefined'.)" to be ignored since we know that will exist.

      const filedIds = eligibleFiles.map((file) => file.id);

      await db.file.updateMany({
        where: {
          id: {
            in: filedIds,
          },
        },
        data: {
          uploadStatus: "SUCCESS",
        },
      });

      // Send user to a management page where they can cancel or manage subscription
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });
      // Send back to the front-end to redirect user to. Hosted page Stripe provides under this URL
      return { url: stripeSession.url };
    }

    // If statement above fails, they are not subscribe on pro plan so so let have them subscribed. "Create a Session" on Stripe Doc
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          // If plan name matches pro and exists optionally, get test mode API
          // If in production, change the ending of "test" to "production"
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        // Will be sent to webhook so we can make sure that we update data for correct user and so we enabled their plan and everything work for them
        userId: userId,
      },
    });
    return { url: stripeSession.url };
  }),

  // API Endpoint - getFileMessages - fetching all the messages that was sent for a specific file for "src\components\chat\Messages.tsx". Private Procedure so have to be logged in
  getFileMessages: privateProcedure
    .input(
      // Expecting an object and three things:
      z.object({
        limit: z.number().min(1).max(100).nullish(), // "nullish()" means it does not have to be pass
        // "cursor:" determines the infinite queries. On page load, loads X number of messages and as we scroll, load more messages. "cursor" determines how to find the next X set of messages
        cursor: z.string().nullish(),
        // "fileId" is to know which file to fetch the messages for
        fileId: z.string(),
      })
    )
    // Fetch all the messages we want to display in chat window. Must destructure "ctx" and "input"
    .query(async ({ ctx, input }) => {
      // Ensure the files are owned by the user are going to be fetched so destructure from the ctx
      const { userId } = ctx;
      const { fileId, cursor } = input;
      // Limit is passed in directly, if not there's always a fallback value, "INFINITE_QUERY_LIMIT" (defining central query limit [done through config file, "src\config\infinite-query.ts"])
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId, // where id of file matches with passed in fileId
          userId, // Only owned by the user so can't get anyone else file
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // Fetch the messages that we want to show  for this file that were sent in the past from the user
      const messages = await db.message.findMany({
        // Only want to take message of limit (never take more than the limit)
        take: limit + 1, // "+ 1" is important to determine if we scroll up from where we want to fetch the next messages. (Ex. 10 as limit but + 1 makes it 11 messages and very last one acts as cursor so when scroll up, it knows the next set of messages to fetch)
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        // If passed in cursor into API route, then that'll be ID of cursor. If we don't passed in the cursor then it's undefined
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });
      // Determine the logic of the next cursor for the message
      let nextCursor: typeof cursor | undefined = undefined; // declare as let since it is being mutated
      // If there's more messages in the database
      if (messages.length > limit) {
        // From the "+ 1", that items is popped and return. nextItem is will the next item to start fetching from
        const nextItem = messages.pop();
        nextCursor = nextItem?.id; // Only care about the id property of it
      }
      return {
        messages,
        nextCursor, // Know now where to start fetching if scroll up later.
      };
    }),

  // API Endpoint - Getting File "uploadStatus" from the "core.ts" from uploadthing, "onUploadComplete" for the ChatInput loading state. Need certain POST body as the input
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Get subscription status and plans
      const subscriptionPlan = await getUserSubscriptionPlan();
      const freePlan = PLANS[0];

      // Find the file
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      // If file meets free plan criteria, mark as SUCCESS regardless of subscription status
      if (file.pageAmt <= freePlan.pagesPerPdf) {
        // Check if within free plan quota
        const filesCount = await db.file.count({
          where: {
            userId: ctx.userId,
            uploadStatus: "SUCCESS",
          },
        });

        if (filesCount <= freePlan.quota) {
          // Update status to SUCCESS if it was FAILED
          if (file.uploadStatus === "FAILED") {
            await db.file.update({
              where: { id: file.id },
              data: { uploadStatus: "SUCCESS" },
            });
            return { status: "SUCCESS" as const };
          }
          return { status: file.uploadStatus };
        }
      }

      // If file exceeds free plan limits and user is not subscribed, mark as FAILED
      if (!subscriptionPlan.isSubscribed && file.pageAmt > freePlan.pagesPerPdf) {
        if (file.uploadStatus !== "FAILED") {
          await db.file.update({
            where: { id: file.id },
            data: { uploadStatus: "FAILED" },
          });
          return { status: "FAILED" as const };
        }
      }

      console.log("Status from tRPC: ", file.uploadStatus);
      return { status: file.uploadStatus };
    }),

  // New API Endpoint - Checking if the user changed from free plan to pro plan and had files uploaded that were locked only for pro plans. Changed them accordingly

  // NOTE - NEED TO MAKE THIS A MUTATION TO CHANGE THE BACKEND FILE UPLOADSTATUS WHEN GETTING USERID - 5/23/2024
  updateFileStatus: privateProcedure.mutation(async ({ ctx }) => {
    console.log("We have entered the updateFileStatus");

    const { userId } = ctx;

    // No user id, return error
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Seeing database entries for user
    const dbUser = await db.user.findFirst({
      // Find the first user where id matches userId
      where: {
        id: userId,
      },
    });
    // No database user, return error
    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    // If on pro plan, can activate this when any of the uploadstatus of the files are failed due to not being subscribed earlier but checking if the user is subscribed can now activate some of the those files that were once failed.
    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      // // New Part of the Code 3/14/2024
      const proPlan = PLANS.find((plan) => plan.slug === "pro");
      const files = await db.file.findMany({
        where: {
          userId: ctx.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: proPlan?.quota,
      });

      const eligibleFiles = files.filter(
        (file) =>
          file.uploadStatus === "FAILED" &&
          file.pageAmt <= proPlan?.pagesPerPdf!
      ); // Note: adding the "!" at the end forces typescript that "('proPlan.pagesPerPdf' is possibly 'undefined'.)" to be ignored since we know that will exist.

      const filedIds = eligibleFiles.map((file) => file.id);

      await db.file.updateMany({
        where: {
          id: {
            in: filedIds,
          },
        },
        data: {
          uploadStatus: "SUCCESS",
        },
      });
      // return { status: files.forEach(file => (file.uploadStatus)) };
      return { status: eligibleFiles.forEach((file) => file.uploadStatus) };
    }
    return true;
  }),

  // 9/11/2024 - Another new mutation needed for BillingForms.tsx. Checks if the subscription is cancelled as well if subscription plan is past the stripeCurrentPeriodEnd


  // Old mutation - will be removed
  getFileStatusUpdateProFilesStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Find many files where fileId from the /dashboard/[fileid] params matches, userId from Kinde matches, if pageAmt is less than or equal to pro plan, if quota (number of files is less than or equal to pro plan) while sorted by createdAt to get the most recent (or could be oldest) files that were failed due to upgrade from free plan to pro plan during the transition. uploadstatus for each of these files found will be set to success since they meet the criteria.
      const subscriptionPlan = await getUserSubscriptionPlan();
      // NOTE: AT this part, seeing if the subscriptionPlan shows for the specific user
      // console.log(
      //   "This is the subscription plan inside the checkProFileUploadStatus: ",
      //   subscriptionPlan
      // );

      // Find a file and check the status of the file upload
      const file = await db.file.findFirst({
        // Find file 'where' the id is the "input.fileid" from "input" and "fileid" a couple lines above
        // In order to use "input" below, we need to first import and pass it as prop
        where: {
          id: input.fileId,
          userId: ctx.userId, // userId matches the login user
        },
      });
      if (!file) return { status: "PENDING" as const };

      console.log("Stage 1");

      // If subscribed but file upload stats is failed, will update the first number of files under pro plan quota to SUCCESS if it meets the requirement of less than pro plan pagesPerPdf.
      if (subscriptionPlan.isSubscribed && file?.uploadStatus === "FAILED") {
        console.log("IT ENTER IN THIS STAGE");
        const proPlan = PLANS.find((plan) => plan.slug === "pro");
        const files = await db.file.findMany({
          where: {
            userId: ctx.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: proPlan?.quota,
        });

        // const failedFiles = files.filter(file => file.uploadStatus === "FAILED")
        const eligibleFiles = files.filter(
          (file) =>
            file.uploadStatus === "FAILED" &&
            file.pageAmt <= proPlan?.pagesPerPdf!
        ); // Note: adding the "!" at the end forces typescript that "('proPlan.pagesPerPdf' is possibly 'undefined'.)" to be ignored since we know that will exist.
        const filedIds = eligibleFiles.map((file) => file.id);

        await db.file.updateMany({
          where: {
            id: {
              in: filedIds,
            },
          },
          data: {
            uploadStatus: "SUCCESS",
          },
        });
        return { status: file.uploadStatus };
      }
      console.log("Status from tRPC: ", file.uploadStatus);
      return { status: file.uploadStatus };
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

      return file;
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

          // Overall, searches for the current logged in user ID and the current filels the logged in user owns.
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // NEW - Delete file on uploadthing side
      await utapi.deleteFiles(file.key);

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
