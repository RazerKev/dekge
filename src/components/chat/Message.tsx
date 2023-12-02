import { cn } from "@/lib/utils"
import { ExtendedMessage } from "@/types/message";

interface MessageProps {
  // Each message will have a separate type since the message object from "src\components\chat\Messages.tsx" does not include everything that the Schema message object has
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = ({message, isNextMessageSamePerson}: MessageProps) => {
    return <div className={cn("flex items-end")}></div>
}

export default Message