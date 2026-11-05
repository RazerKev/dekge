import OpenAI from "openai";

// Configuring OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
