import { NextResponse } from "next/server";

const SANSEKAI_BASE = (process.env.SANSEKAI_BASE_URL ?? "https://api.sansekai.my.id/api").replace(/\/$/, "");

// Simple in-memory cache used to reduce repeated upstream requests
// for identical proxy paths. TTL is in milliseconds.
const cache = new Map<string, { ts: number; status: number; body: string; contentType?: string }>();
const CACHE_TTL = 60 * 1000; // 60s

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function getFallbackPayload(path: string) {
  if (/^\/anime\/(latest|recommended|movie|search|schedule|genre|genres|batch)/.test(path)) {
    return [];
  }

  if (/^\/komik\/(latest|popular|recommended|berwarna|pustaka|search|genre|scroll|genres)/.test(path)) {
    return [];
  }

  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/proxy\/sansekai/, "");
  const target = `${SANSEKAI_BASE}${path}${url.search}`;

  // Serve from cache when available and fresh
  const cacheKey = target;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return new NextResponse(cached.body, {
      status: cached.status,
      headers: {
        "content-type": cached.contentType ?? "application/json",
        "cache-control": `public, s-maxage=${Math.floor(CACHE_TTL / 1000)}`,
      },
    });
  }

  // Try with retries/backoff for transient 429/5xx errors
  const maxAttempts = 3;
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await fetch(target, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });

      const body = await response.text();

      // On success, cache and return
      if (response.ok) {
        cache.set(cacheKey, { ts: Date.now(), status: response.status, body, contentType: response.headers.get("content-type") ?? undefined });
        return new NextResponse(body, {
          status: response.status,
          headers: {
            "content-type": response.headers.get("content-type") ?? "application/json",
            "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        });
      }

      // If upstream returns 429 or 5xx, retry with backoff
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        lastError = `Sansekai ${response.status}: ${target}`;
        const backoff = 100 * Math.pow(3, attempt - 1); // 100ms, 300ms, 900ms
        await delay(backoff);
        continue;
      }

      // For other non-OK statuses, return upstream status and body (no retry)
      return new NextResponse(body, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") ?? "application/json",
          "cache-control": "no-store",
        },
      });
    } catch (error) {
      lastError = error;
      const backoff = 100 * Math.pow(3, attempt - 1);
      await delay(backoff);
      continue;
    }
  }

  // Retries exhausted — cache a short-lived error response to avoid hammering
  const fallback = getFallbackPayload(path);
  const status = 502;
  const body = JSON.stringify({ error: "Sansekai upstream unavailable", details: String(lastError), fallback });
  cache.set(cacheKey, { ts: Date.now(), status, body, contentType: "application/json" });
  return new NextResponse(body, { status, headers: { "content-type": "application/json", "cache-control": "public, s-maxage=30" } });
}

export async function POST(request: Request) {
  return new NextResponse("Method not allowed", { status: 405 });
}
