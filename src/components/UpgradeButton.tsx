"use client" // Since we're on the client side

// Upgrade Button Component for Pricing page

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {

  // Destructure mutate to call and invoke this function when btn clicked
  const {mutate: createStripeSession} = trpc.createStripeSession.useMutation({
    // Now have the stripe session. Can destructure url since always get it from createStripeSession
    onSuccess: ({ url }) => {
      // Can be url if that's defined or /dashboard/billing and since we know we're on CLIENT SIDE, can leave this as a relative path 
      window.location.href = url ?? "/dashboard/billing"
    },
  });

  return (
    // onClick, the user create a checkout session so user can upgrade (using tRPC) with createStripeSession being invoked
    <Button onClick={() => createStripeSession()} className="w-full">
      Upgrade Now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
