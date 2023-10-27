// Server Component by default and then HTML returned is sent back to Client. To opt into client-side behavior in Next.js 13, use "use client" in quotes.
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import Dashboard from "@/components/Dashboard";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // Make sure the user is logged in 
  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  // Note - user doesn't exists first time, they're sent to auth-callback and see account being created msg but if yiu're logged in, you'll never see the message again.
  const dBUser = await db.user.findFirst({
    where: {
      id: user.id //id in database == user.id that was logged in
    }
  })

  // If user in database doesn't exists
  if(!dBUser) redirect("/auth-callback?origin=dashboard");

  // Display logged in authenticated user for dashboard - Server Component
  return <Dashboard />
};

export default Page;
