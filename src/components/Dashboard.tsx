"use client"; // Client side - using the "useQuery" utility

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useEffect, createContext, useState, useRef } from "react";
import { getUserSubscriptionPlan } from "@/lib/stripe";

type SubscriptionResponse = {
  // subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
  isSubscribed: boolean;
  // isCanceled: boolean;
  // stripeCurrentPeriodEnd: Date | null;
  // name?: string;
  // slug?: string;
  // quota?: number;
  // pagesPerPdf?: number;
  // price?: {
  //   amount: number;
  //   priceIds: {
  //     test: string;
  //     production: string;
  //   };
  // };
};

export const SubscriptionContext = createContext<SubscriptionResponse>({
  isSubscribed: false,
  // isCanceled: false,
  // stripeCurrentPeriodEnd: null,
  // name: "Free",
  // slug: "free",
  // quota: 10,
  // pagesPerPdf: 5,
  // price: {
  //   amount: 0,
  //   priceIds: {
  //     test: "",
  //     production: "",
  //   },
  // },
});

const Dashboard = ({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionResponse;
}) => {
  // To know which file is being deleted specifically. Set as a string or null and currently is set as a null for default.
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  // Force invalidate and refresh the data - useful for having user not refresh entire page
  // NOTE - The hook 'useContext' was renamed to 'useUtils' until Version 10.41.0 (and is still aliased for foreseeable future) - Based on tRPC doc
  const utils = trpc.useUtils(); // Will be call inside 'trpc.deleteFiles.useMutation()' below 'useUtils' gives you access to helpers that let you managed cached data of queries (gives access to the 'invalidate' helper)

  // data will be renamed to 'files'
  // Two lines of code below is using a client side
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  // Renamed built-in 'mutate' to 'deleteFiles' since it is being deleted
  const { mutate: deleteFiles } = trpc.deleteFiles.useMutation({
    // Route has been successful & file has been deleted, callback is executed
    onSuccess: () => {
      utils.getUserFiles.invalidate(); // Force 'getUserFiles()' to fetch data & refresh without manually refreshing or waiting for query to become stale (out of date) before refetching again on success when deleting a file; invalidate and it will automatically realize file is not there.
    },
    onMutate({ id }) {
      // Triggers when the button is clicked
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      // When an error is thrown or API resolved successfully (done state)
      setCurrentlyDeletingFile(null); //Loading state should stop at this point so set to null
    },
  });

  // 9/16/2024 - New Added in (Testing)
  const { mutate: updateFileStatus } = trpc.updateFileStatus.useMutation({
    onSuccess: () => {
      console.log(
        "Compatible files have been updated to success. Location: Dashboard.tsx"
      );
    },
  });

  // Goal: Want this mutation code above and code below to run when page loads and update any file status if user had "Success" on pro plan uploads to "Fail" if their subscription ends
  // Problem: With no "useRef()" code, this will rerender twice so will require "useRef()" .
  // Solution: "useRef()" hook ensures that the "updateFileStatus" mutation is only called once when the component mounts, and it prevents any subsequent calls during re-renders.
  const hasCalledUpdateFileStatus = useRef(false);
  // When component mounts, useEffect hook is run and "hasCalledUpdateFileStatus.current" value is checked. Initially set to false, it is called and then set to "true". On subsequent renders, the useEffect hook will run again, but this time, the check "if (!hasCalledUpdateFileStatus.current)" will fail because "hasCalledUpdateFileStatus.current" is now "true". This prevents the "updateFileStatus" mutation from being called again.
  // On subsequent render, "useEffect" runs because it’s the first time the component is rendered. The "updateFileStatus" function is called, and the effect runs. Subsequent renders are re-renders that happen after the initial render of the component. These can occur due to state changes, prop changes, or other factors that cause React to re-render the component and are not PAGE RElOADING. For page reloading, entire React component tree is unmounted and remounted so all states including "useRef" values are reset.
  // The "useRef" hook works within the lifecycle of a single component instance. It helps prevent multiple calls to "updateFileStatus" during the lifecycle of that instance. However, when you reload the page, a new instance of the component is created, and the "useRef" value is reset.
  useEffect(() => {
    if (!hasCalledUpdateFileStatus.current) {
      updateFileStatus();
      hasCalledUpdateFileStatus.current = true;
    }
  }, [updateFileStatus]);

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-light-pink">My Files</h1>

        <SubscriptionContext.Provider value={subscriptionPlan}>
          <UploadButton />
        </SubscriptionContext.Provider>
      </div>

      {/* Display all user files */}

      {/* If there's one file or more */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              // Need to include key when mapping to make each file unique. Can be any name
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-light-pink to-light-purple" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {/* 'format(new Date())' if from date-fns module */}
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <MessageSquare className="h-4 w-4" />
                    mocked */}
                    {file.uploadStatus}
                    <div>Testing</div>
                  </div>
                  <Button
                    onClick={() => deleteFiles({ id: file.id })}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                  >
                    {/* Currently deleted file is === to file mapping over dot ID, then show JSX loading state, else, show trash icon */}
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        // Display loading state
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        // Not loading and there's no files
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
