// "use client"; // Declare this as client side for it to work. Are using the "useSearchParams()" which returns on client side.

// import { useRouter, useSearchParams } from "next/navigation";
// import { trpc } from "../_trpc/client";
// import { useQuery } from "@tanstack/react-query";
// import { Loader2 } from "lucide-react";

// const Page = () => {
//   const router = useRouter(); // Helps us get access to the query parameter '?origin=dashboard'

//   const searchParams = useSearchParams();
//   const origin = searchParams.get("origin");

//   // -----------------------------------------------------------

//   // NOTE: TRPC Verion 10+ is incompatible with React-Query V5 based on this reply: https://github.com/TanStack/query/issues/6186#issuecomment-1772356489

//   // Will have to downgrade from React-Query (RQ) new upgrade, version 5, to latest verion 4 one that is working: ("@tanstack/react-query": "^4.36.1",). TRPC verion 11 is in work which will be compatible with RQ Version 5.

//   // Have to downgrade to prevent the "hashQueryKey is not exported from tanstack/react-query" error.

//   // -----------------------------------------------------------

//   const { isError, isSuccess } = useQuery({
//     queryKey: ["user"],
//     queryFn: () => trpc.authCallback,
//     retry: true,
//     retryDelay: 25000,
//   });
//   console.log(isError)
//   console.log(isSuccess);

//   if (isError) {
//     router.push("/sign-in");
//     // return <span>Error: {error.message}</span>;
//   }

//   if (isSuccess) {
//     router.push(origin ? `/${origin}` : `/dashboard`);
//     // router.push(origin ? `/${origin}` : `/${origin}`);
//     console.log("Success Stage of dashboard");
//   }
//   console.log("On dashboard stage");

//   return (
//     <div className="w-full mt-24 flex justify-center">
//       <div className="flex flex-col items-center gap-2">
//         <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
//         <h3 className="font-semibold text-xl">Setting up your account...</h3>
//         <p>You will be redirected automatically.</p>
//       </div>
//     </div>
//   );

//   // URL -> `/auth-callback?origin=dashboard`
//   // `origin` -> 'dashboard'
// };

// export default Page;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        // user is synced to db
        console.log("It's a success")
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    onError: (err) => {
      console.log("It's an error");
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;