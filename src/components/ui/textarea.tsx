"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Import types but not the actual component
import type { TextareaAutosizeProps } from "react-textarea-autosize";

// Dynamically import TextareaAutosize with no SSR
const TextareaAutosize = dynamic(
  () => import("react-textarea-autosize"),
  { ssr: false }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps & TextareaProps>(
  ({ className, ...props }, ref) => {
    // Track if we're on the client
    const [isClient, setIsClient] = React.useState(false);
    
    // After mount, we're on the client
    React.useEffect(() => {
      setIsClient(true);
    }, []);
    
    // Shared styles for both regular textarea and TextareaAutosize
    const sharedStyles = cn(
      "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      isClient ? "focus-visible:ring-dark-purple" : "focus-visible:ring-ring",
      className
    );
    
    // Use regular textarea for server rendering, TextareaAutosize for client
    if (!isClient) {
      return (
        <textarea
          className={sharedStyles}
          ref={ref}
          {...props}
        />
      );
    }
    
    // On client, use the auto-resizing textarea
    return (
      <TextareaAutosize
        className={sharedStyles}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
