import { Film, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Format URL Berubah",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegacyWatchPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Film className="text-muted-foreground/50 mb-6 h-20 w-20" />
      <h1 className="mb-3 text-2xl font-bold">Format URL Telah Berubah</h1>
      <p className="text-muted-foreground mb-2 max-w-md text-sm">
        Halaman ini telah dipindahkan ke format URL baru untuk pengalaman menonton yang lebih baik,
        termasuk navigasi antar episode.
      </p>
      <p className="text-muted-foreground mb-8 max-w-md text-sm">
        Silakan kunjungi halaman anime untuk menemukan episode yang ingin Anda tonton.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/anime"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          Jelajahi Anime
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
