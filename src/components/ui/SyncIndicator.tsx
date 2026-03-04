"use client";

import { useAppStore, type SyncStatus } from "@/stores/useAppStore";
import { Cloud, CloudOff, Loader2, Check } from "lucide-react";

const statusConfig: Record<SyncStatus, { icon: typeof Cloud; text: string; className: string }> = {
  idle: {
    icon: CloudOff,
    text: "Offline — data disimpan di perangkat ini",
    className: "text-muted-foreground",
  },
  syncing: {
    icon: Loader2,
    text: "Menyinkronkan...",
    className: "text-primary",
  },
  synced: {
    icon: Check,
    text: "Tersinkronkan dengan server",
    className: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: CloudOff,
    text: "Gagal sinkronisasi — data tetap tersimpan lokal",
    className: "text-destructive",
  },
};

export function SyncIndicator() {
  const syncStatus = useAppStore((s) => s.syncStatus);
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  // Don't show indicator for guest users
  if (!isSignedIn && syncStatus === "idle") return null;

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 text-xs ${config.className}`}>
      <Icon className={`h-3.5 w-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
      <span>{config.text}</span>
    </div>
  );
}
