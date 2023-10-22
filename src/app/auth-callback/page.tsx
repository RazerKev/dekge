import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

const Page = async () => {
  const router = useRouter(); // Helps us get access to the query parameter '?origin=dashboard'

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // First agrument is 'undefined' since we don't expect any new data request (Ex. post request body)
  const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      // Get and destructure success data (boolean) from 'trpc/index.ts'
      if (success) {
        // If user synced to database (DB), navagiated them back to DB
        // If there's an origin (can be 'string' or 'null'), navagate them back there but if there's no origin, then will always send them back to dashboard (Basically send to dashboard either or)
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });
  // URL -> `/auth-callback?origin=dashboard`
  // `origin` -> 'dashboard'
};

export default Page;
