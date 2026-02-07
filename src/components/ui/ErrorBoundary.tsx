"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export function ErrorDisplay({ 
  title = "Terjadi Kesalahan", 
  message = "Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.",
  showRetry = true 
}: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {showRetry && (
        <button
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
