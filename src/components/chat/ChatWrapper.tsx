"use client"; // Using trpc

import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";
import { getUserSubscriptionPlan } from "@/lib/stripe";

interface ChatWrapperProps {
  fileId: string;
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const ChatWrapper = ({ fileId, subscriptionPlan }: ChatWrapperProps) => {
  // Handle Loading States using Polling Approach; triggers when page loads
  // The "trpc.getFileStatusUpdateProFilesStatus.useQuery()" is a hook so CANNOT wrap it in a conditional statement (while, if, for, etc) and must be run without that.
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      // Passes in "data". Whatever is returned from API Route is going to be accessible below as "data" which is "{ status: file.uploadStatus }".
      // Implicitly Return (no "{}" in "(data) => {}")
      refetchInterval: (data) =>
        // Want to poll until there's a certain status

        // The fileupload is technically done/resolved so stop polling since there is no loading state. If not, keep pooling in 500ms delay
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  const { isSubscribed } = subscriptionPlan;
  // Problem - User files for "core.ts" from uploadthing folder may be at data.status = FAILED since the user was on failed status when uploaded but upgrade to pro plan so should update the status of the files. (Maybe called another endpoint that goes through the first "pagesPerPdf" files updating the status of all of them to SUCCESS, leaving rest set to Failed)

  // Error - can't have a hook invoked inside the body of an if, else, for or while statement? Need to move that hook into a component and render the component itself conditionally.
  // if (data?.status === "FAILED" && isSubscribed) {
  // const { data, isLoading } = trpc.checkProFileUploadStatus.useQuery(
  //   // { enabled: !!isSubscribed },
  //   { fileId },
  //   {
  //     refetchInterval: (data: { status: string }) =>
  //       data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
  //   }
  // );
  // return { data, isLoading };
  // }

  console.log("Fetching data.status: ", data?.status);
  // Don't have the result of API call yet (no status yet is Loading)
  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        {/* Disabled the ChatInput but show it when loading */}
        <ChatInput isDisabled />
      </div>
    );

  // Return if data is processing
  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        {/* Disabled the ChatInput but show it when loading */}
        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p className="text-zinc-500 text-sm">
              Your <span className="font-medium">Free</span> plan supports up to
              5 pages per PDF.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        {/* Disabled the ChatInput but show it when loading */}
        <ChatInput isDisabled />
      </div>
    );

  return (
    // Both Components "<Messages />" and "<ChatInput />" that uses the context are already in this file so no extra work needed.
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-20">
          {/* Display the Messages Component */}
          <Messages fileId={fileId} />
        </div>
        {/* Render Chat Input */}
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
