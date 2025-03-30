// Handle all requests made to this API Endpoint

import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";

import { OpenAIStream, StreamingTextResponse } from "ai";

// Only POST requests to this endpoint
export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  // Need access to the body from "ChatContext.tsx"
  const body = await req.json(); // Getting access to request body in Next.js 13

  // Make sure user is authenticated
  const { getUser } = getKindeServerSession(); // Destructure "getUser" from "getKindeServerSession()"
  const user = getUser();

  // Destructure id but will rename it to "userId" to prevent naming issue if using id.
  const { id: userId } = user;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Getting access to body content - Zod comes in to make sure we always have the data validated
  // ".parse(body)" method parse data & validates it against schema from other file. Returns parsed value if data matches the schema (the body content)
  const { fileId, message } = SendMessageValidator.parse(body);

  // Find the file in the database that the current logged in user owns
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  // There's a file that the user wants to add a message too
  // ".message." was created and added in Prisma (db)
  await db.message.create({
    // Passed some "data" for message to be created
    data: {
      text: message,
      isUserMessage: true, // always be true since user request API route
      userId,
      fileId,
    },
  });

  // Semantic Query - indexing entire PDF first; then based on the question can find parts of the PDF in text that are most relevant to that question by their similarity; mathematically, calculating th closest vector to one another. Asked a question from PDF Doc, get parts close to the question.

  //-------------------------------------------------------------

  // See which page of the PDF is most relevant to the question the user is asking and retrieve that page for context and send it to the large language model (LLM) together.

  // Step 1: Vectorized message - Using the exact same embedded method from the "src\app\api\uploadthing\core.ts" to generate a vector. Uses the OpenAI API to generate embeddings for a given text. Copy and paste from "...\uploadthing\core.ts"
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY, // Passed in the OpenAI key from ".env" file
  });

  // Vectorized and index entire document
  // const pinecone = await getPineconecClient()
  const pineconeIndex = pinecone.Index("dekge"); // The main name for the index on Pinecone

  // Search or vector store for the most relevant PDF page to this message that we just create a vector from.
  // "fromExistingIndex" is obtained from "pineconeIndex"
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings,{
    pineconeIndex,
    // Cannot use namespace from pinecone since it's not the free tier anymore
    // namespace: file.id,

    // Use metadata filtering instead
    filter: {"fileId": fileId}
  });

  // Get results from Pinecone. Passed in message & how many results or PDF Pages we want to get back (4 closest result to message to ensure good results)... Could add more messages, higher value when they upgrade to PRO
  const results = await vectorStore.similaritySearch(message, 4);

  // Chat History - search for the previous message that were exchanged in the chat
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc", // ascending order
    },
    take: 6, // Takes the last 6 messages
  });

  // Send them to OpenAI to answer the messages but OpenAI expects a really certain format
  // Each object being mapped over returns a object implicitly(wrap the object in "()" for that)
  // Format messages to be sent to OpenAI
  const formattedPrevMessages = prevMessages.map((msg: { isUserMessage: any; text: any; }) => ({
    // If the role is user Message, then the role should be "user"
    // Need "as const" to prevent TypeScript error.
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    // Content is message text that was exchanged.
    content: msg.text,
  }));

  // Formatted messages ready to be sent to OpenAI for a response (need to create "openai" utility for it to be called)
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true, // Going to stream this response to the front end in real time

    // Want the previous messages that were exchanged in the chat. Have all messages attached previously and the AI knows what it means and in a specific format. (This part is copied and pasted from GitHub)... teaches how to prompt more than how to code.
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message: { role: string; content: any; }) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  });

  // Return a real-time stream back to the client. Main reason why one can't use tRPC
  // Cast the response to any to handle type incompatibility between OpenAI SDK v4 and the ai package
  const stream = OpenAIStream(response as any, {
    // Fully done stream of the response and sending everything back in chunks to client, get back the onComplete response as one long sentence as the completion and can put it as the message.
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          // Link the "fileId" and "userId" together so we know the user and the file
          fileId,
          userId,
        },
      });
    },
  });

  // Returning the stream from API Route to the client and consuming it as real-time as the AI model is generating the output
  return new StreamingTextResponse(stream);
};
