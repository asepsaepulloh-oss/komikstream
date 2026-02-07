import { Book, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-primary">404</h1>
      </div>
      <h2 className="mb-4 text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Maaf, halaman yang Anda cari tidak ditemukan. Mungkin telah dihapus,
        namanya telah diubah, atau sementara tidak tersedia.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
        <Link
          href="/komik"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <Book className="h-4 w-4" />
          Jelajahi Komik
        </Link>
      </div>
    </div>
  );
}
