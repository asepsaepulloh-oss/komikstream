import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/bookmark(.*)",
  "/history(.*)",
  "/api/bookmarks(.*)",
  "/api/history(.*)",
]);

// Define public routes that should skip Clerk middleware entirely
const isPublicApiRoute = createRouteMatcher(["/api/webhooks(.*)"]);

// Clerk middleware handler
const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// Simple pass-through middleware when Clerk is not configured
function simpleMiddleware() {
  return NextResponse.next();
}

// Export the appropriate middleware based on configuration
export default function middleware(req: NextRequest) {
  // Skip middleware for webhook routes (they have their own verification)
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  if (isClerkConfigured()) {
    // @ts-expect-error - Clerk middleware has different signature
    return clerkHandler(req);
  }
  return simpleMiddleware();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
