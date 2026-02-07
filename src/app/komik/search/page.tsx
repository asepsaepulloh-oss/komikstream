import { searchKomik } from "@/lib/api";
import { Card, SearchBar } from "@/components/ui";
import { Book, SearchX } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";
  return {
    title: query ? `Hasil pencarian: ${query}` : "Cari Komik",
    description: `Hasil pencarian komik untuk "${query}"`,
  };
}

export default async function KomikSearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  
  let results: Awaited<ReturnType<typeof searchKomik>> = [];
  let error: string | null = null;

  if (query) {
    try {
      results = await searchKomik(query);
    } catch (e) {
      error = "Gagal mencari komik. Silakan coba lagi.";
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Book className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cari Komik</h1>
            <p className="text-muted-foreground">
              Temukan komik favorit kamu
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          placeholder="Cari judul komik..."
          searchPath="/komik/search"
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
              {results.map((komik) => (
                <Card key={komik.manga_id} item={komik} type="komik" />
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
          <Book className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Masukkan kata kunci pencarian</p>
          <p className="text-sm text-muted-foreground">
            Ketik judul komik yang ingin kamu cari
          </p>
        </div>
      )}
    </div>
  );
}
