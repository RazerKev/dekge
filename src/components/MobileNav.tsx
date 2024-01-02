"use client"

import { ArrowRight, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const MobileNav = ({isAuth}: { isAuth: boolean }) => {

    const [isOpen, setOpen] = useState<boolean>(false)

    // Return the opposite of the previous state set from open state
    const toggleOpen = () => setOpen((prev) => !prev)

    // React Hook for closing menu when already on href
    const pathname = usePathname()

    // From React Docs "EFFECTS" - This part of the code will run after React update the screen / DOM first. Effects run after every render and are caused by rendering itself rather than by a particular event (clicking a button, etc...) Can configured it to re-renders when needed rather than after every render by passing in by specifying the dependencies "[]" at the end so it re-renders when that dependency changes. May need need a cleanup function at the end, and may be needed for some effects to specify how to stop or undo something depending on if the dependency array is empty [] since it won't trigger stop but instead when component "mounts" (appears on the screen for the first time)
    useEffect(() => {
        if(isOpen) toggleOpen()
    }, [pathname]) // Do this every time when the "pathname" changes

    // If user clicked and already on that current page, it justs close that page and not navigate the user.
    const closeOnCurrent = (href: string) => {
        if(pathname === href) {
            toggleOpen()
        }
    }

    return (
      <div className="sm:hidden">
        <Menu
          onClick={toggleOpen}
          className="relative z-50 h-5 text-zinc-700"
        />
        {isOpen ? (
          <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
            <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
              {!isAuth ? (
                // Not Authenticated - use React Fragment since having this top level <div> that does nothing is worthless to have on DOM.
                <>
                  <li>
                    {/* The "/sign-up" and "/sign-in" files does not exists on the project directory but instead exists in "src\app\api\auth\[kindeAuth]\route.ts" from built-in KindeAuth with Next.js... Can make it work with the configuration in that directory */}
                    <Link
                      onClick={() => closeOnCurrent("/sign-up")}
                      className="flex items-center w-full font-semibold text-green-600"
                      href="/sign-up"
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </li>
                  {/* Separator <li> tag below */}
                  <li className="my-3 h-px w-full bg-gray-300" />
                  <li>
                    <Link
                      onClick={() => closeOnCurrent("/sign-in")}
                      className="flex items-center w-full font-semibold"
                      href="/sign-in"
                    >
                      Sign In
                    </Link>
                  </li>
                  {/* Separator <li> tag below */}
                  <li className="my-3 h-px w-full bg-gray-300" />
                  <li>
                    <Link
                      onClick={() => closeOnCurrent("/pricing")}
                      className="flex items-center w-full font-semibold"
                      href="/pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      onClick={() => closeOnCurrent("/dashboard")}
                      className="flex items-center w-full font-semibold"
                      href="/dashboard"
                    >
                      Dashboard
                    </Link>
                  </li>
                  {/* Separator <li> tag below */}
                  <li className="my-3 h-px w-full bg-gray-300" />
                  <li>
                    <Link
                      className="flex items-center w-full font-semibold"
                      href="/sign-out"
                    >
                      Sign Out
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        ) : null}
      </div>
    );
}

export default MobileNav