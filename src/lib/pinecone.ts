import { Pinecone } from "@pinecone-database/pinecone";

// From Docs
export const pinecone = new Pinecone({
  // The "!" at the end tells TypeScript that this "apiKey" definitely exists
  apiKey: process.env.PINECONE_API_KEY!,
  environment: "gcp-starter",
});
