"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { Bookmark, History } from "@/types";

// Dynamically import useAuth to avoid hard dependency on Clerk.
// When Clerk isn't configured, we use a no-op fallback that always
// returns { isSignedIn: false, isLoaded: true } so the hook call
// order stays consistent (satisfying React's rules-of-hooks).
type AuthResult = { isSignedIn: boolean | undefined; isLoaded: boolean };

const noopAuth = (): AuthResult => ({ isSignedIn: false, isLoaded: true });

let useAuthHook: () => AuthResult = noopAuth;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require("@clerk/nextjs");
  if (clerk.useAuth) {
    useAuthHook = clerk.useAuth;
  }
} catch {
  // Clerk not available — sync disabled, noopAuth remains
}

/**
 * Fetch bookmarks from the server API.
 * Returns null if the request fails (non-auth errors are swallowed).
 */
async function fetchServerBookmarks(): Promise<Bookmark[] | null> {
  try {
    const res = await fetch("/api/bookmarks");
    if (!res.ok) return null;
    const data = await res.json();
    return data.bookmarks ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch history from the server API.
 */
async function fetchServerHistory(): Promise<History[] | null> {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) return null;
    const data = await res.json();
    return data.history ?? null;
  } catch {
    return null;
  }
}

/**
 * Push a local bookmark to the server.
 */
export async function pushBookmarkToServer(
  bookmark: Pick<Bookmark, "type" | "itemId" | "title" | "thumbnail">
): Promise<boolean> {
  try {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookmark),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Remove a bookmark from the server.
 */
export async function removeBookmarkFromServer(type: string, itemId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/bookmarks?type=${encodeURIComponent(type)}&itemId=${encodeURIComponent(itemId)}`,
      {
        method: "DELETE",
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Push a local history entry to the server.
 */
export async function pushHistoryToServer(
  entry: Pick<History, "type" | "itemId" | "title" | "thumbnail" | "progress" | "progressTitle">
): Promise<boolean> {
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Remove a history entry from the server.
 */
export async function removeHistoryFromServer(type: string, itemId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/history?type=${encodeURIComponent(type)}&itemId=${encodeURIComponent(itemId)}`,
      {
        method: "DELETE",
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Clear all history on the server.
 */
export async function clearHistoryOnServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/history?clearAll=true", { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Merge server bookmarks with local bookmarks.
 * Strategy: server wins for duplicates (same type+itemId), local-only items are preserved
 * and pushed to server.
 */
function mergeBookmarks(
  local: Bookmark[],
  server: Bookmark[]
): { merged: Bookmark[]; localOnly: Bookmark[] } {
  const serverMap = new Map<string, Bookmark>();
  for (const b of server) {
    serverMap.set(`${b.type}:${b.itemId}`, b);
  }

  const localOnly: Bookmark[] = [];
  for (const b of local) {
    const key = `${b.type}:${b.itemId}`;
    if (!serverMap.has(key)) {
      localOnly.push(b);
    }
  }

  // Server items first (source of truth), then local-only items
  const merged = [...server, ...localOnly];
  return { merged, localOnly };
}

/**
 * Merge server history with local history.
 * Strategy: server wins for duplicates (same type+itemId), local-only items preserved.
 * For duplicates, we keep the one with the more recent updatedAt.
 */
function mergeHistory(
  local: History[],
  server: History[]
): { merged: History[]; localOnly: History[] } {
  const serverMap = new Map<string, History>();
  for (const h of server) {
    serverMap.set(`${h.type}:${h.itemId}`, h);
  }

  const localOnly: History[] = [];
  for (const h of local) {
    const key = `${h.type}:${h.itemId}`;
    const serverItem = serverMap.get(key);
    if (!serverItem) {
      localOnly.push(h);
    } else {
      // If local has more recent progress, update server item
      const localTime = new Date(h.updatedAt).getTime();
      const serverTime = new Date(serverItem.updatedAt).getTime();
      if (localTime > serverTime) {
        // Local is newer — push update to server
        localOnly.push(h);
        serverMap.set(key, h); // Use local version in merged result
      }
    }
  }

  // Rebuild merged: server items (possibly overridden) + truly local-only
  const seenKeys = new Set<string>();
  const merged: History[] = [];

  // Server items (with any overrides from local)
  for (const [key, h] of serverMap) {
    seenKeys.add(key);
    merged.push(h);
  }

  // Local-only items that don't exist on server
  for (const h of localOnly) {
    const key = `${h.type}:${h.itemId}`;
    if (!seenKeys.has(key)) {
      merged.push(h);
    }
  }

  // Sort by updatedAt desc, limit to 50
  merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    merged: merged.slice(0, 50),
    localOnly: localOnly.filter((h) => {
      const key = `${h.type}:${h.itemId}`;
      return (
        !serverMap.has(key) ||
        new Date(h.updatedAt).getTime() > new Date(serverMap.get(key)!.updatedAt).getTime()
      );
    }),
  };
}

/**
 * Hook that syncs local Zustand store with server DB when user is signed in.
 *
 * Usage: Call this once in a high-level component (e.g., layout or Navbar).
 * It will:
 * 1. Detect if user is signed in via Clerk
 * 2. Pull bookmarks/history from the server
 * 3. Merge with local state (server wins for conflicts)
 * 4. Push local-only items to the server
 * 5. Update syncStatus in the store
 */
export function useSync() {
  const hasSynced = useRef(false);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const setIsSignedIn = useAppStore((s) => s.setIsSignedIn);
  const replaceBookmarks = useAppStore((s) => s.replaceBookmarks);
  const replaceHistory = useAppStore((s) => s.replaceHistory);

  // Always call the auth hook (noopAuth if Clerk is unavailable)
  const { isSignedIn, isLoaded } = useAuthHook();

  const doSync = useCallback(async () => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    setSyncStatus("syncing");

    try {
      // Get current local state
      const localBookmarks = useAppStore.getState().bookmarks;
      const localHistory = useAppStore.getState().history;

      // Fetch from server in parallel
      const [serverBookmarks, serverHistory] = await Promise.all([
        fetchServerBookmarks(),
        fetchServerHistory(),
      ]);

      // Merge bookmarks
      if (serverBookmarks) {
        const { merged, localOnly } = mergeBookmarks(localBookmarks, serverBookmarks);
        replaceBookmarks(merged);

        // Push local-only items to server (fire-and-forget)
        for (const b of localOnly) {
          pushBookmarkToServer({
            type: b.type as "komik" | "anime",
            itemId: b.itemId,
            title: b.title,
            thumbnail: b.thumbnail,
          });
        }
      }

      // Merge history
      if (serverHistory) {
        const { merged, localOnly } = mergeHistory(localHistory, serverHistory);
        replaceHistory(merged);

        // Push local-only / newer items to server (fire-and-forget)
        for (const h of localOnly) {
          pushHistoryToServer({
            type: h.type as "komik" | "anime",
            itemId: h.itemId,
            title: h.title,
            thumbnail: h.thumbnail,
            progress: h.progress,
            progressTitle: h.progressTitle,
          });
        }
      }

      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, [setSyncStatus, replaceBookmarks, replaceHistory]);

  useEffect(() => {
    if (!isLoaded) return;

    setIsSignedIn(isSignedIn ?? false);

    if (isSignedIn) {
      doSync();
    } else {
      // User signed out — reset sync state
      hasSynced.current = false;
      setSyncStatus("idle");
    }
  }, [isSignedIn, isLoaded, doSync, setIsSignedIn, setSyncStatus]);

  // Reset on sign-out so next sign-in re-syncs
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn, isLoaded]);
}
