/**
 * Sansekai API Client
 *
 * Generic JSON fetcher for api.sansekai.my.id with ISR caching
 * and a single 429 retry. All anime/komik modules use this.
 *
 * Server-side: uses Next.js `next: { revalidate }` for ISR caching.
 * Client-side: plain fetch (TanStack Query handles caching).
 */

const SANSEKAI_BASE = (process.env.SANSEKAI_BASE_URL ?? "https://api2.louiv.me").replace(/\/$/, "");

const isServer = typeof window === "undefined";

function buildFetchOptions(revalidate: number): RequestInit {
  const opts: RequestInit = {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
  };

  // next: { revalidate } is a Next.js server-side extension.
  // On the client, TanStack Query manages caching via staleTime/gcTime,
  // so we don't need (and can't use) the Next.js cache directive.
  if (isServer) {
    (opts as Record<string, unknown>).next = { revalidate };
  }

  return opts;
}

export async function fetchSansekai<T>(path: string, revalidate: number): Promise<T> {
  const opts = buildFetchOptions(revalidate);
  const url = isServer ? `${SANSEKAI_BASE}${path}` : `/api/proxy/sansekai${path}`;
  const res = await fetch(url, opts);

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    const retry = await fetch(url, opts);
    if (!retry.ok) throw new Error(`Sansekai ${retry.status}: ${path}`);
    return retry.json();
  }

  if (!res.ok) throw new Error(`Sansekai ${res.status}: ${path}`);
  return res.json();
}
