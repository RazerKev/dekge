import { AppRouter } from "@/trpc";
import { createTRPCReact } from "@trpc/react-query"

// Gives us Type Safety across entire application. Expects the type from the 'appRouter' 
export const trpc = createTRPCReact<AppRouter>({});