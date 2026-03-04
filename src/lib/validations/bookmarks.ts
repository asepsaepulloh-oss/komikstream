import { z } from "zod";

// ─── Shared Enums ───────────────────────────────────────────────────

export const contentTypeSchema = z.enum(["komik", "anime"], {
  error: "Type must be 'komik' or 'anime'",
});

// ─── POST /api/bookmarks ───────────────────────────────────────────

export const createBookmarkSchema = z.object({
  type: contentTypeSchema,
  itemId: z.string().min(1, "itemId is required").max(500),
  title: z.string().min(1, "title is required").max(500),
  thumbnail: z.string().url("thumbnail must be a valid URL").max(2000).nullish(),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;

// ─── GET /api/bookmarks ────────────────────────────────────────────

export const getBookmarksParamsSchema = z.object({
  type: contentTypeSchema.nullish(),
});

export type GetBookmarksParams = z.infer<typeof getBookmarksParamsSchema>;

// ─── DELETE /api/bookmarks ─────────────────────────────────────────

export const deleteBookmarkParamsSchema = z.object({
  type: z.string().min(1, "type is required"),
  itemId: z.string().min(1, "itemId is required"),
});

export type DeleteBookmarkParams = z.infer<typeof deleteBookmarkParamsSchema>;
