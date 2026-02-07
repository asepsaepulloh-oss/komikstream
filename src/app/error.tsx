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
        <AlertTriangle className="text-destructive h-24 w-24" />
      </div>
      <h2 className="mb-4 text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke beranda.
      </p>
      {error.message && <p className="text-destructive mb-4 text-sm">Error: {error.message}</p>}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
        <Link
          href="/"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
