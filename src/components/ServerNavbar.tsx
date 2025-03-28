// ParentComponent.tsx
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";

const ServerNavbar = () => {
  // Get user from Kinde
  const { getUser } = getKindeServerSession();
  const user = getUser();

  return (
    <div className="flex h-14 items-center justify-between bg-navcolor/40 p-5 relative w-full align-middle gap-24 shadow-2xl shadow-black/25 backdrop-blur-[18] rounded-2xl">
      <Link href="/" className="flex z-40 font-semibold">
        <span className="text-xl text-light-white">Dekge</span>
      </Link>

      {/* Mobile Nav. Passed in "isAuth" but with double "!!" since it is converting an object to a boolean (T or F)*/}
      <MobileNav isAuth={!!user} />

      <div className="hidden items-center space-x-4 sm:flex">
        {/* Using Fragment "<> </>" - Nest certain elements right below one another, don't want to extend DOM and performance is faster; however, not on DOM and can't add classNames to it. */}
        {!user ? (
          <>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "text-xl text-light-white"
              )}
            >
              Pricing
            </Link>
            <LoginLink
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "text-xl text-light-white"
              )}
            >
              Sign in
            </LoginLink>
            <RegisterLink
              className={cn(
                buttonVariants({
                  variant: "purple",
                  size: "sm",
                }),
                "text-xl text-light-white"
              )}
            >
              Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
            </RegisterLink>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "text-xl text-light-white"
              )}
            >
              Dashboard
            </Link>
            {/* Dropdown that can show the user options if they're logged in */}
            <UserAccountNav
              email={user.email ?? ``}
              imageUrl={user.picture ?? ``}
              name={
                !user.given_name || !user.family_name
                  ? "Your Account"
                  : `${user.given_name} ${user.family_name}`
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
export default ServerNavbar;
