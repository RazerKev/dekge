import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // Outdated Stripe API version
  // apiVersion: "2023-10-16",
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  // Get currently logged in user
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // If they're not logged in, return null/false for all values to indicate not subscribed
  if (!user.id) {
    console.log("User not logged in. Returning null/false");
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  // Going to database to see if there's entries for user
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  // No database user, return null/false again
  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  console.log("Successfully went into Database and found dbUser: ", dbUser);

  const oneDay = 24 * 60 * 60 * 1000; // 86400000 ms = 1 day

  console.log("One Day is:", oneDay, "ms");

  // Check if db user is subscribed with the three statements below
  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd &&
      // Checks if current time is less than the end of the subscription period plus one day which is added from the 8.64E7 and allows for a grace period after official end of subscription. Account for time zone differences or delays in payment processing
      dbUser.stripeCurrentPeriodEnd.getTime() + oneDay > Date.now()
  );

  console.log("Is the user subscribed: ", isSubscribed);

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : PLANS[0]; // Return free plan if not subscribed

  console.log("The plan: ", plan);

  // Get if they cancel their plan or not
  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  // Handle subscription expiration or cancellation
  if (!isSubscribed || isCanceled) {
    // If subscription expired or cancelled, update files that exceed free plan limits
    const freePlan = PLANS[0];
    try {
      // Update files that exceed free plan limits to FAILED status
      await db.file.updateMany({
        where: {
          userId: user.id,
          pageAmt: {
            gt: freePlan.pagesPerPdf,
          },
        },
        data: {
          uploadStatus: "FAILED",
        },
      });

      // If they had more files than free plan quota, mark excess as FAILED
      const files = await db.file.findMany({
        where: {
          userId: user.id,
          uploadStatus: "SUCCESS",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (files.length > freePlan.quota) {
        const excessFiles = files.slice(freePlan.quota);
        await db.file.updateMany({
          where: {
            id: {
              in: excessFiles.map((file) => file.id),
            },
          },
          data: {
            uploadStatus: "FAILED",
          },
        });
      }
    } catch (error) {
      console.error("Error updating file statuses:", error);
    }
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
