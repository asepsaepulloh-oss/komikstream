import { Card } from "@/components/ui";
import {
  getKomikLatest,
  getKomikPopular,
  getAnimeLatest,
  getAnimeRecommended,
} from "@/lib/api-cached";
import type { Komik, Anime } from "@/types";
import { ArrowRight, Book, Film, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
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

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  href: string;
  linkText: string;
}

function EmptyState({ icon, message, href, linkText }: EmptyStateProps) {
  return (
    <div className="border-border/50 bg-card/30 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <p className="text-muted-foreground mb-1 text-sm font-medium">Konten belum tersedia</p>
      <p className="text-muted-foreground/70 mb-5 max-w-xs text-xs">{message}</p>
      <Link
        href={href}
        className="text-primary group flex items-center gap-1.5 text-sm font-medium hover:underline"
      >
        {linkText}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
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

  return (
    <SectionWrapper
      title="Komik Terbaru"
      description="Update chapter terbaru hari ini"
      icon={<Sparkles className="text-primary h-5 w-5" />}
      href="/komik"
      linkText="Lihat Semua"
    >
      {komikLatest.length === 0 ? (
        <EmptyState
          icon={<Book className="text-muted-foreground h-6 w-6" />}
          message="Komik terbaru sedang dimuat atau belum tersedia saat ini."
          href="/komik"
          linkText="Jelajahi Komik"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {komikLatest.slice(0, 12).map((komik, index) => (
            <Card key={komik.manga_id} item={komik} type="komik" index={index} />
          ))}
        </div>
      )}
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

  return (
    <SectionWrapper
      title="Komik Populer"
      description="Komik paling banyak dibaca"
      icon={<TrendingUp className="text-primary h-5 w-5" />}
      href="/komik?sort=popular"
      linkText="Lihat Semua"
    >
      {komikPopular.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="text-muted-foreground h-6 w-6" />}
          message="Data komik populer sedang dimuat atau belum tersedia saat ini."
          href="/komik"
          linkText="Jelajahi Komik"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {komikPopular.slice(0, 12).map((komik, index) => (
            <Card key={komik.manga_id} item={komik} type="komik" index={index} />
          ))}
        </div>
      )}
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

  return (
    <SectionWrapper
      title="Anime Terbaru"
      description="Episode terbaru yang baru rilis"
      icon={<Film className="text-primary h-5 w-5" />}
      href="/anime"
      linkText="Lihat Semua"
    >
      {animeLatest.length === 0 ? (
        <EmptyState
          icon={<Film className="text-muted-foreground h-6 w-6" />}
          message="Anime terbaru sedang dimuat atau belum tersedia saat ini."
          href="/anime"
          linkText="Jelajahi Anime"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {animeLatest.slice(0, 12).map((anime, index) => (
            <Card key={anime.urlId} item={anime} type="anime" index={index} />
          ))}
        </div>
      )}
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

  return (
    <SectionWrapper
      title="Anime Rekomendasi"
      description="Pilihan anime terbaik untuk kamu"
      icon={<Sparkles className="text-primary h-5 w-5" />}
      href="/anime?sort=recommended"
      linkText="Lihat Semua"
    >
      {animeRecommended.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="text-muted-foreground h-6 w-6" />}
          message="Rekomendasi anime sedang dimuat atau belum tersedia saat ini."
          href="/anime"
          linkText="Jelajahi Anime"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {animeRecommended.slice(0, 12).map((anime, index) => (
            <Card key={anime.urlId} item={anime} type="anime" index={index} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
