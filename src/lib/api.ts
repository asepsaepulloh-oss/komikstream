import "server-only";

/**
 * API Layer - Database-First Approach
 *
 * This module provides data access functions that:
 * 1. First try to get data from Supabase database
 * 2. Fall back to external API only if database is empty or for real-time data
 *
 * Video/Image URLs are always fetched fresh (they expire)
 */

import type { Anime, Komik, KomikChapter, KomikImage } from "@/types";

import type {
  SansekaiResponse,
  RawKomik,
  RawKomikChapter,
  RawKomikImageResponse,
  RawAnimeList,
  RawAnimeDetailResponse,
  RawAnimeVideoResponse,
} from "@/types/api-raw";

import {
  transformKomik,
  transformKomikChapter,
  transformAnimeList,
  transformAnimeDetail,
} from "@/types/transformers";

import {
  getAnimeLatestFromDB,
  getAnimeRecommendedFromDB,
  getAnimeDetailFromDB,
  getAnimeMovieFromDB,
  getKomikLatestFromDB,
  getKomikPopularFromDB,
  getKomikRecommendedFromDB,
  getKomikDetailFromDB,
  getKomikChaptersFromDB,
  searchAnimeInDB,
  searchKomikInDB,
  getHomepageDataFromDB,
} from "./database";

const BASE_URL = "https://api.sansekai.my.id/api";

// ==================== EXTERNAL API FETCHER ====================
// Used only as fallback when database is empty

async function fetchExternal<T>(endpoint: string, retries = 3): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: "https://api.sansekai.my.id/",
        },
      });

      if (res.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
        if (i < retries) {
          console.warn(`Rate Limited: ${endpoint}, retrying in ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        console.error(`Rate Limited (final): ${endpoint}`);
        return { data: [], retcode: -1 } as T;
      }

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      if (i === retries) {
        console.error(`Fetch failed after ${retries} retries: ${endpoint}`, error);
        return { data: [], retcode: -1 } as T;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to fetch after retries");
}

function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

// ==================== ANIME API (Database-First) ====================

export async function getAnimeLatest(): Promise<Anime[]> {
  try {
    // Try database first
    const fromDB = await getAnimeLatestFromDB(20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for anime latest:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<RawAnimeList[]>("/anime/latest");
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeRecommended(page: number = 1): Promise<Anime[]> {
  try {
    // Try database first
    const fromDB = await getAnimeRecommendedFromDB(page, 20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for anime recommended:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<RawAnimeList[]>(`/anime/recommended?page=${page}`);
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeMovie(): Promise<Anime[]> {
  try {
    // Try database first
    const fromDB = await getAnimeMovieFromDB(20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for anime movies:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<RawAnimeList[]>("/anime/movie");
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeDetail(urlId: string): Promise<Anime | null> {
  try {
    // Try database first
    const fromDB = await getAnimeDetailFromDB(urlId);
    if (fromDB) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for anime detail:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<RawAnimeDetailResponse>(`/anime/detail?urlId=${urlId}`);
    const detail = res.data?.[0];
    return detail ? transformAnimeDetail(detail) : null;
  } catch {
    return null;
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  // Search is real-time from database
  try {
    return await searchAnimeInDB(query, 20);
  } catch (error) {
    console.error("DB search failed for anime:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<RawAnimeList[]>(
      `/anime/search?query=${encodeURIComponent(query)}`
    );
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

// Video URLs expire - always fetch fresh from external API
export async function getAnimeVideo(
  chapterUrlId: string,
  resolution: string = "480p"
): Promise<string | null> {
  try {
    const res = await fetchExternal<RawAnimeVideoResponse>(
      `/anime/getvideo?chapterUrlId=${chapterUrlId}&reso=${resolution}`
    );

    const episodeData = res.data?.[0];
    if (!episodeData) return null;

    const stream = episodeData.stream?.find((s) => s.reso === resolution);
    if (stream) {
      return stream.link;
    }

    if (episodeData.stream?.[0]) {
      return episodeData.stream[0].link;
    }

    return null;
  } catch {
    return null;
  }
}

// ==================== KOMIK API (Database-First) ====================

export async function getKomikLatest(type: "project" | "mirror"): Promise<Komik[]> {
  try {
    // Try database first
    const fromDB = await getKomikLatestFromDB(20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for komik latest:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomik[]>>(`/komik/latest?type=${type}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikPopular(page: number = 1): Promise<Komik[]> {
  try {
    // Try database first
    const fromDB = await getKomikPopularFromDB(page, 20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for komik popular:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomik[]>>(`/komik/popular?page=${page}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikRecommended(type: "manhwa" | "manhua" | "manga"): Promise<Komik[]> {
  try {
    // Try database first
    const fromDB = await getKomikRecommendedFromDB(type, 20);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for komik recommended:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomik[]>>(
      `/komik/recommended?type=${type}`
    );
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikDetail(mangaId: string): Promise<Komik | null> {
  try {
    // Try database first
    const fromDB = await getKomikDetailFromDB(mangaId);
    if (fromDB) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for komik detail:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomik>>(
      `/komik/detail?manga_id=${mangaId}`
    );
    return res.data ? transformKomik(res.data) : null;
  } catch {
    return null;
  }
}

export async function getKomikChapterList(mangaId: string): Promise<KomikChapter[]> {
  try {
    // Try database first
    const fromDB = await getKomikChaptersFromDB(mangaId);
    if (fromDB.length > 0) {
      return fromDB;
    }
  } catch (error) {
    console.error("DB query failed for komik chapters:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomikChapter[]>>(
      `/komik/chapterlist?manga_id=${mangaId}`
    );
    return ensureArray(res.data).map(transformKomikChapter);
  } catch {
    return [];
  }
}

export async function searchKomik(query: string): Promise<Komik[]> {
  // Search is real-time from database
  try {
    return await searchKomikInDB(query, 20);
  } catch (error) {
    console.error("DB search failed for komik:", error);
  }

  // Fallback to external API
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomik[]>>(
      `/komik/search?query=${encodeURIComponent(query)}`
    );
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

// Image URLs may expire - always fetch fresh from external API
export async function getKomikImages(chapterId: string): Promise<KomikImage[]> {
  try {
    const res = await fetchExternal<SansekaiResponse<RawKomikImageResponse>>(
      `/komik/getimage?chapter_id=${chapterId}`
    );

    const imageUrls = res.data?.chapter?.data || [];
    return imageUrls.map((url, index) => ({
      url,
      page: index + 1,
    }));
  } catch {
    return [];
  }
}

// ==================== COMBINED FETCH FOR HOMEPAGE ====================

export async function getHomepageData() {
  try {
    // Try database first
    const fromDB = await getHomepageDataFromDB();
    if (fromDB.animeLatest.length > 0 || fromDB.komikLatest.length > 0) {
      return {
        komikLatest: fromDB.komikLatest,
        komikPopular: fromDB.komikPopular,
        animeLatest: fromDB.animeLatest,
        animeRecommended: fromDB.animeRecommended,
      };
    }
  } catch (error) {
    console.error("DB query failed for homepage:", error);
  }

  // Fallback to external API
  const [komikLatest, komikPopular, animeLatest, animeRecommended] = await Promise.all([
    getKomikLatest("mirror").catch(() => []),
    getKomikPopular(1).catch(() => []),
    getAnimeLatest().catch(() => []),
    getAnimeRecommended(1).catch(() => []),
  ]);

  return {
    komikLatest,
    komikPopular,
    animeLatest,
    animeRecommended,
  };
}
