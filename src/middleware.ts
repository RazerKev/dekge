import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server";

// Very important file to block access for users to certain pages if they are not logged in
export const config = {
  // Enforce by Next.js
  // Any path under dashboard and auth-callback is protected so these pages can only be accessed from logged in user.
  matcher: ["/dashboard/:path*", "/auth-callback"],
};

export default authMiddleware;
