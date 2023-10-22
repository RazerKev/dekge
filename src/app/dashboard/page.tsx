// Server Component by default and then HTML returned is sent back to Client. To opt into client-side behavior in Next.js 13, use "use client" in quotes.
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  return <div>{user.email}</div>;
};

export default Page;
