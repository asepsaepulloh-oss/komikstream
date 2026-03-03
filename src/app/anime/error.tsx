"use client";

import { Film } from "lucide-react";
import { RouteError } from "@/components/ui/RouteError";

export default function AnimeError({
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
      title="Gagal Memuat Anime"
      description="Terjadi kesalahan saat mengambil data anime. Server mungkin sedang sibuk, silakan coba lagi."
      routeHref="/anime"
      routeLabel="Halaman Anime"
      RouteIcon={Film}
    />
  );
}
