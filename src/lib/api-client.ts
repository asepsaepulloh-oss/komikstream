/**
 * API Client with ISR Caching
 *
 * Optimized for performance with Incremental Static Regeneration.
 * Safe to use in both client and server components.
 */

import type { Anime, Komik, KomikChapter, KomikImage } from "@/types";
import { CACHE_TIMES, CACHE_TAGS } from "./cache-config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sansekai.my.id/api";

// ==================== RAW API TYPES ====================

interface RawAnimeListItem {
  urlId?: string;
  url_id?: string;
  url?: string;
  title?: string;
  judul?: string;
  thumbnail?: string;
  image?: string;
  cover?: string;
  synopsis?: string;
  sinopsis?: string;
  description?: string;
  rating?: string | number;
  type?: string;
  status?: string;
  genres?: string[];
  genre?: string[];
  episodes?: RawEpisode[];
  chapter?: RawEpisode[];
  total_episodes?: number;
  totalEpisodes?: number;
}

interface RawEpisode {
  id?: number;
  url?: string;
  ch?: string;
  title?: string;
  date?: string;
}

interface RawKomikItem {
  manga_id?: string;
  title?: string;
  thumbnail?: string;
  cover?: string;
  cover_image_url?: string;
  type?: string;
  status?: number | string;
  rating?: string | number;
  user_rate?: number;
  description?: string;
  synopsis?: string;
  author?: string;
  artist?: string;
  genres?: string[];
  chapters?: RawKomikChapterItem[];
  latest_chapter?: string;
  latestChapter?: string;
  updated_at?: string;
  updatedAt?: string;
  taxonomy?: {
    Genre?: Array<{ name: string }>;
    Author?: Array<{ name: string }>;
    Artist?: Array<{ name: string }>;
  };
}

interface RawKomikChapterItem {
  chapter_id?: string;
  id?: string;
  title?: string;
  chapter?: number;
  chapter_number?: number;
  date?: string;
  created_at?: string;
}

interface AnimeDetailResponse {
  data?: RawAnimeListItem[];
}

interface KomikListResponse {
  data?: RawKomikItem[];
  retcode?: number;
}

interface KomikDetailResponse {
  data?: RawKomikItem;
}

interface KomikImageResponse {
  data?: {
    chapter?: {
      data?: string[];
    };
  };
}

// ==================== HELPER FUNCTIONS ====================

/** Per-request timeout in milliseconds. Prevents server-side fetches from
 *  hanging indefinitely when the external API is unreachable from the
 *  Vercel network, which would otherwise block RSC rendering and cause
 *  navigation to appear frozen. */
const FETCH_TIMEOUT_MS = 8_000;

async function fetchWithCache<T>(
  url: string,
  revalidate: number,
  tags?: string[],
  retries = 1
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        next: {
          revalidate: revalidate,
          tags: tags,
        },
        headers: {
          Accept: "application/json",
        },
      } as RequestInit);

      clearTimeout(timeoutId);

      if (res.status === 429) {
        const waitTime = Math.min(500 * Math.pow(2, i), 3000);
        if (i < retries) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error("API rate limited (429)");
      }

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (i === retries) {
        throw error;
      }
      // Short delay before retry — keep total time under Vercel function timeout
      await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
    }
  }
  throw new Error("Failed to fetch");
}

function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

// ==================== ANIME HELPERS ====================

/**
 * Extract episode number from a title/ch string.
 * Handles formats like "10", "Episode 10", "Ep. 10.5", "OVA 2", etc.
 * Returns 0 when no number is found (e.g. "OVA Special") so those
 * items sort to the beginning, which is acceptable.
 */
function extractEpisodeNumber(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// ==================== ANIME API ====================

export async function getAnimeLatest(): Promise<Anime[]> {
  const res = await fetchWithCache<RawAnimeListItem[]>(
    `${BASE_URL}/anime/latest`,
    CACHE_TIMES.LATEST,
    [CACHE_TAGS.ANIME_LATEST]
  );
  return ensureArray(res).map(transformAnimeList);
}

export async function getAnimeRecommended(page: number = 1): Promise<Anime[]> {
  const res = await fetchWithCache<RawAnimeListItem[]>(
    `${BASE_URL}/anime/recommended?page=${page}`,
    CACHE_TIMES.POPULAR,
    [CACHE_TAGS.ANIME_RECOMMENDED]
  );
  return ensureArray(res).map(transformAnimeList);
}

export async function getAnimeMovie(): Promise<Anime[]> {
  const res = await fetchWithCache<RawAnimeListItem[]>(
    `${BASE_URL}/anime/movie`,
    CACHE_TIMES.POPULAR,
    [CACHE_TAGS.ANIME_MOVIE]
  );
  return ensureArray(res).map(transformAnimeList);
}

export async function getAnimeDetail(urlId: string): Promise<Anime | null> {
  const res = await fetchWithCache<AnimeDetailResponse>(
    `${BASE_URL}/anime/detail?urlId=${urlId}`,
    CACHE_TIMES.DETAIL,
    [CACHE_TAGS.ANIME_DETAIL, `anime-${urlId}`]
  );
  const detail = res.data?.[0];
  return detail ? transformAnimeDetail(detail) : null;
}

export async function searchAnime(query: string): Promise<Anime[]> {
  const res = await fetchWithCache<RawAnimeListItem[]>(
    `${BASE_URL}/anime/search?query=${encodeURIComponent(query)}`,
    CACHE_TIMES.SEARCH
  );
  return ensureArray(res).map(transformAnimeList);
}

/**
 * Response from the internal anime video API proxy.
 */
export interface AnimeVideoResult {
  url: string | null;
  type: "direct" | "embed";
  availableResolutions: string[];
}

/**
 * Fetch anime video URL via the internal API proxy.
 *
 * **Client-only** — uses a relative URL (`/api/anime/video`) that requires
 * a browser context. Do NOT call this from server components or server-side code.
 */
export async function getAnimeVideo(
  episodeId: string,
  resolution: string = "480p"
): Promise<AnimeVideoResult> {
  try {
    const res = await fetch(`/api/anime/video?chapterUrlId=${episodeId}&reso=${resolution}`);
    if (!res.ok) return { url: null, type: "direct", availableResolutions: [] };
    const data = await res.json();
    return {
      url: data.url || null,
      type: data.type || "direct",
      availableResolutions: data.availableResolutions || [],
    };
  } catch {
    return { url: null, type: "direct", availableResolutions: [] };
  }
}

// ==================== KOMIK API ====================

export async function getKomikLatest(type: "project" | "mirror"): Promise<Komik[]> {
  const res = await fetchWithCache<KomikListResponse>(
    `${BASE_URL}/komik/latest?type=${type}`,
    CACHE_TIMES.LATEST,
    [CACHE_TAGS.KOMIK_LATEST, `komik-latest-${type}`]
  );
  return ensureArray(res.data).map(transformKomik);
}

export async function getKomikPopular(page: number = 1): Promise<Komik[]> {
  const res = await fetchWithCache<KomikListResponse>(
    `${BASE_URL}/komik/popular?page=${page}`,
    CACHE_TIMES.POPULAR,
    [CACHE_TAGS.KOMIK_POPULAR]
  );
  return ensureArray(res.data).map(transformKomik);
}

export async function getKomikRecommended(type: "manhwa" | "manhua" | "manga"): Promise<Komik[]> {
  const res = await fetchWithCache<KomikListResponse>(
    `${BASE_URL}/komik/recommended?type=${type}`,
    CACHE_TIMES.POPULAR,
    [CACHE_TAGS.KOMIK_RECOMMENDED, `komik-recommended-${type}`]
  );
  return ensureArray(res.data).map(transformKomik);
}

export async function getKomikDetail(mangaId: string): Promise<Komik | null> {
  const res = await fetchWithCache<KomikDetailResponse>(
    `${BASE_URL}/komik/detail?manga_id=${mangaId}`,
    CACHE_TIMES.DETAIL,
    [CACHE_TAGS.KOMIK_DETAIL, `komik-${mangaId}`]
  );
  return res.data ? transformKomik(res.data) : null;
}

export async function getKomikChapterList(mangaId: string): Promise<KomikChapter[]> {
  const res = await fetchWithCache<KomikListResponse>(
    `${BASE_URL}/komik/chapterlist?manga_id=${mangaId}`,
    CACHE_TIMES.DETAIL,
    [CACHE_TAGS.KOMIK_CHAPTERS, `komik-chapters-${mangaId}`]
  );
  const chapters = ensureArray(res.data).map((item) =>
    transformKomikChapter(item as RawKomikChapterItem)
  );

  // Sort ascending by chapter number so chapters[0] = earliest, chapters[last] = latest.
  // The external API returns chapters in descending order (newest first).
  return chapters.sort((a, b) => {
    const numA = typeof a.chapter === "number" ? a.chapter : parseFloat(String(a.chapter)) || 0;
    const numB = typeof b.chapter === "number" ? b.chapter : parseFloat(String(b.chapter)) || 0;
    return numA - numB;
  });
}

export async function searchKomik(query: string): Promise<Komik[]> {
  const res = await fetchWithCache<KomikListResponse>(
    `${BASE_URL}/komik/search?query=${encodeURIComponent(query)}`,
    CACHE_TIMES.SEARCH
  );
  return ensureArray(res.data).map(transformKomik);
}

export async function getKomikImages(chapterId: string): Promise<KomikImage[]> {
  const res = await fetchWithCache<KomikImageResponse>(
    `${BASE_URL}/komik/getimage?chapter_id=${chapterId}`,
    CACHE_TIMES.IMAGES,
    [CACHE_TAGS.KOMIK_IMAGES, `chapter-${chapterId}`]
  );
  const imageUrls = res.data?.chapter?.data || [];
  return imageUrls.map((url: string, index: number) => ({
    url,
    page: index + 1,
  }));
}

// ==================== HOMEPAGE ====================

export async function getHomepageData() {
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

// ==================== TRANSFORMERS ====================

function transformAnimeList(raw: RawAnimeListItem): Anime {
  return {
    urlId: raw.urlId || raw.url_id || raw.url || "",
    title: raw.title || raw.judul || "",
    thumbnail: raw.thumbnail || raw.image || raw.cover || "",
    synopsis: raw.synopsis || raw.sinopsis || raw.description,
    rating: raw.rating,
    type: raw.type,
    status: raw.status,
    genres: raw.genres || raw.genre || [],
    // Sort ascending by episode number so episodes[0] = first, episodes[last] = latest.
    // The external API returns episodes in descending order (newest first).
    episodes: (raw.episodes || raw.chapter || [])
      .map((ep) => ({
        title: ep.title || ep.ch || "",
        url: ep.url,
        date: ep.date,
      }))
      .sort((a, b) => extractEpisodeNumber(a.title) - extractEpisodeNumber(b.title)),
  };
}

function transformAnimeDetail(raw: RawAnimeListItem): Anime {
  return {
    urlId: raw.urlId || raw.url_id || raw.url || "",
    title: raw.title || raw.judul || "",
    thumbnail: raw.thumbnail || raw.image || raw.cover || "",
    cover: raw.cover || raw.thumbnail || raw.image,
    synopsis: raw.synopsis || raw.sinopsis || raw.description,
    rating: raw.rating,
    type: raw.type,
    status: raw.status,
    genres: raw.genres || raw.genre || [],
    // Sort ascending by episode number so episodes[0] = first, episodes[last] = latest.
    // The external API returns episodes in descending order (newest first).
    episodes: (raw.episodes || raw.chapter || [])
      .map((ep) => ({
        title: ep.title || ep.ch || "",
        url: ep.url,
        date: ep.date,
      }))
      .sort((a, b) => extractEpisodeNumber(a.title) - extractEpisodeNumber(b.title)),
    totalEpisodes: raw.total_episodes || raw.totalEpisodes,
  };
}

function transformKomik(raw: RawKomikItem): Komik {
  return {
    manga_id: raw.manga_id || "",
    title: raw.title || "",
    thumbnail: raw.thumbnail || raw.cover || raw.cover_image_url || "",
    cover: raw.cover || raw.thumbnail || raw.cover_image_url,
    type: raw.type,
    status:
      typeof raw.status === "number" ? (raw.status === 1 ? "Ongoing" : "Completed") : raw.status,
    rating: raw.rating || raw.user_rate,
    description: raw.description || raw.synopsis,
    author: raw.author || raw.taxonomy?.Author?.[0]?.name,
    artist: raw.artist || raw.taxonomy?.Artist?.[0]?.name,
    genres: raw.genres || raw.taxonomy?.Genre?.map((g) => g.name) || [],
    chapters: (raw.chapters || [])
      .map((ch) => ({
        chapter_id: ch.chapter_id || ch.id || "",
        title: ch.title || `Chapter ${ch.chapter || ch.chapter_number}`,
        chapter: ch.chapter || ch.chapter_number,
        date: ch.date || ch.created_at,
      }))
      .sort((a, b) => {
        const numA = typeof a.chapter === "number" ? a.chapter : parseFloat(String(a.chapter)) || 0;
        const numB = typeof b.chapter === "number" ? b.chapter : parseFloat(String(b.chapter)) || 0;
        return numA - numB;
      }),
    latestChapter: raw.latest_chapter || raw.latestChapter,
    updatedAt: raw.updated_at || raw.updatedAt,
  };
}

function transformKomikChapter(raw: RawKomikChapterItem): KomikChapter {
  return {
    chapter_id: raw.chapter_id || raw.id || "",
    title: raw.title || `Chapter ${raw.chapter || raw.chapter_number}`,
    chapter: raw.chapter || raw.chapter_number || 0,
    date: raw.date || raw.created_at,
  };
}
