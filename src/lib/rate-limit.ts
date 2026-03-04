/**
 * Simple in-memory sliding window rate limiter for Edge Runtime.
 *
 * Designed for Vercel Edge Functions / Next.js Middleware. Uses a Map with
 * automatic cleanup to prevent memory leaks. Each unique key (typically IP)
 * gets a fixed window of requests.
 *
 * Limitations:
 * - In-memory only: does NOT share state across Vercel Edge instances.
 *   This means the effective rate limit is per-instance, not global.
 *   For stricter limits, use Vercel KV or Upstash Redis.
 * - Suitable for basic abuse prevention, not DDoS protection.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Unique identifier (e.g. IP address or `IP:route`)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and metadata
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  // No existing entry or window expired -> create new window
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Window still active
  entry.count++;

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Preset Configurations ─────────────────────────────────────────

/** General API routes: 60 requests per minute */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
};

/** Search endpoints: 20 requests per minute (more expensive) */
export const SEARCH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowSeconds: 60,
};

/** Auth-related endpoints: 10 requests per minute */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};
