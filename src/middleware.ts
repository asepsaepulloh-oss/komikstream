import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";
import { checkRateLimit, API_RATE_LIMIT, SEARCH_RATE_LIMIT } from "@/lib/rate-limit";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/bookmark(.*)",
  "/history(.*)",
  "/api/bookmarks(.*)",
  "/api/history(.*)",
]);

// Define public routes that should skip Clerk middleware entirely
const isPublicApiRoute = createRouteMatcher(["/api/webhooks(.*)", "/api/health"]);

// Routes that should be rate-limited
const isApiRoute = createRouteMatcher(["/api/(.*)"]);
const isSearchRoute = createRouteMatcher(["/api/search(.*)"]);

// Clerk middleware handler — clerkMiddleware() returns a standard Next.js
// middleware function (req, event) => Response, but its *callback* receives
// (auth, req). The type mismatch is in the callback signature, not the
// outer function, so we can safely call it as middleware.
const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

/**
 * Extract client IP from request headers.
 * Vercel sets x-forwarded-for; fallback to x-real-ip or "unknown".
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Export the appropriate middleware based on configuration
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Skip middleware for webhook routes (they have their own verification)
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (isApiRoute(req)) {
    const ip = getClientIp(req);
    const config = isSearchRoute(req) ? SEARCH_RATE_LIMIT : API_RATE_LIMIT;
    const key = `${ip}:${isSearchRoute(req) ? "search" : "api"}`;
    const result = checkRateLimit(key, config);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }

    // For allowed requests, add rate limit headers to the response
    // (applied after Clerk middleware or pass-through below)
  }

  if (isClerkConfigured()) {
    return clerkHandler(req, event);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
