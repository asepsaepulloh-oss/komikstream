import {
  HeroSection,
  KomikLatestSection,
  KomikPopularSection,
  AnimeLatestSection,
  AnimeRecommendedSection,
} from "@/components/home";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: siteConfig.url,
  },
};

// ISR: regenerate the static shell every hour.
// The actual data is fetched client-side via TanStack Query hooks,
// so the Worker only serves a lightweight static HTML shell.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* All sections are "use client" components that fetch data
          via TanStack Query hooks — no server-side data fetching,
          no Suspense streaming needed. Each section renders its
          own skeleton while loading. */}
      <KomikLatestSection />
      <AnimeLatestSection />
      <KomikPopularSection />
      <AnimeRecommendedSection />
    </div>
  );
}
