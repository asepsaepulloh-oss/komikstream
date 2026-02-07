import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeAnimeLatest, scrapeKomikLatest, delay } from "@/lib/scraper";

/**
 * POST /api/sync/latest
 * Incremental sync - only adds new items that don't exist in database
 * Protected with CRON_SECRET
 */
export async function POST(request: NextRequest) {
  // Security: Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if CRON_SECRET is set and matches, or if not set (for development)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  // Create sync log entry
  const syncLog = await prisma.syncLog.create({
    data: {
      type: "incremental_sync",
      status: "running",
    },
  });

  let newAnimeCount = 0;
  let newKomikCount = 0;
  let errorMessage: string | null = null;

  try {
    console.log("🔄 Starting incremental sync...");

    // 1. Sync latest anime
    console.log("📺 Syncing anime...");
    const latestAnime = await scrapeAnimeLatest();

    for (const anime of latestAnime.slice(0, 20)) {
      try {
        const exists = await prisma.anime.findUnique({
          where: { urlId: anime.urlId },
        });

        if (!exists) {
          await prisma.anime.create({ data: anime });
          newAnimeCount++;
          console.log(`  ✓ Added anime: ${anime.title}`);
        } else {
          // Update lastScraped timestamp
          await prisma.anime.update({
            where: { urlId: anime.urlId },
            data: { lastScraped: new Date() },
          });
        }
      } catch (err) {
        console.error(`  ✗ Failed to save anime: ${anime.title}`, err);
      }
    }

    await delay(2000); // Rate limit between anime and komik

    // 2. Sync latest komik
    console.log("📚 Syncing komik...");
    const latestKomik = await scrapeKomikLatest("mirror");

    for (const komik of latestKomik.slice(0, 20)) {
      try {
        const exists = await prisma.komik.findUnique({
          where: { mangaId: komik.mangaId },
        });

        if (!exists) {
          await prisma.komik.create({ data: komik });
          newKomikCount++;
          console.log(`  ✓ Added komik: ${komik.title}`);
        } else {
          // Update chapter info and lastScraped
          await prisma.komik.update({
            where: { mangaId: komik.mangaId },
            data: {
              latestChapterId: komik.latestChapterId,
              latestChapterNumber: komik.latestChapterNumber,
              latestChapterDate: komik.latestChapterDate,
              lastScraped: new Date(),
            },
          });
        }
      } catch (err) {
        console.error(`  ✗ Failed to save komik: ${komik.title}`, err);
      }
    }

    console.log(`✅ Sync completed: ${newAnimeCount} new anime, ${newKomikCount} new komik`);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Sync failed:", errorMessage);
  }

  const duration = Date.now() - startTime;

  // Update sync log
  await prisma.syncLog.update({
    where: { id: syncLog.id },
    data: {
      status: errorMessage ? "failed" : "success",
      itemsCount: newAnimeCount + newKomikCount,
      errorMsg: errorMessage,
      completedAt: new Date(),
      duration,
    },
  });

  return NextResponse.json({
    success: !errorMessage,
    newAnime: newAnimeCount,
    newKomik: newKomikCount,
    duration,
    error: errorMessage,
  });
}

/**
 * GET /api/sync/latest
 * Get sync status and last sync info
 */
export async function GET() {
  try {
    const [lastSync, stats] = await Promise.all([
      prisma.syncLog.findFirst({
        orderBy: { startedAt: "desc" },
      }),
      Promise.all([prisma.anime.count(), prisma.komik.count()]),
    ]);

    return NextResponse.json({
      status: "ok",
      lastSync: lastSync
        ? {
            id: lastSync.id,
            type: lastSync.type,
            status: lastSync.status,
            itemsCount: lastSync.itemsCount,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
            duration: lastSync.duration,
            error: lastSync.errorMsg,
          }
        : null,
      stats: {
        animeCount: stats[0],
        komikCount: stats[1],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 });
  }
}
