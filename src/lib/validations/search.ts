import { z } from "zod";

// ─── GET /api/search ───────────────────────────────────────────────

export const searchParamsSchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters").max(200),
  type: z.enum(["anime", "komik"]).nullish(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const n = parseInt(val || "20", 10);
      return Math.min(isNaN(n) ? 20 : n, 50);
    }),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
