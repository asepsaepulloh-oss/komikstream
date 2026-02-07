"use client";

import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { Book, Clock, Film, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMounted } from "@/hooks/useMounted";

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useAppStore();
  const mounted = useMounted();
  const [filter, setFilter] = useState<"all" | "komik" | "anime">("all");

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter((h) => {
    if (filter === "all") return true;
    return h.type === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">History</h1>
              <p className="text-muted-foreground">
                Riwayat baca dan tonton kamu
              </p>
            </div>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Hapus semua history?")) {
                  clearHistory();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Semua
            </button>
          )}
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

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              {/* Thumbnail */}
              <Link
                href={item.type === "komik" ? `/komik/${item.itemId}` : `/anime/${item.itemId}`}
                className="relative flex-shrink-0 aspect-[2/3] w-16 rounded-lg overflow-hidden bg-muted"
              >
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {item.type === "komik" ? (
                      <Book className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Film className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={item.type === "komik" ? `/komik/${item.itemId}` : `/anime/${item.itemId}`}
                  className="block"
                >
                  <h3 className="font-medium truncate hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
                    {item.type}
                  </span>
                  {item.progressTitle && (
                    <span className="text-sm text-muted-foreground truncate">
                      {item.progressTitle}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(item.updatedAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={
                    item.type === "komik"
                      ? `/komik/${item.itemId}/${item.progress}`
                      : `/anime/watch/${item.progress}`
                  }
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Lanjutkan
                </Link>
                <button
                  onClick={() => removeFromHistory(item.type, item.itemId)}
                  className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Hapus dari history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Belum ada history</p>
          <p className="text-sm text-muted-foreground mb-4">
            Riwayat baca dan tonton akan muncul di sini
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
