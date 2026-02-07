/**
 * Scraper utilities for fetching data from external API
 * and transforming it to database format
 */

import type { Prisma } from "@prisma/client";
import type {
  RawAnimeList,
  RawAnimeDetail,
  RawAnimeDetailResponse,
  RawKomik,
  SansekaiResponse,
} from "@/types/api-raw";

const BASE_URL = "https://api.sansekai.my.id/api";

// Rate limiting configuration
const REQUEST_DELAY = 2000; // 2 seconds between requests
let lastRequestTime = 0;

/**
 * Delay helper for rate limiting
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate-limited fetch wrapper
 */
async function rateLimitedFetch<T>(endpoint: string): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < REQUEST_DELAY) {
    await delay(REQUEST_DELAY - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: "https://api.sansekai.my.id/",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ==================== ANIME SCRAPER ====================

/**
 * Transform raw anime list item to database format
 */
export function transformAnimeToDBFormat(raw: RawAnimeList): Prisma.AnimeCreateInput {
  return {
    urlId: raw.url,
    title: raw.judul,
    alternativeTitle: null,
    cover: raw.cover,
    synopsis: raw.sinopsis || null,
    status: raw.status || null,
    type: null,
    totalEpisodes: raw.total_episode || null,
    rating: raw.score ? parseFloat(raw.score) : null,
    genres: raw.genre || [],
    episodes: [],
    lastEpisode: raw.lastch || null,
    lastUpdate: raw.lastup || null,
    sourceUrl: `https://otakudesu.lol/anime/${raw.url}`,
  };
}

/**
 * Transform raw anime detail to database format
 */
export function transformAnimeDetailToDBFormat(raw: RawAnimeDetail): Prisma.AnimeCreateInput {
  const episodes =
    raw.chapter?.map((ch) => ({
      id: ch.id,
      url: ch.url,
      title: ch.ch || `Episode ${ch.id}`,
      date: ch.date || null,
    })) || [];

  return {
    urlId: raw.series_id,
    title: raw.judul,
    alternativeTitle: null,
    cover: raw.cover,
    synopsis: raw.sinopsis || null,
    status: raw.status || null,
    type: raw.type || null,
    totalEpisodes: raw.chapter?.length || null,
    rating: raw.rating ? parseFloat(raw.rating) : null,
    genres: raw.genre || [],
    episodes: episodes,
    lastEpisode: raw.chapter?.[0]?.ch || null,
    lastUpdate: raw.chapter?.[0]?.date || null,
    sourceUrl: `https://otakudesu.lol/anime/${raw.series_id}`,
  };
}

/**
 * Scrape latest anime from API
 */
export async function scrapeAnimeLatest(): Promise<Prisma.AnimeCreateInput[]> {
  try {
    const data = await rateLimitedFetch<RawAnimeList[]>("/anime/latest");
    return data.map(transformAnimeToDBFormat);
  } catch (error) {
    console.error("Failed to scrape anime latest:", error);
    return [];
  }
}

/**
 * Scrape recommended anime from API (paginated)
 */
export async function scrapeAnimeRecommended(page: number = 1): Promise<Prisma.AnimeCreateInput[]> {
  try {
    const data = await rateLimitedFetch<RawAnimeList[]>(`/anime/recommended?page=${page}`);
    return data.map(transformAnimeToDBFormat);
  } catch (error) {
    console.error(`Failed to scrape anime recommended page ${page}:`, error);
    return [];
  }
}

/**
 * Scrape anime movies from API
 */
export async function scrapeAnimeMovie(): Promise<Prisma.AnimeCreateInput[]> {
  try {
    const data = await rateLimitedFetch<RawAnimeList[]>("/anime/movie");
    return data.map(transformAnimeToDBFormat);
  } catch (error) {
    console.error("Failed to scrape anime movies:", error);
    return [];
  }
}

/**
 * Scrape anime detail by urlId
 */
export async function scrapeAnimeDetail(urlId: string): Promise<Prisma.AnimeCreateInput | null> {
  try {
    const data = await rateLimitedFetch<RawAnimeDetailResponse>(`/anime/detail?urlId=${urlId}`);
    const detail = data.data?.[0];
    if (!detail) return null;
    return transformAnimeDetailToDBFormat(detail);
  } catch (error) {
    console.error(`Failed to scrape anime detail ${urlId}:`, error);
    return null;
  }
}

// ==================== KOMIK SCRAPER ====================

/**
 * Transform raw komik to database format
 */
export function transformKomikToDBFormat(raw: RawKomik): Prisma.KomikCreateInput {
  const genres = raw.taxonomy?.Genre?.map((g) => g.name) || [];
  const authors = raw.taxonomy?.Author || [];
  const artists = raw.taxonomy?.Artist || [];
  const format = raw.taxonomy?.Format?.[0]?.name || null;

  return {
    mangaId: raw.manga_id,
    title: raw.title,
    alternativeTitle: raw.alternative_title || null,
    coverImage: raw.cover_image_url || "",
    coverPortrait: raw.cover_portrait_url || null,
    synopsis: raw.description || null,
    status: raw.status ?? null,
    type: format,
    releaseYear: raw.release_year || null,
    country: raw.country_id || null,
    rating: raw.user_rate || null,
    viewCount: raw.view_count ? BigInt(raw.view_count) : null,
    bookmarkCount: raw.bookmark_count || null,
    genres: genres,
    authors: authors,
    artists: artists,
    latestChapterId: raw.latest_chapter_id || null,
    latestChapterNumber: raw.latest_chapter_number || null,
    latestChapterDate: raw.latest_chapter_time ? new Date(raw.latest_chapter_time) : null,
    chapters: (raw.chapters as unknown as Prisma.InputJsonValue) || [],
    sourceUrl: null,
  };
}

/**
 * Scrape latest komik from API
 */
export async function scrapeKomikLatest(
  type: "project" | "mirror" = "mirror"
): Promise<Prisma.KomikCreateInput[]> {
  try {
    const data = await rateLimitedFetch<SansekaiResponse<RawKomik[]>>(`/komik/latest?type=${type}`);
    if (!data.data || !Array.isArray(data.data)) return [];
    return data.data.map(transformKomikToDBFormat);
  } catch (error) {
    console.error(`Failed to scrape komik latest (${type}):`, error);
    return [];
  }
}

/**
 * Scrape popular komik from API (paginated)
 */
export async function scrapeKomikPopular(page: number = 1): Promise<Prisma.KomikCreateInput[]> {
  try {
    const data = await rateLimitedFetch<SansekaiResponse<RawKomik[]>>(
      `/komik/popular?page=${page}`
    );
    if (!data.data || !Array.isArray(data.data)) return [];
    return data.data.map(transformKomikToDBFormat);
  } catch (error) {
    console.error(`Failed to scrape komik popular page ${page}:`, error);
    return [];
  }
}

/**
 * Scrape recommended komik from API
 */
export async function scrapeKomikRecommended(
  type: "manhwa" | "manhua" | "manga"
): Promise<Prisma.KomikCreateInput[]> {
  try {
    const data = await rateLimitedFetch<SansekaiResponse<RawKomik[]>>(
      `/komik/recommended?type=${type}`
    );
    if (!data.data || !Array.isArray(data.data)) return [];
    return data.data.map(transformKomikToDBFormat);
  } catch (error) {
    console.error(`Failed to scrape komik recommended (${type}):`, error);
    return [];
  }
}

/**
 * Scrape komik detail by mangaId
 */
export async function scrapeKomikDetail(mangaId: string): Promise<Prisma.KomikCreateInput | null> {
  try {
    const data = await rateLimitedFetch<SansekaiResponse<RawKomik>>(
      `/komik/detail?manga_id=${mangaId}`
    );
    if (!data.data) return null;
    return transformKomikToDBFormat(data.data);
  } catch (error) {
    console.error(`Failed to scrape komik detail ${mangaId}:`, error);
    return null;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if external API is accessible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/anime/latest`, {
      method: "HEAD",
      headers: {
        "User-Agent": "KomikStream Health Check",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
