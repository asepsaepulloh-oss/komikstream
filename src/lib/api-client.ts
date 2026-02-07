/**
 * Client-side API - Fetches data via API routes
 * 
 * This module is safe to use in client components.
 * It calls internal API routes which handle server-side logic.
 */

import type {
  Anime,
  Komik,
  KomikChapter,
  KomikImage,
} from "@/types";

const BASE_URL = "https://api.sansekai.my.id/api";

// ==================== HELPER FUNCTIONS ====================

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (res.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
        if (i < retries) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        return { data: [], retcode: -1 } as T;
      }

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      if (i === retries) {
        console.error(`Fetch failed: ${url}`, error);
        return { data: [], retcode: -1 } as T;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to fetch");
}

function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

// ==================== ANIME API ====================

export async function getAnimeLatest(): Promise<Anime[]> {
  try {
    const res = await fetchWithRetry<any[]>(`${BASE_URL}/anime/latest`);
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeRecommended(page: number = 1): Promise<Anime[]> {
  try {
    const res = await fetchWithRetry<any[]>(`${BASE_URL}/anime/recommended?page=${page}`);
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeMovie(): Promise<Anime[]> {
  try {
    const res = await fetchWithRetry<any[]>(`${BASE_URL}/anime/movie`);
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeDetail(urlId: string): Promise<Anime | null> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/anime/detail?urlId=${urlId}`);
    const detail = res.data?.[0];
    return detail ? transformAnimeDetail(detail) : null;
  } catch {
    return null;
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const res = await fetchWithRetry<any[]>(`${BASE_URL}/anime/search?query=${encodeURIComponent(query)}`);
    return ensureArray(res).map(transformAnimeList);
  } catch {
    return [];
  }
}

export async function getAnimeVideo(episodeId: string, resolution: string = "480p"): Promise<string | null> {
  try {
    const res = await fetch(`/api/anime/video?chapterUrlId=${episodeId}&reso=${resolution}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

// ==================== KOMIK API ====================

export async function getKomikLatest(type: "project" | "mirror"): Promise<Komik[]> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/komik/latest?type=${type}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikPopular(page: number = 1): Promise<Komik[]> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/komik/popular?page=${page}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikRecommended(type: "manhwa" | "manhua" | "manga"): Promise<Komik[]> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/komik/recommended?type=${type}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikDetail(mangaId: string): Promise<Komik | null> {
  try {
    const res = await fetchWithRetry<{ data?: any }>(`${BASE_URL}/komik/detail?manga_id=${mangaId}`);
    return res.data ? transformKomik(res.data) : null;
  } catch {
    return null;
  }
}

export async function getKomikChapterList(mangaId: string): Promise<KomikChapter[]> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/komik/chapterlist?manga_id=${mangaId}`);
    return ensureArray(res.data).map(transformKomikChapter);
  } catch {
    return [];
  }
}

export async function searchKomik(query: string): Promise<Komik[]> {
  try {
    const res = await fetchWithRetry<{ data?: any[] }>(`${BASE_URL}/komik/search?query=${encodeURIComponent(query)}`);
    return ensureArray(res.data).map(transformKomik);
  } catch {
    return [];
  }
}

export async function getKomikImages(chapterId: string): Promise<KomikImage[]> {
  try {
    const res = await fetchWithRetry<{ data?: { chapter?: { data?: string[] } } }>(`${BASE_URL}/komik/getimage?chapter_id=${chapterId}`);
    const imageUrls = res.data?.chapter?.data || [];
    return imageUrls.map((url, index) => ({
      url,
      page: index + 1,
    }));
  } catch {
    return [];
  }
}

// ==================== HOMEPAGE ====================

export async function getHomepageData() {
  const [komikLatest, komikPopular, animeLatest, animeRecommended] =
    await Promise.all([
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

// ==================== TRANSFORMERS ====================

function transformAnimeList(raw: any): Anime {
  return {
    urlId: raw.urlId || raw.url_id || "",
    title: raw.title || "",
    thumbnail: raw.thumbnail || raw.image || "",
    synopsis: raw.synopsis || raw.description,
    rating: raw.rating,
    type: raw.type,
    status: raw.status,
    genres: raw.genres || [],
    episodes: raw.episodes || [],
  };
}

function transformAnimeDetail(raw: any): Anime {
  return {
    urlId: raw.urlId || raw.url_id || "",
    title: raw.title || "",
    thumbnail: raw.thumbnail || raw.image || "",
    cover: raw.cover || raw.thumbnail || raw.image,
    synopsis: raw.synopsis || raw.description,
    rating: raw.rating,
    type: raw.type,
    status: raw.status,
    genres: raw.genres || [],
    episodes: raw.episodes || [],
    totalEpisodes: raw.total_episodes || raw.totalEpisodes,
  };
}

function transformKomik(raw: any): Komik {
  return {
    manga_id: raw.manga_id || "",
    title: raw.title || "",
    thumbnail: raw.thumbnail || raw.cover || "",
    cover: raw.cover || raw.thumbnail,
    type: raw.type,
    status: raw.status,
    rating: raw.rating,
    description: raw.description || raw.synopsis,
    author: raw.author,
    artist: raw.artist,
    genres: raw.genres || [],
    chapters: (raw.chapters || []).map((ch: any) => ({
      chapter_id: ch.chapter_id || ch.id,
      title: ch.title || `Chapter ${ch.chapter}`,
      chapter: ch.chapter,
      date: ch.date || ch.created_at,
    })),
    latestChapter: raw.latest_chapter || raw.latestChapter,
    updatedAt: raw.updated_at || raw.updatedAt,
  };
}

function transformKomikChapter(raw: any): KomikChapter {
  return {
    chapter_id: raw.chapter_id || raw.id || "",
    title: raw.title || `Chapter ${raw.chapter}`,
    chapter: raw.chapter || 0,
    date: raw.date || raw.created_at,
  };
}
