"use client";

import { getImageUrl } from "@/lib/utils";
import { ImageOff, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MangaImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function MangaImage({ src, alt, priority = false }: MangaImageProps) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setHasError(false);
    setRetryCount((prev) => prev + 1);
  };

  if (hasError) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 bg-gray-900 py-8">
        <ImageOff className="h-10 w-10 text-gray-500" />
        <p className="text-sm text-gray-400">Gagal memuat gambar</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <Image
      key={retryCount}
      src={getImageUrl(src)}
      alt={alt}
      width={1000}
      height={1500}
      className="h-auto w-full"
      priority={priority}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}
