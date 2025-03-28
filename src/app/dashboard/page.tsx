// Server Component by default and then HTML returned is sent back to Client. To opt into client-side behavior in Next.js 13, use "use client" in quotes.

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import Dashboard from "@/components/Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // Make sure the user is logged in
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  // Note - user doesn't exists first time, they're sent to auth-callback and see account being created msg but if you're logged in, you'll never see the message again.
  const dBUser = await db.user.findFirst({
    where: {
      id: user.id, //id in database == user.id that was logged in
    },
  });

  // If user in database doesn't exists
  // (Update - STUCK in this part where no user exists and throws me back to dashboard which dashboard when push to origin throws me here leading to an infinite loop)
  if (!dBUser) redirect("/auth-callback?origin=dashboard");
  

  const subscriptionPlan = await getUserSubscriptionPlan();

  // Display logged in authenticated user for dashboard - Server Component
  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
