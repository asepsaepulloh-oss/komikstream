"use client";

import { getAnimeVideo } from "@/lib/api-client";
import { ArrowLeft, Film, Home, Settings } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface WatchPageProps {
  params: Promise<{ episodeId: string }>;
}

export default function AnimeWatchPage({ params }: WatchPageProps) {
  const searchParams = useSearchParams();
  const { episodeId } = use(params);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reso = searchParams.get("reso") || "480p";
  const resolutions = ["360p", "480p", "720p", "1080p"];

  const loadVideo = useCallback(async () => {
    if (!episodeId) return;

    setLoading(true);
    setError(null);

    try {
      const url = await getAnimeVideo(episodeId, reso);
      setVideoUrl(url);
    } catch {
      setError("Gagal memuat video. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [episodeId, reso]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-background/95 border-border sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => window.history.back()}
              className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>

            {/* Title */}
            <div className="flex-1 px-4 text-center">
              <h1 className="truncate text-sm font-medium">Episode {episodeId}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hover:bg-accent flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                aria-label="Beranda"
              >
                <Home className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Resolution selector */}
      <div className="bg-background border-border border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              <span>Resolusi:</span>
            </div>
            <div className="flex items-center gap-2">
              {resolutions.map((r) => (
                <Link
                  key={r}
                  href={`/anime/watch/${episodeId}?reso=${r}`}
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                    reso === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-black">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-lg font-medium text-white">Memuat video...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Film className="text-muted-foreground/50 mb-4 h-16 w-16" />
            <p className="text-lg font-medium text-white">{error}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Coba resolusi yang berbeda atau refresh halaman
            </p>
          </div>
        ) : videoUrl ? (
          <div className="aspect-video w-full max-w-5xl">
            <iframe
              src={videoUrl}
              className="h-full w-full"
              title="Video player"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Film className="text-muted-foreground/50 mb-4 h-16 w-16" />
            <p className="text-lg font-medium text-white">Video tidak tersedia</p>
            <p className="text-muted-foreground mt-2 text-sm">Coba resolusi yang berbeda</p>
          </div>
        )}
      </main>

      {/* Footer info */}
      <div className="bg-background border-border border-t">
        <div className="container mx-auto px-4 py-4">
          <p className="text-muted-foreground text-center text-xs">
            Jika video tidak bisa diputar, coba ganti resolusi atau gunakan browser lain.
          </p>
        </div>
      </div>
    </div>
  );
}
