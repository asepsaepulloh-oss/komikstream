"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <AlertTriangle className="h-24 w-24 text-destructive" />
      </div>
      <h2 className="mb-4 text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau
        kembali ke beranda.
      </p>
      {error.message && (
        <p className="mb-4 text-sm text-destructive">
          Error: {error.message}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
