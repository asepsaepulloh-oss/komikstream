import { z } from "zod";

// ─── GET /api/anime/video ──────────────────────────────────────────

export const animeVideoParamsSchema = z.object({
  chapterUrlId: z.string().min(1, "chapterUrlId is required").max(500),
  reso: z.string().max(20).default("480p"),
});

export type AnimeVideoParams = z.infer<typeof animeVideoParamsSchema>;
