import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformDBAniomeToFrontend, transformDBKomikToFrontend } from "@/lib/database";

export const dynamic = "force-dynamic";

interface SearchResult {
  type: "anime" | "komik";
  id: string;
  title: string;
  thumbnail: string | null;
  rating: number | null;
  status: string | null;
  genres: string[];
  urlId?: string;
  mangaId?: string;
}

/**
 * GET /api/search?q=query&type=anime|komik&limit=20
 * Real-time search in database
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type"); // "anime", "komik", or null for both
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  // Minimum query length
  if (query.length < 2) {
    return NextResponse.json({
      results: [],
      message: "Query must be at least 2 characters",
    });
  }

  try {
    const results: SearchResult[] = [];

    // Search anime
    if (!type || type === "anime") {
      const anime = await prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { alternativeTitle: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
          ],
        },
        take: type === "anime" ? limit : Math.floor(limit / 2),
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      });

      results.push(
        ...anime.map((a) => ({
          type: "anime" as const,
          id: a.id,
          urlId: a.urlId,
          title: a.title,
          thumbnail: a.cover,
          rating: a.rating,
          status: a.status,
          genres: (a.genres as string[]) || [],
        }))
      );
    }

    // Search komik
    if (!type || type === "komik") {
      const komik = await prisma.komik.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { alternativeTitle: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
          ],
        },
        take: type === "komik" ? limit : Math.floor(limit / 2),
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      });

      results.push(
        ...komik.map((k) => ({
          type: "komik" as const,
          id: k.id,
          mangaId: k.mangaId,
          title: k.title,
          thumbnail: k.coverImage,
          rating: k.rating,
          status: k.status === 1 ? "Ongoing" : k.status === 2 ? "Completed" : null,
          genres: (k.genres as string[]) || [],
        }))
      );
    }

    return NextResponse.json({
      query,
      type: type || "all",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed", results: [] }, { status: 500 });
  }
}
