import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

interface MessageProps {
  // Each message will have a separate type since the message object from "src\components\chat\Messages.tsx" does not include everything that the Schema message object has
  message: ExtendedMessage; // Need the type for "message" to be the same. One is JSX.Element and other is just string so made new interface inside that is string or JSX.Element
  isNextMessageSamePerson: boolean;
}

const Message = ({ message, isNextMessageSamePerson }: MessageProps) => {
  return (
    <div
      className={cn("flex items-end", {
        // Put the user message to the end if it's the user (Conditional Check)
        "justify-end": message.isUserMessage,
      })}
    >
      {/* Icon for each message */}
      <div
        className={cn(
          "relative flex h-6 w-6 aspect-square items-center justify-center",
          {
            "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
            "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
            // Apply an invisible property if next message is from same person is true
            invisible: isNextMessageSamePerson,
          }
        )}
      >
        {/* Logo to show for the User or AI */}
        {message.isUserMessage ? (
          <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
        ) : (
          // Not a user message so it's an AI message
          <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
        )}
      </div>
      <div
        className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
          "order-1 items-end": message.isUserMessage,
          "order-2 items-start": !message.isUserMessage,
        })}
      >
        {/* AI sent the message or if user did */}
        <div
          className={cn("px-4 py-2 rounded-lg inline-block", {
            "bg-blue-600 text-white": message.isUserMessage,
            "bg-gray-200 text-gray-900": !message.isUserMessage,
            "rounded-br-none":
              !isNextMessageSamePerson && message.isUserMessage,
            "rounded-bl-none":
              !isNextMessageSamePerson && !message.isUserMessage,
          })}
        >
          {/* Display response for user using react-markdown which makes it cleaner and can add bullet points */}
          {/* Since this is vanilla HTML that we don't control, (HTML rendered from Markdown, or pulled from a CMS) use "prose" from Tailwind to add typographic defaults to the vanilla HTML */}
          {/* If message text is a type string since ReactMarkdown only can render and take in string. If message text is JSX.Element, render that separately away from ReactMarkdown */}
          {typeof message.text === "string" ? (
            <ReactMarkdown
              className={cn("prose", {
                "text-zinc-50": message.isUserMessage,
              })}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
          {/* Checking if the message is not loading bc that means it was sent and can get the date */}
          {message.id !== "loading-message" ? (
            // Show the date when the message was sent
            <div className={cn(
              "text-xs select-none mt-2 w-full text-right",
              {
                "text-zinc-500": !message.isUserMessage,
                "text-blue-300": message.isUserMessage
              }
            )}>
              {format(new Date(message.createdAt), "HH:mm")}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Message;
