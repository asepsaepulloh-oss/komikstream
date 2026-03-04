import { Suspense } from "react";
import {
  HeroSection,
  KomikLatestSection,
  KomikPopularSection,
  AnimeLatestSection,
  AnimeRecommendedSection,
} from "@/components/home";
import { SectionSkeleton } from "@/components/ui";

// No `force-dynamic` — each section component fetches data with ISR
// revalidation times (via fetchWithCache), so the page shell is static
// while section data streams in via Suspense and revalidates independently.

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <Suspense fallback={<SectionSkeleton title="Komik Terbaru" />}>
        <KomikLatestSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Anime Terbaru" />}>
        <AnimeLatestSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Komik Populer" />}>
        <KomikPopularSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Anime Rekomendasi" />}>
        <AnimeRecommendedSection />
      </Suspense>
    </div>
  );
}
