// This ChatContext "Providers" wraps the components together.
// Process the message, handle loading error states, etc...

// Technically isn't a component but should be located with other chat files
import React, { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

// Defining the type this wants to be (can be any name)
type StreamResponse = {
  addMessage: () => void; // Return void type (nothing)
  message: string;
  // Event gets triggered in "ChatInput.tsx", Textarea is its type, "HTMLTextAreaElement". Returns nothing (void).
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

// Always need to define the fallback values (will have four things to fallback to)
// Also have to pass in the "StreamResponse" as a generic so TypeScripts knows what it is working with.
export const ChatContext = createContext<StreamResponse>({
  // Empty function that does nothing
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  // Responsible with all the logic in sending and receiving msgs
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // For optimistic updates, need access to tRPC utils
  const utils = trpc.useUtils();

  const { toast } = useToast();

  // Keep track of the message to not force re-render. "useRef()" is part of React and CHANGING A REF DOES NOT TRIGGER A RE_RENDER (unlike state variables).
  const backupMessage = useRef("");

  // Not using tRPC (TypeSafe wrapper) for API Route for this part but instead React Query/
  // Reason is to stream back a response from the API to client-side (doesn't work for tRPC, only for JSON)

  const { mutate: sendMessage } = useMutation({
    // Have to passed mutation function since not using tRPC
    // Destructure "message" and then tell TypeScript what type message will be (type string)
    mutationFn: async ({ message }: { message: string }) => {
      // POST fetch request go to endpoint. Created in the "api" folder
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      // Something wrong with the response
      if (!response) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    // Gets called as soon message is sent
    onMutate: async ({ message }) => {
      // First create a backup if anything goes wrong for the message. Roll it back and put it back in the input. "current" is on React Document.
      backupMessage.current = message;
      setMessage(""); // Message state is back to empty due to revert

      // Step 1
      // Cancel any outgoing refetches or outbound calls so they don't overwrite or update
      await utils.getFileMessages.cancel();

      // Step 2
      // Snapshot the previous value we had - making to get API data so can later revert it
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // Step 3
      // Optimistically insert new value or new message right away when sending it
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        // Receive the old data in the callback which can add the current message to
        (old) => {
          // There's no "old" data (edge case), return empty objects
          if (!old) {
            return {
              // ReactQuery handles infinite query always with these two properties and return an object.
              pages: [], // array containing the fetched pages
              pageParams: [], // array containing the page params used to fetch the pages
            };
          }
          // Cloning the old pages using spread (MDN DOC)
          let newPages = [...old.pages];

          // Contain the latest message and not the ones above it in the interval set from latest INFINITE_QUERY_LIMIT messages (which is 10)
          let latestPage = newPages[0]!; // Meed "!" to tell TypeScript that this definitely exists

          // Directly mutate this, immediately put in chat messages. Insert it into the array
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              // The "crypto" interface represents basic cryptography features and allow access to a cryptographically strong random number generator and to cryptographic primitives (MDN). Only should be used in secure contexts (HTTPS) and "randomUUID()" generates a v4 UUID using a cryptographically secure random number generator.
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            // Taking all the messages, moving it up by one and putting the message user just enter in chat window. Basically including it after the new message user sent and shift (that's why we have to spread every message in)
            ...latestPage.messages,
          ];
          // Changing the data above and inserting/injecting the message into newPages array
          newPages[0] = latestPage;

          return {
            // Passing in the old pages
            ...old,
            // Overwrite the pages
            pages: newPages,
          };
        }
      );
      // Add the loading state after adding doing insertion logic with message
      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [], // Return empty array if null or undefined (??)
      };
    },
    onError: (_, __, context) => {
      // Something went wrong so put the message back onto text box
      setMessage(backupMessage.current);
      // Roll back to previous messages
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    // Either successfully fetched or errors and be passed either the data or error.
    onSettled: async () => {
      setIsLoading(false); // No loading at this stage

      // Refresh the entire data when the message has been sent. Restore the integrity of the entire page (no flash or white screen with Next.js).SInce query's data is out of date, invalidating it will force it to refetch in the background
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  // Handle input change... Receives an event "e"
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value); // Get the value of HTML element (text area) when user enters text and then update the "setMessage" state ("e.target.value" is built-in property to get value)
  };

  // addMessage function - send a message over to "src\app\api\message\route.ts" API endpoint
  const addMessage = () => sendMessage({ message });

  return (
    // From React "createContext" docs. The ".Provider" lets you provide the context value to components. "value={}" is what to pass to all components reading the context inside the provider, no matter how deep
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
