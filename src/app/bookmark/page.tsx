"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { Book, Bookmark as BookmarkIcon, Film, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMounted } from "@/hooks/useMounted";

export default function BookmarkPage() {
  const { bookmarks, removeBookmark } = useAppStore();
  const mounted = useMounted();
  const [filter, setFilter] = useState<"all" | "komik" | "anime">("all");

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filter === "all") return true;
    return b.type === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-3">
          <BookmarkIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Bookmark</h1>
            <p className="text-muted-foreground">
              Koleksi komik dan anime favorit kamu
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(["all", "komik", "anime"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {f === "all" ? "Semua" : f === "komik" ? "Komik" : "Anime"}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group relative">
              <Link
                href={bookmark.type === "komik" ? `/komik/${bookmark.itemId}` : `/anime/${bookmark.itemId}`}
                className="flex flex-col overflow-hidden rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                  {bookmark.thumbnail ? (
                    <Image
                      src={bookmark.thumbnail}
                      alt={bookmark.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {bookmark.type === "komik" ? (
                        <Book className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <Film className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="absolute left-2 top-2">
                    <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground capitalize">
                      {bookmark.type}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-medium">
                    {bookmark.title}
                  </h3>
                </div>
              </Link>
              
              {/* Remove button */}
              <button
                onClick={() => removeBookmark(bookmark.type, bookmark.itemId)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                title="Hapus dari bookmark"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookmarkIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Belum ada bookmark</p>
          <p className="text-sm text-muted-foreground mb-4">
            Simpan komik atau anime favorit kamu di sini
          </p>
          <div className="flex gap-4">
            <Link
              href="/komik"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Book className="h-4 w-4" />
              Jelajahi Komik
            </Link>
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Film className="h-4 w-4" />
              Jelajahi Anime
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
