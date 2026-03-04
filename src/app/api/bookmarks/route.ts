import { NextResponse } from "next/server";
import { withAuth, validateBody, validateSearchParams } from "@/lib/api-helpers";
import { findBookmarks, upsertBookmark, deleteBookmark } from "@/lib/db";
import {
  createBookmarkSchema,
  getBookmarksParamsSchema,
  deleteBookmarkParamsSchema,
} from "@/lib/validations/bookmarks";

// GET /api/bookmarks - Get all bookmarks for current user
export const GET = withAuth(async ({ user, request }) => {
  const { type } = validateSearchParams(request, getBookmarksParamsSchema);

  const bookmarks = await findBookmarks(user.id, type ?? null);
  return NextResponse.json({ bookmarks });
}, "GET /api/bookmarks");

// POST /api/bookmarks - Add a bookmark
export const POST = withAuth(async ({ user, request }) => {
  const { type, itemId, title, thumbnail } = await validateBody(request, createBookmarkSchema);

  const bookmark = await upsertBookmark({
    userId: user.id,
    type,
    itemId,
    title,
    thumbnail: thumbnail ?? undefined,
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}, "POST /api/bookmarks");

// DELETE /api/bookmarks - Remove a bookmark
export const DELETE = withAuth(async ({ user, request }) => {
  const { type, itemId } = validateSearchParams(request, deleteBookmarkParamsSchema);

  await deleteBookmark(user.id, type, itemId);
  return NextResponse.json({ success: true });
}, "DELETE /api/bookmarks");
