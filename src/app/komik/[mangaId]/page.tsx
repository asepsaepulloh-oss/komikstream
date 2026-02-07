import { getKomikChapterList, getKomikDetail } from "@/lib/api";
import { getImageUrl, truncate } from "@/lib/utils";
import { Book, BookOpen, Clock, Star, User, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DetailPageProps {
  params: Promise<{ mangaId: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { mangaId } = await params;
  
  try {
    const komik = await getKomikDetail(mangaId);
    
    if (!komik) {
      return { title: "Komik tidak ditemukan" };
    }

    return {
      title: komik.title,
      description: truncate(komik.description || `Baca ${komik.title} secara gratis`, 160),
      openGraph: {
        images: komik.thumbnail ? [komik.thumbnail] : [],
      },
    };
  } catch {
    return { title: "Komik tidak ditemukan" };
  }
}

export default async function KomikDetailPage({ params }: DetailPageProps) {
  const { mangaId } = await params;
  
  let komik;
  let chapters: Awaited<ReturnType<typeof getKomikChapterList>> = [];
  
  try {
    [komik, chapters] = await Promise.all([
      getKomikDetail(mangaId),
      getKomikChapterList(mangaId),
    ]);
  } catch (error) {
    console.error("Error fetching komik detail:", error);
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Gagal Memuat Data</h1>
          <p className="text-muted-foreground mb-6">Terjadi kesalahan saat memuat detail komik. Silakan coba lagi nanti.</p>
          <Link href="/komik" className="text-primary hover:underline">
            Kembali ke Daftar Komik
          </Link>
        </div>
      </div>
    );
  }

  if (!komik) {
    notFound();
  }

  const thumbnail = komik.thumbnail || komik.cover || "";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        {/* Background blur */}
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(thumbnail)}
            alt=""
            fill
            className="object-cover blur-2xl opacity-30"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col md:flex-row gap-6 p-6 md:p-8">
          {/* Cover */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] w-48 md:w-56 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(thumbnail)}
                alt={komik.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end text-center md:text-left">
            {/* Type badge */}
            {komik.type && (
              <span className="inline-flex w-fit mx-auto md:mx-0 rounded bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground capitalize mb-3">
                {komik.type}
              </span>
            )}

            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              {komik.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              {komik.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {komik.author}
                </span>
              )}
              {komik.status && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {komik.status}
                </span>
              )}
              {komik.rating && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  {komik.rating}
                </span>
              )}
            </div>

            {/* Genres */}
            {komik.genres && komik.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {komik.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {komik.description && (
              <p className="text-sm text-muted-foreground line-clamp-4 max-w-2xl">
                {komik.description}
              </p>
            )}

            {/* Action buttons */}
            {chapters.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <Link
                  href={`/komik/${mangaId}/${chapters[0].chapter_id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Baca Chapter Pertama
                </Link>
                <Link
                  href={`/komik/${mangaId}/${chapters[chapters.length - 1].chapter_id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Book className="h-4 w-4" />
                  Chapter Terbaru
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Daftar Chapter</h2>
          <span className="text-sm text-muted-foreground">
            ({chapters.length} chapter)
          </span>
        </div>

        {chapters.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.chapter_id}
                href={`/komik/${mangaId}/${chapter.chapter_id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{chapter.title}</p>
                    {chapter.date && (
                      <p className="text-xs text-muted-foreground">
                        {chapter.date}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
            <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Belum ada chapter</p>
            <p className="text-sm text-muted-foreground">
              Chapter akan segera ditambahkan
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
