import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.sansekai.my.id/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chapterUrlId = searchParams.get("chapterUrlId");
  const resolution = searchParams.get("reso") || "480p";

  if (!chapterUrlId) {
    return NextResponse.json({ error: "Missing chapterUrlId parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${BASE_URL}/anime/getvideo?chapterUrlId=${chapterUrlId}&reso=${resolution}`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: "https://api.sansekai.my.id/",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: res.status });
    }

    const data = await res.json();
    const episodeData = data.data?.[0];

    if (!episodeData) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const stream = episodeData.stream?.find((s: { reso: string }) => s.reso === resolution);

    const videoUrl = stream?.link || episodeData.stream?.[0]?.link || null;

    return NextResponse.json({ url: videoUrl });
  } catch (error) {
    console.error("Error fetching anime video:", error);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}
