import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";
interface ChatInputProps {
  isDisabled?: boolean;
}
const ChatInput = ({ isDisabled }: ChatInputProps) => {
  //
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext); // Get the values from "ChatContext" in "<ChatContext.Provider value = ({})> ... </ChatContenxt.Provider>"
  // NOTE - To do this, need to wrap every component that uses this context in ContextProvider which is the component being exported from chat context

  // Textarea will be focused after sending the message in case the use wants to send a second one right away (Can be done with ref).
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow-0 p-4">
            <div className="relative">
              {/* "maxRows={}" does not come preinstalled with Textarea so have to add it in component file with "react-textarea-autosize" dependency added. */}
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                // When We pressed enter, it send instead of opening a new line
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                    // Put the focus back on text area after sending a message with ref
                    textareaRef.current?.focus();
                  }
                }}
                placeholder="Enter your question..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />
              <Button
                // Loading is the message is currently being sent to the API or AI is currently answering the question
                disabled={isLoading || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send message"
                onClick={() => {
                  addMessage(); // From context
                  textareaRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
