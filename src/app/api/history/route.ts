import { NextResponse } from "next/server";
import { withAuth, validateBody, validateSearchParams } from "@/lib/api-helpers";
import { findHistory, upsertHistory, deleteHistory } from "@/lib/db";
import {
  createHistorySchema,
  getHistoryParamsSchema,
  deleteHistoryParamsSchema,
} from "@/lib/validations/history";

// GET /api/history - Get reading/watching history for current user
export const GET = withAuth(async ({ user, request }) => {
  const { type, limit } = validateSearchParams(request, getHistoryParamsSchema);

  const history = await findHistory(user.id, type ?? null, limit);
  return NextResponse.json({ history });
}, "GET /api/history");

// POST /api/history - Add or update reading/watching progress
export const POST = withAuth(async ({ user, request }) => {
  const { type, itemId, title, thumbnail, progress, progressTitle } = await validateBody(
    request,
    createHistorySchema
  );

  const historyEntry = await upsertHistory({
    userId: user.id,
    type,
    itemId,
    title,
    thumbnail: thumbnail ?? undefined,
    progress,
    progressTitle: progressTitle ?? undefined,
  });

  return NextResponse.json({ history: historyEntry }, { status: 201 });
}, "POST /api/history");

// DELETE /api/history - Remove history entry
export const DELETE = withAuth(async ({ user, request }) => {
  const data = validateSearchParams(request, deleteHistoryParamsSchema);

  if (data.clearAll) {
    await deleteHistory(user.id, data.type ?? null);
  } else {
    await deleteHistory(user.id, data.type!, data.itemId!);
  }

  return NextResponse.json({ success: true });
}, "DELETE /api/history");
