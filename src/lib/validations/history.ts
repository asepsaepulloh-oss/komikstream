import { z } from "zod";
import { contentTypeSchema } from "./bookmarks";

// ─── POST /api/history ─────────────────────────────────────────────

export const createHistorySchema = z.object({
  type: contentTypeSchema,
  itemId: z.string().min(1, "itemId is required").max(500),
  title: z.string().min(1, "title is required").max(500),
  thumbnail: z.string().url("thumbnail must be a valid URL").max(2000).nullish(),
  progress: z.string().min(1, "progress is required").max(500),
  progressTitle: z.string().max(500).nullish(),
});

export type CreateHistoryInput = z.infer<typeof createHistorySchema>;

// ─── GET /api/history ──────────────────────────────────────────────

export const getHistoryParamsSchema = z.object({
  type: contentTypeSchema.nullish(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const n = parseInt(val || "50", 10);
      return Math.min(isNaN(n) ? 50 : n, 100);
    }),
});

export type GetHistoryParams = z.infer<typeof getHistoryParamsSchema>;

// ─── DELETE /api/history ───────────────────────────────────────────

export const deleteHistoryParamsSchema = z
  .object({
    type: z.string().nullish(),
    itemId: z.string().nullish(),
    clearAll: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  })
  .refine((data) => data.clearAll || (data.type && data.itemId), {
    message: "Either clearAll=true or both type and itemId must be provided",
  });

export type DeleteHistoryParams = z.infer<typeof deleteHistoryParamsSchema>;
