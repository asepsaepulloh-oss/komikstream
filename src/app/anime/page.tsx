import { Suspense } from "react";
import type { Metadata } from "next";
import AnimePageClient from "./AnimePageClient";

export const metadata: Metadata = {
  title: "Anime",
  description: "Nonton anime subtitle Indonesia terlengkap dengan update terbaru",
};

// ISR: regenerate the static shell every hour.
// Actual data is fetched client-side via TanStack Query hooks.
export const revalidate = 3600;

// Wrap in Suspense for useSearchParams() in the client component
export default function AnimePage() {
  return (
    <Suspense>
      <AnimePageClient />
    </Suspense>
  );
}
