import {z} from "zod"

// The data here should be received from "src\app\api\message\route.ts" endpoint, if not return an error.
// The API endpoint above must go through this file to not receive an error.

export const SendMessageValidator = z.object({
    // When calling the API endpoint in POST request body, expect:
    fileId: z.string(),
    message: z.string()
    // If not, errors...
})
