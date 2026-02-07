"use client";

import { ArrowLeft, Film, Home, Settings } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Fetch video via API route (server-side)
async function fetchAnimeVideo(episodeId: string, reso: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/anime/video?chapterUrlId=${episodeId}&reso=${reso}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

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
      const url = await fetchAnimeVideo(episodeId, reso);
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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Back button */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>

            {/* Title */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-sm font-medium truncate">
                Episode {episodeId}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Resolution selector */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>Resolusi:</span>
            </div>
            <div className="flex items-center gap-2">
              {resolutions.map((r) => (
                <Link
                  key={r}
                  href={`/anime/watch/${episodeId}?reso=${r}`}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-black">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-lg font-medium text-white">Memuat video...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Film className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-white">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Coba resolusi yang berbeda atau refresh halaman
            </p>
          </div>
        ) : videoUrl ? (
          <div className="w-full max-w-5xl aspect-video">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Film className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-white">Video tidak tersedia</p>
            <p className="text-sm text-muted-foreground mt-2">
              Coba resolusi yang berbeda
            </p>
          </div>
        )}
      </main>

      {/* Footer info */}
      <div className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Jika video tidak bisa diputar, coba ganti resolusi atau gunakan browser lain.
          </p>
        </div>
      </div>
    </div>
  );
}
