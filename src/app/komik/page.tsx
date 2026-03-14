import { Suspense } from "react";
import type { Metadata } from "next";
import KomikPageClient from "./KomikPageClient";

export const metadata: Metadata = {
  title: "Komik",
  description: "Baca komik manhwa, manhua, dan manga terlengkap dengan update terbaru",
};

// ISR: regenerate the static shell every hour.
// Actual data is fetched client-side via TanStack Query hooks.
export const revalidate = 3600;

// Wrap in Suspense for useSearchParams() in the client component
export default function KomikPage() {
  return (
    <Suspense>
      <KomikPageClient />
    </Suspense>
  );
}
