import "server-only";

/**
 * Database access layer for reading data from Supabase
 * This is the primary data source for the application
 */

import { prisma } from "./prisma";
import type { Anime as PrismaAnime, Komik as PrismaKomik } from "@prisma/client";
import type { Anime, Komik, KomikChapter } from "@/types";

// ==================== TYPE TRANSFORMERS ====================

/**
 * Transform Prisma Anime to frontend Anime type
 */
export function transformDBAniomeToFrontend(dbAnime: PrismaAnime): Anime {
  return {
    urlId: dbAnime.urlId,
    title: dbAnime.title,
    thumbnail: dbAnime.cover,
    cover: dbAnime.cover,
    synopsis: dbAnime.synopsis || undefined,
    description: dbAnime.synopsis || undefined,
    status: dbAnime.status || undefined,
    type: dbAnime.type || undefined,
    rating: dbAnime.rating || undefined,
    genres: (dbAnime.genres as string[]) || [],
    episodes: (
      (dbAnime.episodes as Array<{
        id: number;
        url: string;
        title: string;
        date: string | null;
      }>) || []
    ).map((ep) => ({
      ...ep,
      date: ep.date ?? undefined,
    })),
    totalEpisodes: dbAnime.totalEpisodes || undefined,
    updatedAt: dbAnime.lastUpdate || undefined,
  };
}

/**
 * Transform Prisma Komik to frontend Komik type
 */
export function transformDBKomikToFrontend(dbKomik: PrismaKomik): Komik {
  const chapters =
    (dbKomik.chapters as Array<{
      chapter_id: string;
      chapter_number: number;
      created_at: string;
    }>) || [];

  return {
    manga_id: dbKomik.mangaId,
    title: dbKomik.title,
    thumbnail: dbKomik.coverImage,
    cover: dbKomik.coverPortrait || dbKomik.coverImage,
    type: dbKomik.type || undefined,
    status: dbKomik.status === 1 ? "Ongoing" : dbKomik.status === 2 ? "Completed" : undefined,
    rating: dbKomik.rating || undefined,
    description: dbKomik.synopsis || undefined,
    author: ((dbKomik.authors as Array<{ name: string }>) || [])[0]?.name,
    artist: ((dbKomik.artists as Array<{ name: string }>) || [])[0]?.name,
    genres: (dbKomik.genres as string[]) || [],
    chapters: chapters.map((ch) => ({
      chapter_id: ch.chapter_id,
      title: `Chapter ${ch.chapter_number}`,
      chapter: ch.chapter_number,
      date: ch.created_at,
    })),
    latestChapter: dbKomik.latestChapterNumber?.toString() || undefined,
    updatedAt: dbKomik.latestChapterDate?.toISOString() || undefined,
  };
}

// ==================== ANIME DATABASE FUNCTIONS ====================

/**
 * Get all anime from database (with pagination)
 */
export async function getAnimeListFromDB(limit: number = 20, offset: number = 0): Promise<Anime[]> {
  const anime = await prisma.anime.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
  return anime.map(transformDBAniomeToFrontend);
}

/**
 * Get latest anime from database
 */
export async function getAnimeLatestFromDB(limit: number = 20): Promise<Anime[]> {
  const anime = await prisma.anime.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return anime.map(transformDBAniomeToFrontend);
}

/**
 * Get recommended anime from database (paginated)
 */
export async function getAnimeRecommendedFromDB(
  page: number = 1,
  limit: number = 20
): Promise<Anime[]> {
  const offset = (page - 1) * limit;
  const anime = await prisma.anime.findMany({
    take: limit,
    skip: offset,
    orderBy: { rating: "desc" },
  });
  return anime.map(transformDBAniomeToFrontend);
}

/**
 * Get anime movies from database
 */
export async function getAnimeMovieFromDB(limit: number = 20): Promise<Anime[]> {
  const anime = await prisma.anime.findMany({
    where: {
      OR: [
        { type: { contains: "Movie", mode: "insensitive" } },
        { urlId: { contains: "movie", mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return anime.map(transformDBAniomeToFrontend);
}

/**
 * Get single anime by urlId
 */
export async function getAnimeDetailFromDB(urlId: string): Promise<Anime | null> {
  const anime = await prisma.anime.findUnique({
    where: { urlId },
  });
  if (!anime) return null;
  return transformDBAniomeToFrontend(anime);
}

/**
 * Search anime in database
 */
export async function searchAnimeInDB(query: string, limit: number = 20): Promise<Anime[]> {
  const anime = await prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { alternativeTitle: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return anime.map(transformDBAniomeToFrontend);
}

/**
 * Count total anime in database
 */
export async function countAnimeInDB(): Promise<number> {
  return prisma.anime.count();
}

// ==================== KOMIK DATABASE FUNCTIONS ====================

/**
 * Get all komik from database (with pagination)
 */
export async function getKomikListFromDB(limit: number = 20, offset: number = 0): Promise<Komik[]> {
  const komik = await prisma.komik.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
  return komik.map(transformDBKomikToFrontend);
}

/**
 * Get latest komik from database
 */
export async function getKomikLatestFromDB(limit: number = 20): Promise<Komik[]> {
  const komik = await prisma.komik.findMany({
    take: limit,
    orderBy: { latestChapterDate: "desc" },
  });
  return komik.map(transformDBKomikToFrontend);
}

/**
 * Get popular komik from database (paginated)
 */
export async function getKomikPopularFromDB(
  page: number = 1,
  limit: number = 20
): Promise<Komik[]> {
  const offset = (page - 1) * limit;
  const komik = await prisma.komik.findMany({
    take: limit,
    skip: offset,
    orderBy: { viewCount: "desc" },
  });
  return komik.map(transformDBKomikToFrontend);
}

/**
 * Get recommended komik by type from database
 */
export async function getKomikRecommendedFromDB(
  type: "manhwa" | "manhua" | "manga",
  limit: number = 20
): Promise<Komik[]> {
  const komik = await prisma.komik.findMany({
    where: {
      type: { equals: type.charAt(0).toUpperCase() + type.slice(1), mode: "insensitive" },
    },
    take: limit,
    orderBy: { rating: "desc" },
  });
  return komik.map(transformDBKomikToFrontend);
}

/**
 * Get single komik by mangaId
 */
export async function getKomikDetailFromDB(mangaId: string): Promise<Komik | null> {
  const komik = await prisma.komik.findUnique({
    where: { mangaId },
  });
  if (!komik) return null;
  return transformDBKomikToFrontend(komik);
}

/**
 * Get komik chapter list from database
 */
export async function getKomikChaptersFromDB(mangaId: string): Promise<KomikChapter[]> {
  const komik = await prisma.komik.findUnique({
    where: { mangaId },
    select: { chapters: true },
  });

  if (!komik || !komik.chapters) return [];

  const chapters = komik.chapters as Array<{
    chapter_id: string;
    chapter_number: number;
    created_at: string;
  }>;

  return chapters.map((ch) => ({
    chapter_id: ch.chapter_id,
    title: `Chapter ${ch.chapter_number}`,
    chapter: ch.chapter_number,
    date: ch.created_at,
  }));
}

/**
 * Search komik in database
 */
export async function searchKomikInDB(query: string, limit: number = 20): Promise<Komik[]> {
  const komik = await prisma.komik.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { alternativeTitle: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { viewCount: "desc" },
  });
  return komik.map(transformDBKomikToFrontend);
}

/**
 * Count total komik in database
 */
export async function countKomikInDB(): Promise<number> {
  return prisma.komik.count();
}

// ==================== COMBINED FUNCTIONS ====================

/**
 * Search both anime and komik
 * Uses sequential queries to avoid connection pool exhaustion
 */
export async function searchAllInDB(
  query: string,
  limit: number = 10
): Promise<{ anime: Anime[]; komik: Komik[] }> {
  const anime = await searchAnimeInDB(query, limit);
  const komik = await searchKomikInDB(query, limit);
  return { anime, komik };
}

/**
 * Get homepage data from database
 * Uses sequential queries to avoid connection pool exhaustion
 */
export async function getHomepageDataFromDB(): Promise<{
  animeLatest: Anime[];
  animeRecommended: Anime[];
  komikLatest: Komik[];
  komikPopular: Komik[];
}> {
  // Run queries sequentially to avoid exhausting connection pool
  // This is more efficient for serverless environments with limited connections
  const animeLatest = await getAnimeLatestFromDB(12);
  const animeRecommended = await getAnimeRecommendedFromDB(1, 12);
  const komikLatest = await getKomikLatestFromDB(12);
  const komikPopular = await getKomikPopularFromDB(1, 12);

  return {
    animeLatest,
    animeRecommended,
    komikLatest,
    komikPopular,
  };
}

/**
 * Get database statistics
 * Uses sequential queries to avoid connection pool exhaustion
 */
export async function getDBStats(): Promise<{
  animeCount: number;
  komikCount: number;
  lastSync: Date | null;
}> {
  const animeCount = await countAnimeInDB();
  const komikCount = await countKomikInDB();
  const lastSync = await prisma.syncLog.findFirst({
    where: { status: "success" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  return {
    animeCount,
    komikCount,
    lastSync: lastSync?.completedAt || null,
  };
}
