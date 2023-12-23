import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe"

const Page = async () => {
    // Determine if they're on subscription plan
    const subscriptionPlan = await getUserSubscriptionPlan()

    // Return client component in which we can be passed in the server-side determined plan as prop
    return <BillingForm subscriptionPlan={subscriptionPlan} />;
}

export default Page