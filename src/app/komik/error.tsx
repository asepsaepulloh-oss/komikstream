"use client";

import { Book } from "lucide-react";
import { RouteError } from "@/components/ui/RouteError";

export default function KomikError({
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
      title="Gagal Memuat Komik"
      description="Terjadi kesalahan saat mengambil data komik. Server mungkin sedang sibuk, silakan coba lagi."
      routeHref="/komik"
      routeLabel="Halaman Komik"
      RouteIcon={Book}
    />
  );
}
