import { searchAnime } from "@/lib/api";
import { Card, SearchBar } from "@/components/ui";
import { Film, SearchX } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";
  return {
    title: query ? `Hasil pencarian: ${query}` : "Cari Anime",
    description: `Hasil pencarian anime untuk "${query}"`,
  };
}

export default async function AnimeSearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  
  let results: Awaited<ReturnType<typeof searchAnime>> = [];
  let error: string | null = null;

  if (query) {
    try {
      results = await searchAnime(query);
    } catch (e) {
      error = "Gagal mencari anime. Silakan coba lagi.";
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Film className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cari Anime</h1>
            <p className="text-muted-foreground">
              Temukan anime favorit kamu
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          placeholder="Cari judul anime..."
          searchPath="/anime/search"
          defaultValue={query}
          className="max-w-xl"
        />
      </div>

      {/* Results */}
      {query ? (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : results.length > 0 ? (
                <>
                  Ditemukan <span className="font-medium text-foreground">{results.length}</span> hasil untuk{" "}
                  <span className="font-medium text-foreground">&quot;{query}&quot;</span>
                </>
              ) : (
                <>
                  Tidak ada hasil untuk <span className="font-medium text-foreground">&quot;{query}&quot;</span>
                </>
              )}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((anime) => (
                <Card key={anime.urlId} item={anime} type="anime" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-sm text-muted-foreground">
                Coba kata kunci yang berbeda
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Film className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Masukkan kata kunci pencarian</p>
          <p className="text-sm text-muted-foreground">
            Ketik judul anime yang ingin kamu cari
          </p>
        </div>
      )}
    </div>
  );
}
