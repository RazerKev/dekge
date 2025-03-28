"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import MaxWdithWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BillingFormProps {
  // Type Awaited utility that takes generic return type which again takes a generic type of getUserSubscriptionPlan
  // Gets type "getUserSubscriptionPlan" output and since it returns a Promise & since that's async, you have to await it using "Awaited" and get the result of the awaited operation which is output of that function that can be use as a prop
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const { toast } = useToast();

  // Stripe Session - Alternative page to pricing page
  // Destructure the mutation we can call to invoke this mutate from tRPC

  // IDEA - after the onSuccess from calling the "createstripeSession" is then when the if statement block of subscription plan and db strip ID is check...
  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      // onSuccess: ({ url }) => {
      //   if (url) window.location.href = url;
      //   if (!url) {
      //     toast({
      //       title: "There was a problem",
      //       description: "Please try again in a moment",
      //       variant: "destructive",
      //     });
      //   }
      // },
      onSuccess: async ({ url }) => {
        // 6/17/2024 - Problem for updateFileStatus() - this is called when the user click the "Manage Subscription" btn after they upgraded to pro plan and should be called after they upgrade to pro plan, not from clicking the btn which actives the "createStripeSession" mutation. However, logic works completely fine.
        await updateFileStatus();
        if (url) window.location.href = url;
        if (!url) {
          toast({
            title: "There was a problem",
            description: "Please try again in a moment",
            variant: "destructive",
          });
        }
      },
    });

  // NEW Mutation call for chain mutation - once the createStripeSession is complete, use another mutation right after to modify which qualify files with an upload status from FAIlED to SUCCESS
  const { mutate: updateFileStatus } = trpc.updateFileStatus.useMutation({
    onSuccess: () => {
      console.log("Compatible files have been updated to success");
    },
  });

  // Another tRPC endpoint being called where it checks if user subscription is cancelled and if subscription plan is past the stripeCurrentPeriodEnd

  return (
    <MaxWdithWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          // Since we removed action, need to prevent the default from happening
          e.preventDefault();
          createStripeSession();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isLoading ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to PRO"}
            </Button>
            {/* Display when this plan will be canceled or renewed */}
            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on "}
                {/* Need the "!" at the end to tell TypeScript we're sure that this exists */}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWdithWrapper>
  );
};

export default BillingForm;
