import { Suspense } from "react";
import { SectionSkeleton } from "@/components/ui";
import { HeroSection } from "@/components/home/HeroSection";
import {
  KomikLatestSection,
  KomikPopularSection,
  AnimeLatestSection,
  AnimeRecommendedSection,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <Suspense fallback={<SectionSkeleton />}>
        <KomikLatestSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <AnimeLatestSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <KomikPopularSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <AnimeRecommendedSection />
      </Suspense>
    </div>
  );
}
