import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { cn, constructMetadata } from "@/lib/utils";
import { Roboto } from "next/font/google";
import "./globals.css";

import "react-loading-skeleton/dist/skeleton.css"; // From npm docs
import "simplebar-react/dist/simplebar.min.css"; // From npm docs

import { Toaster } from "@/components/ui/toaster";
import React from "react";
import ServerNavbar from "@/components/ServerNavbar";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata = constructMetadata();

// export const ScrollContext = React.createContext(false);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn("min-h-screen antialiased grainy", roboto.className)}
        >
          <Toaster />
          {/* <p>
            New Release: Dekge Special Plan! Get Free AI Booster with your
            referral
          </p> */}
          <Navbar>
            <ServerNavbar />
          </Navbar>
          {/* The '{children}' is all the pages inside the app */}
          {children}
        </body>
      </Providers>
    </html>
  );
}
