/**
 * Cache Configuration for ISR (Incremental Static Regeneration)
 *
 * Optimized for Cloudflare Workers via OpenNext.
 * Route-level revalidation (export const revalidate = N in pages) is used
 * for ISR. Tag-based revalidation is NOT supported without a KV binding.
 */

export const CACHE_TIMES = {
  // Latest content - refreshes frequently
  LATEST: 5 * 60, // 5 minutes

  // Popular/Recommended - changes less often
  POPULAR: 15 * 60, // 15 minutes

  // Detail pages - relatively static
  DETAIL: 30 * 60, // 30 minutes

  // Chapter images - very static
  IMAGES: 60 * 60, // 1 hour

  // Search results - short cache
  SEARCH: 3 * 60, // 3 minutes

  // Static content
  STATIC: 24 * 60 * 60, // 24 hours
} as const;

/**
 * Generate no-cache options for dynamic content
 */
export function getNoCacheOptions(): RequestInit {
  return {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  };
}
