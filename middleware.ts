import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  // anyone can access
  publicRoutes: [
    "/",
    "/api/webhook",
    "/community",
    "/collection",
    "/tags",
    "/jobs",
  ],
  ignoredRoutes: [
    "/api/webhook",
    "/api/chatgpt",
    "/ask-question",
    "/questions/1",
    "/profile",
  ],
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
