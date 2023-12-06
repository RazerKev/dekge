import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";

interface MessageProps {
  fileId: string;
}

const Messages = ({ fileId }: MessageProps) => {
  // Get all the messages here that we have to display and render it out one by one in the ChatWindow. Must first fetch the data from the database

  // Need to create an endpoint to handle that
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId, // Don't have "fileid" in this component so will need to receive the props above
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        // Return the last page in the next cursor. Knows where to start fetching the next cursor
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        // Keep previous data to avoid data flashes; data will refreshed when having the new data & not before that
        keepPreviousData: true,
      }
    );

  // Only care about the "messages" inside the data so extract that
  // "data.pages" is array containing the fetched pages (TanStack Query Doc)
  // Use "flatMap(...)" instead of "map(...)"; The map returns "[][]" and not one but "flatMap()" embedded one or X amount into one single array (flatMap() is on MDN Doc)
  const messages = data?.pages.flatMap((page) => page.messages);

  // Needs to match the regular message
  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message", // Make something up that's unique
    isUserMessage: false, // Loading state to be true for AI and not the User.
    // Renders a JSX Element; not a string as text
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  // Combined Message Constant - send a message later, display a loading state message.
  const combinedMessages = [
    ...(true ? [loadingMessage] : []), // spread in the message in mocked true state
    ...(messages ?? []), // empty array if null or undefined ("??") for spread messages; nullish coalescing operator.
  ];

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {/* For each message, map them over but logic first; Two ternary operator (one nested inside the other). For "combinedMessages" if it exists and there is one message, map them over and display them all. Need the "index" to perform the infinite scrolling and to check if that is intersecting the viewpoint to then load more messages. Ref to last element on the screen needs to be attached to see if last element we're rendering */}
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, index) => {
          // If next message is sent by the SAME PERSON (change up CSS) * EDGE CASE being handled. If the pass message is same as the current message for "isUserMessage" style them to be the same.
          const isNextMessageSamePerson =
            combinedMessages[index - 1]?.isUserMessage ===
            combinedMessages[index]?.isUserMessage;
          if (index === combinedMessages.length - 1) {
            // Return out each Message. Since we're mapping over elements of the message, will need a key
            return (
              <Message
                // The message instance that is currently being mapped over (element of the array)
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              // Not rendering out the last message
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
        })
      ) : // Loading and there's no messages yet or haven't been loaded
      isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        // If there's nothing to show (no messages). User is ready to msg their PDF file
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
