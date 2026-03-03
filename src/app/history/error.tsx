"use client";

import { Clock } from "lucide-react";
import { RouteError } from "@/components/ui/RouteError";

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Gagal Memuat Riwayat"
      description="Terjadi kesalahan saat mengambil riwayat bacaan. Silakan coba lagi."
      routeHref="/history"
      routeLabel="Riwayat"
      RouteIcon={Clock}
    />
  );
}
