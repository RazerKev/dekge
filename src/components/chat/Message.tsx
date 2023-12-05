import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../icons";

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
            invisible: isNextMessageSamePerson 
          }
        )}
      >
        {/* Logo to show for the User or AI */}
        {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
            ) : (
              // Not a user message so it's an AI message
              <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
            )
          }
      </div>
      <div className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
        "order-1 items-end": message.isUserMessage,
        "order-2 items-start": !message.isUserMessage,
      })}>
        {/* AI sent the message or if user did */}
        <div className={cn("px-4 py-2 rounded-lg inline-block", {
          "bg-blue-600 text-white": message.isUserMessage,
          "bg-gray-200 text-gray-900": !message.isUserMessage,
        })}>

        </div>
      </div>
    </div>
  );
};

export default Message;
