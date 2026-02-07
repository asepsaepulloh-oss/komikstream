import { getKomikChapterList, getKomikDetail, getKomikImages } from "@/lib/api";
import { getImageUrl, truncate } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, Home, List } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ReaderPageProps {
  params: Promise<{ mangaId: string; chapterId: string }>;
}

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { mangaId, chapterId } = await params;
  const komik = await getKomikDetail(mangaId);
  
  if (!komik) {
    return { title: "Komik tidak ditemukan" };
  }

  return {
    title: `Baca ${komik.title}`,
    description: truncate(`Baca ${komik.title} secara gratis di KomikStream`, 160),
  };
}

export default async function KomikReaderPage({ params }: ReaderPageProps) {
  const { mangaId, chapterId } = await params;

  const [komik, chapters, images] = await Promise.all([
    getKomikDetail(mangaId),
    getKomikChapterList(mangaId),
    getKomikImages(chapterId),
  ]);

  if (!komik || !images || images.length === 0) {
    notFound();
  }

  // Find current, prev, next chapter
  const currentIndex = chapters.findIndex((ch) => ch.chapter_id === chapterId);
  const currentChapter = chapters[currentIndex];
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Get image URLs
  const imageUrls = images.map((img) => {
    if (typeof img === "string") return img;
    return img.url;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Back button */}
            <Link
              href={`/komik/${mangaId}`}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>

            {/* Title */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-sm font-medium truncate">
                {komik.title}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {currentChapter?.title || `Chapter ${chapterId}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
              <Link
                href={`/komik/${mangaId}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
              >
                <List className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation (top) */}
      <nav className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {prevChapter ? (
              <Link
                href={`/komik/${mangaId}/${prevChapter.chapter_id}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Prev
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Prev
              </span>
            )}

            <span className="text-sm font-medium">
              {currentChapter?.title || "Loading..."}
            </span>

            {nextChapter ? (
              <Link
                href={`/komik/${mangaId}/${nextChapter.chapter_id}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">
                Next
                <ArrowRight className="h-4 w-4 inline ml-1" />
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Images */}
      <main className="flex flex-col items-center bg-black py-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="w-full max-w-4xl relative">
            <Image
              src={getImageUrl(url)}
              alt={`Page ${index + 1}`}
              width={1000}
              height={1500}
              className="w-full h-auto"
              priority={index < 3}
              unoptimized
            />
          </div>
        ))}
      </main>

      {/* Navigation (bottom) */}
      <nav className="bg-background border-t border-border sticky bottom-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {prevChapter ? (
              <Link
                href={`/komik/${mangaId}/${prevChapter.chapter_id}`}
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Chapter Sebelumnya
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/komik/${mangaId}/${nextChapter.chapter_id}`}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Chapter Selanjutnya
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/komik/${mangaId}`}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Kembali ke Detail
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
