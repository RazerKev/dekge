// Each message will have a separate type since the message object from "src\components\chat\Messages.tsx" does not include everything that the Schema message object has

import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

// Infer the output of any route that we have in tRPC (on Doc)
type RouterOutput = inferRouterOutputs<AppRouter>

// Have what tRPC returns from API endpoint; if it changes, then the type will automatically change making it maintainable.
type Messages = RouterOutput["getFileMessages"]["messages"]

// Create new type similar to original but without the specified properties. Omitting the "text" property for Messages object.
// Passing in "[number]" will get only one instance of the Messages array
type OmitText = Omit<Messages[number], "text">

// Want string and JSX element foe the text part. Accommodate for the Loader2
type ExtendedText = {
    text: string | JSX.Element
}

// The "&" is combining the OmitText & ExtendedText
export type ExtendedMessage = OmitText & ExtendedText