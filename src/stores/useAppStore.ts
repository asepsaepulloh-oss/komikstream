"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bookmark, History } from "@/types";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface AppState {
  // ── Auth & Sync ─────────────────────────────────────────────────
  isSignedIn: boolean;
  syncStatus: SyncStatus;
  setIsSignedIn: (signedIn: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;

  // ── Bookmarks ───────────────────────────────────────────────────
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt" | "userId">) => void;
  removeBookmark: (type: string, itemId: string) => void;
  isBookmarked: (type: string, itemId: string) => boolean;
  replaceBookmarks: (bookmarks: Bookmark[]) => void;

  // ── History ─────────────────────────────────────────────────────
  history: History[];
  addToHistory: (item: Omit<History, "id" | "updatedAt" | "userId">) => void;
  removeFromHistory: (type: string, itemId: string) => void;
  clearHistory: () => void;
  getLastProgress: (type: string, itemId: string) => string | null;
  replaceHistory: (history: History[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Auth & Sync ───────────────────────────────────────────
      isSignedIn: false,
      syncStatus: "idle" as SyncStatus,

      setIsSignedIn: (signedIn) => set({ isSignedIn: signedIn }),
      setSyncStatus: (status) => set({ syncStatus: status }),

      // ── Bookmarks ─────────────────────────────────────────────
      bookmarks: [],

      addBookmark: (bookmark) => {
        const newBookmark: Bookmark = {
          ...bookmark,
          id: crypto.randomUUID(),
          userId: "local",
          createdAt: new Date(),
        };
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));

        // Push to server if signed in (fire-and-forget)
        if (get().isSignedIn) {
          import("@/hooks/useSync").then(({ pushBookmarkToServer }) => {
            pushBookmarkToServer({
              type: bookmark.type as "komik" | "anime",
              itemId: bookmark.itemId,
              title: bookmark.title,
              thumbnail: bookmark.thumbnail,
            });
          });
        }
      },

      removeBookmark: (type, itemId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => !(b.type === type && b.itemId === itemId)),
        }));

        // Remove from server if signed in (fire-and-forget)
        if (get().isSignedIn) {
          import("@/hooks/useSync").then(({ removeBookmarkFromServer }) => {
            removeBookmarkFromServer(type, itemId);
          });
        }
      },

      isBookmarked: (type, itemId) => {
        return get().bookmarks.some((b) => b.type === type && b.itemId === itemId);
      },

      replaceBookmarks: (bookmarks) => set({ bookmarks }),

      // ── History ───────────────────────────────────────────────
      history: [],

      addToHistory: (item) => {
        set((state) => {
          // Remove existing entry if exists
          const filtered = state.history.filter(
            (h) => !(h.type === item.type && h.itemId === item.itemId)
          );

          const newHistory: History = {
            ...item,
            id: crypto.randomUUID(),
            userId: "local",
            updatedAt: new Date(),
          };

          // Add to beginning, keep max 50 items
          return {
            history: [newHistory, ...filtered].slice(0, 50),
          };
        });

        // Push to server if signed in (fire-and-forget)
        if (get().isSignedIn) {
          import("@/hooks/useSync").then(({ pushHistoryToServer }) => {
            pushHistoryToServer({
              type: item.type as "komik" | "anime",
              itemId: item.itemId,
              title: item.title,
              thumbnail: item.thumbnail,
              progress: item.progress,
              progressTitle: item.progressTitle,
            });
          });
        }
      },

      removeFromHistory: (type, itemId) => {
        set((state) => ({
          history: state.history.filter((h) => !(h.type === type && h.itemId === itemId)),
        }));

        // Remove from server if signed in (fire-and-forget)
        if (get().isSignedIn) {
          import("@/hooks/useSync").then(({ removeHistoryFromServer }) => {
            removeHistoryFromServer(type, itemId);
          });
        }
      },

      clearHistory: () => {
        set({ history: [] });

        // Clear on server if signed in (fire-and-forget)
        if (get().isSignedIn) {
          import("@/hooks/useSync").then(({ clearHistoryOnServer }) => {
            clearHistoryOnServer();
          });
        }
      },

      getLastProgress: (type, itemId) => {
        const item = get().history.find((h) => h.type === type && h.itemId === itemId);
        return item?.progress || null;
      },

      replaceHistory: (history) => set({ history }),
    }),
    {
      name: "KuroManga-storage",
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        history: state.history,
      }),
    }
  )
);
