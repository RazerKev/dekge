// This ChatContext "Providers" wraps the components together.

// Technically isn't a component but should be located with other chat files
import React, { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

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

  const { toast } = useToast();

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
