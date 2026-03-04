import { NextRequest, NextResponse } from "next/server";
import { handleApiError, validateSearchParams } from "@/lib/api-helpers";
import { ExternalApiError, NotFoundError } from "@/lib/errors";
import { animeVideoParamsSchema } from "@/lib/validations/anime-video";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sansekai.my.id/api";

export async function GET(request: NextRequest) {
  try {
    const { chapterUrlId, reso: resolution } = validateSearchParams(
      request,
      animeVideoParamsSchema
    );

    const url = `${BASE_URL}/anime/getvideo?chapterUrlId=${chapterUrlId}&reso=${resolution}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://api.sansekai.my.id/",
      },
    });

    if (!res.ok) {
      throw new ExternalApiError("Failed to fetch video from upstream", {
        status: res.status,
        url,
      });
    }

    const data = await res.json();
    const episodeData = data.data?.[0];

    if (!episodeData) {
      throw new NotFoundError("Video");
    }

    const stream = episodeData.stream?.find((s: { reso: string }) => s.reso === resolution);
    const videoUrl = stream?.link || episodeData.stream?.[0]?.link || null;

    return NextResponse.json({ url: videoUrl });
  } catch (error) {
    return handleApiError(error, "GET /api/anime/video");
  }
}
