"use client";

import { AlertTriangle, Book, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function KomikError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-destructive/10 mb-6 rounded-full p-8">
          <AlertTriangle className="text-destructive h-16 w-16" />
        </div>
      </div>
      <h2 className="mb-4 text-2xl font-bold">Gagal Memuat Komik</h2>
      <p className="text-muted-foreground mb-4 max-w-md text-lg">
        Terjadi kesalahan saat mengambil data komik. Server mungkin sedang sibuk, silakan coba lagi.
      </p>
      {error.message && (
        <div className="bg-destructive/10 border-destructive/20 mb-8 rounded-lg border px-4 py-3">
          <p className="text-destructive font-mono text-sm">Error: {error.message}</p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <RefreshCw className="h-5 w-5" />
          Coba Lagi
        </button>
        <Link
          href="/komik"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-medium shadow-md transition-all hover:scale-105"
        >
          <Book className="h-5 w-5" />
          Halaman Komik
        </Link>
        <Link
          href="/"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-medium shadow-md transition-all hover:scale-105"
        >
          <Home className="h-5 w-5" />
          Beranda
        </Link>
      </div>
    </div>
  );
}
