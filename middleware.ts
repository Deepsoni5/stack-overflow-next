import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  // anyone can access
  publicRoutes: [
    "/",
    "/api/clerk",
    "/community",
    "question/:id",
    "/collection",
    "/tags",
    "/tags/:id",
    "/jobs",
  ],
  ignoredRoutes: ["/api/clerk", "/api/chatgpt"],
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
