"use client"

import { ArrowRight, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const MobileNav = ({isAuth}: { isAuth: boolean }) => {

    const [isOpen, setOpen] = useState<boolean>(false)
    // useRef needed for the "useEffect()" missing dependency problem if using "[isOpen, pathname]"
    const openRef = useRef(isOpen);

    // Return the opposite of the previous state set from open state
    const toggleOpen = () => setOpen((prev) => !prev)

    // React Hook for closing menu when already on href
    const pathname = usePathname()

    // From React Docs "EFFECTS" - This part of the code will run after React update the screen / DOM first. Effects run after every render and are caused by rendering itself rather than by a particular event (clicking a button, etc...) Can configured it to re-renders when needed rather than after every render by passing in by specifying the dependencies "[]" at the end so it re-renders when that dependency changes. May need need a cleanup function at the end, and may be needed for some effects to specify how to stop or undo something depending on if the dependency array is empty [] since it won't trigger stop but instead when component "mounts" (appears on the screen for the first time)
    useEffect(() => {
      if (openRef.current) toggleOpen();
      // Run this part of code every time when the "pathname" and "openRef" changes. Originally had "[isOpen, pathname]" for original if statement above: "if(isOpen) toggleOpen()" and need "isOpen" due to dependency error but will cause it to run twice.
      // Problem - Cannot change state inside the effect which causes re-render. Applying it on dependency causes re-render twice since toggleOpen changes isOpen state and entering effect causes it to change again.
      // Solution - useRef() has no effect or state value change, so updating it will not trigger a re-render like states. openRef remains the same (false) and would have to manually be updated (does not automatically update to reflect changes) but is fine to remove dependency error.
    }, [openRef, pathname]); 

    // If user clicked and already on that current page, it justs close that page and not navigate the user.
    const closeOnCurrent = (href: string) => {
        if(pathname === href) {
            toggleOpen()
        }
    }

    return (
      <div className="sm:hidden">
        <Menu onClick={toggleOpen} className="relative z-50 h-5 text-white" />
        {isOpen ? (
          <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
            <ul className="absolute bg-light-pink border-b border-light-white shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
              {!isAuth ? (
                // Not Authenticated - use React Fragment since having this top level <div> that does nothing is worthless to have on DOM.
                <>
                  <li>
                    {/* The "/sign-up" and "/sign-in" files does not exists on the project directory but instead exists in "src\app\api\auth\[kindeAuth]\route.ts" from built-in KindeAuth with Next.js... Can make it work with the configuration in that directory */}
                    <Link
                      onClick={() => closeOnCurrent("/sign-up")}
                      className="flex items-center w-full font-semibold text-light-purple"
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
                      className="flex items-center w-full font-semibold text-light-purple"
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
                      className="flex items-center w-full font-semibold text-light-purple"
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
                      className="flex items-center w-full font-semibold text-light-purple"
                      href="/dashboard"
                    >
                      Dashboard
                    </Link>
                  </li>
                  {/* Separator <li> tag below */}
                  <li className="my-3 h-px w-full bg-gray-300" />
                  <li>
                    <Link
                      className="flex items-center w-full font-semibold text-light-purple"
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