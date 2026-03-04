import { Card } from "@/components/ui";
import {
  getKomikLatest,
  getKomikPopular,
  getAnimeLatest,
  getAnimeRecommended,
} from "@/lib/api-cached";
import type { Komik, Anime } from "@/types";
import { ArrowRight, Film, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

interface SectionWrapperProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  linkText: string;
  children: React.ReactNode;
}

function SectionWrapper({
  title,
  description,
  icon,
  href,
  linkText,
  children,
}: SectionWrapperProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
          <Link
            href={href}
            className="text-primary group flex items-center gap-1 text-sm hover:underline"
          >
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

export async function KomikLatestSection() {
  let komikLatest: Komik[];
  try {
    komikLatest = await getKomikLatest("mirror");
  } catch {
    // Graceful degradation: render empty so prerender/ISR succeeds
    // even when external API is unreachable (e.g. 403 from build server IP)
    komikLatest = [];
  }

  if (komikLatest.length === 0) return null;

  return (
    <SectionWrapper
      title="Komik Terbaru"
      description="Update chapter terbaru hari ini"
      icon={<Sparkles className="text-primary h-5 w-5" />}
      href="/komik"
      linkText="Lihat Semua"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {komikLatest.slice(0, 12).map((komik, index) => (
          <Card key={komik.manga_id} item={komik} type="komik" index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export async function KomikPopularSection() {
  let komikPopular: Komik[];
  try {
    komikPopular = await getKomikPopular(1);
  } catch {
    komikPopular = [];
  }

  if (komikPopular.length === 0) return null;

  return (
    <SectionWrapper
      title="Komik Populer"
      description="Komik paling banyak dibaca"
      icon={<TrendingUp className="text-primary h-5 w-5" />}
      href="/komik?sort=popular"
      linkText="Lihat Semua"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {komikPopular.slice(0, 12).map((komik, index) => (
          <Card key={komik.manga_id} item={komik} type="komik" index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export async function AnimeLatestSection() {
  let animeLatest: Anime[];
  try {
    animeLatest = await getAnimeLatest();
  } catch {
    animeLatest = [];
  }

  if (animeLatest.length === 0) return null;

  return (
    <SectionWrapper
      title="Anime Terbaru"
      description="Episode terbaru yang baru rilis"
      icon={<Film className="text-primary h-5 w-5" />}
      href="/anime"
      linkText="Lihat Semua"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {animeLatest.slice(0, 12).map((anime, index) => (
          <Card key={anime.urlId} item={anime} type="anime" index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export async function AnimeRecommendedSection() {
  let animeRecommended: Anime[];
  try {
    animeRecommended = await getAnimeRecommended(1);
  } catch {
    animeRecommended = [];
  }

  if (animeRecommended.length === 0) return null;

  return (
    <SectionWrapper
      title="Anime Rekomendasi"
      description="Pilihan anime terbaik untuk kamu"
      icon={<Sparkles className="text-primary h-5 w-5" />}
      href="/anime?sort=recommended"
      linkText="Lihat Semua"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {animeRecommended.slice(0, 12).map((anime, index) => (
          <Card key={anime.urlId} item={anime} type="anime" index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
