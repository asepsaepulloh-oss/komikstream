"use client";

import { Bookmark } from "lucide-react";
import { RouteError } from "@/components/ui/RouteError";

export default function BookmarkError({
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
      title="Gagal Memuat Bookmark"
      description="Terjadi kesalahan saat mengambil data bookmark. Silakan coba lagi."
      routeHref="/bookmark"
      routeLabel="Bookmark"
      RouteIcon={Bookmark}
    />
  );
}
