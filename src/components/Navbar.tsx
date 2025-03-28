"use client";
import MaxWdithWrapper from "./MaxWidthWrapper";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  // Get current pathname to determine if we're on the home page
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [scrollPos, setScrollPos] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [pastFirstViewport, setPastFirstViewport] = useState<boolean>(false);

  useEffect(() => {
    const checkScroll = () => {
      // Get scroll position
      let currentScrollPos = window.scrollY;
      // Checking if the current scroll position is greater than the initial height of the page load including the navbar at first load up (100vh) since position is absolute and does not take up DOM
      let isScrolled = currentScrollPos > window.innerHeight;

      // If passed windows inner height and have past the first viewport which is set to false automatically since we have not passed the first page, but this is checking for it to happen, then set the state to true and user have at least scroll pass the landing page.
      if (isScrolled && !pastFirstViewport) {
        setPastFirstViewport(true);
      }
      // Updates scroll state when passed window inner height and if the current position is less than the scroll position set from the current scroll position (when user scrolls up). This updates the state and set the scroll position to the current position as a one state behind indicator for checking when user scrolls up which makes that current position less than what it was just set.
      setIsScrolled(isScrolled && currentScrollPos < scrollPos);
      setScrollPos(currentScrollPos);
    };

    // Each time the user scrolls, even is listen and the checkscroll() is called. After it's called, we want to remove it so remove the event since it's inside the useEffect() so cannot have it running thr whole time without closing it.
    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
    }; // Update and run through this every time scrollPos or user pass the the first viewport page occurs.
  }, [scrollPos, pastFirstViewport]);

  // If past the first viewport page, navbar becomes fixed, if not remain absolute
  // Add relative positioning only when not on the home page
  const position = pastFirstViewport
    ? "fixed top-0 pt-6"
    : isHomePage
      ? "absolute pt-6"
      : "relative pt-6";
  // Animation is set and active when passed first viewport page
  let animation = isScrolled ? "" : "animate-smoothnav-up";
  // Set tailwind-css properties once it's passed first viewport page
  const bgColor = pastFirstViewport
    ? "bg-[#5B485B]/50 border-b border-[#5B485B]/50"
    : "bg-transparent";

  // If passed the first viewport page, then check if the user is still passed the 100vh/landing page and if so remain unchanged but if user scroll back up to viewport page, push the navbar back up so it sits at the top of page
  if (pastFirstViewport) {
    animation = isScrolled ? "" : "animate-smoothnav-up top-[-100px]";
  }
  // If passed viewport initially and back to starting page, navbar comes back down when set to "" with a smooth transition down set from Tailwind "transition-all" property
  if (pastFirstViewport) {
    if (scrollPos === 0) {
      animation = "";
    }
  }

  return (
    <nav
      className={`${position} inset-x-0 h-14 z-30 w-full transition-all ${animation}`}
    >
      <MaxWdithWrapper className="flex justify-center">{children}</MaxWdithWrapper>
    </nav>
  );
};

export default Navbar;
