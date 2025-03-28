// import { createNextRouteHandler } from "uploadthing/next";
// Updated import from updating uploadthing to from V6 to V7
import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
