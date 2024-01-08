import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  // Get currently logged in user
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // If they're not logged in, return null/false for all values to indicate not subscribed
  if (!user.id) {
    console.log("User not logged in. Returning null/false")
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
    : null;

  console.log("The plan: ", plan);

  // Get if they cancel their plan or not
  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  console.log("Check if canceled: ", isCanceled);

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}