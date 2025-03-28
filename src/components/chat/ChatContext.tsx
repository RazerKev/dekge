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
// Also have to pass in the "StreamResponse" as a generic (can be named anything) so TypeScripts knows what it is working with.
export const ChatContext = createContext<StreamResponse>({
  // Empty function that does nothing
  addMessage: () => {},
  message: "",
  handleInputChange: () =>  {},
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
    // Required by TanStack Query & "mutate" above passes to mutationFn as parm object
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
    // Gets called as soon message is sent. Function will fire before the mutation function is fired and is passed the same variables the mutation function would receive
    onMutate: async ({ message }) => {
      // First create a backup if anything goes wrong for the message. Roll it back and put it back in the input. "current" is on React Document.
      backupMessage.current = message;
      setMessage(""); // Message state is back to empty due to revert

      // Step 1
      // Cancel any outgoing refetch or outbound calls so they don't overwrite or update
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
    // Get a response back from API that will contain readable stream that can be put into the message as we get it to have real-time feeling
    // "stream" data of bit by bit is available after successful fetch request of msgs
    onSuccess: async (stream) => {
      setIsLoading(false); // AI should not be loading

      // Stream could be no so handle this edge case
      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      // Can assume stream exists. Creates a reader and locks the stream to it.
      const reader = stream.getReader();
      // Decoded it since it's encoded
      const decoder = new TextDecoder();
      // Keep track if we're done
      let done = false;

      // Want the response & accumulate the response once we're done
      let accResponse = "";

      // Read the content of the stream we get back in real time
      while (!done) {
        // Read the stream first by destructuring "value" & "done". If chuck is available, promise will be fulfilled with an object of "{ value: theChunk, done: false }"; if stream become closed, promise will be fulfilled with an object of "{ value: undefined, done: true }". "done" is true if stream has already given you all its data. "value" is undefined when done is true.
        const { value, done: doneReading } = await reader.read(); // Returns a Promise
        done = doneReading;
        // console.log("The value destructure: ", value);

        // Get string content of this stream of chunk that we are mapping over. Actual string that AI gives us that we now want to add to msgs & to make it show in real time.
        const chunkValue = decoder.decode(value);
        // console.log("Chuck Value: ", chunkValue);

        // Accumulated Response accumulated with chunk values decoded
        accResponse += chunkValue;
        // console.log("Accumulated Response: ", accResponse);

        // Append chunk to the actual message so message is in chat in real time
        // Use "setInfiniteData()" so we can add to the data that we can see in chat window

        // NOTE: This is all being streamed in, in real time, letter by letter as the chunks come in. Need new reference for each time we update the infinite data which chunk value for React to know that it should display it. Can't do it with the same reference, wouldn't work.
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          // Receiving the old data
          (old) => {
            // console.log("Old Page: ", old);
            // No data found
            if (!old) return { pages: [], pageParams: [] };

            // "pages.some" returns a boolean. For each page we get from the old data, check for any page, for any message if there is a message with ID of "ai-response" if there is one (which will be last one, bottom of page after user's msg), then we will not add a new one. Once we send user's msg, AI response will be added to chat window in real-time. Check if each 'chunk' that we add to it, if there's a message, and if there is, not going to create a second new message but instead, add to it as we get the chunk value. If there isn't, then we're going to create one for the very first chunk (there will always be a message)
            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            // map over the old pages first
            let updatedPages = old.pages.map((page) => {
              // Check if this is the first page which contains last msg since order of entire msg is reverse.
              if (page === old.pages[0]) {
                // console.log("First page: ", page);
                // console.log("Old Pages, index [0]: ", old.pages[0]);
                let updatedMessages;

                // If AI Response is not yet created, then create it, once
                // console.log("Did AI Response Created: ", isAiResponseCreated);
                if (!isAiResponseCreated) {
                  // Create a new reference for each entry; important for react differing algo to pick up the change later so we can see it on screen
                  updatedMessages = [
                    // Array with msg object
                    // Create a new message
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response", // hardcoded "ai-response" must match
                      text: accResponse,
                      isUserMessage: false,
                    },
                    // Append all the other messages that was there before with spread "..."
                    ...page.messages,
                  ];
                  // console.log("Updated Messages: ", updatedMessages);
                } else {
                  // If there is already an AI Response, then add to existing response (chunk)
                  updatedMessages = page.messages.map((message) => {
                    // console.log("Mapping over each message: ", message);
                    if (message.id === "ai-response") {
                      // console.log("The message.id is === ai-response. Here's the message: ", message, " and text: ", accResponse);
                      return {
                        // Return the message properties that were there before by spreading it in the msg but change text to accumulated response ("accResponse")
                        ...message,
                        text: accResponse, // return everything but changed text, appending it in real-time
                      };
                    }
                    // If not AI response, return message unchanged
                    // console.log("1st return message unchanged: ", message);
                    return message;
                  });
                }
                // console.log("2nd return messages overridden: ", updatedMessages);
                return {
                  ...page, // Keeping the properties
                  // Only override the messages that's updated from above
                  messages: updatedMessages,
                };
              }
              // Returning the other pages that will stay the same; only the first page with the last 10 or 11 msg set from "src\config\infinite-query.ts" option will be updated
              // console.log("3rd - return page", page);
              return page;
            });
            // Spread in all old values and override the pages to be the updated pages
            // console.log("4th - final return: ", updatedPages);
            return { ...old, pages: updatedPages };
          }
        );
      }
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
    // From React "createContext" docs. The ".Provider" lets you provide the context value to components. "value={}" is what to pass to all components reading the context inside the provider, no matter how deep. Need ".Provider" for context to be applied and basically tells React "if any component (<Messages/> and <ChatInput/> from "src\components\chat\ChatWrapper.tsx") inside <ChatContext.Provider>...<ChatContext.Provider> asks for ChatContext, give them these values below."
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
