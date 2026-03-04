import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isClerkConfigured } from "@/lib/auth-config";
import { getOrCreateUser, type DbUser } from "@/lib/user";
import {
  errorToResponse,
  ValidationError,
  FeatureNotConfiguredError,
  AuthError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

// ─── Authenticated Request Context ──────────────────────────────────

export interface AuthenticatedContext {
  user: DbUser;
  request: NextRequest;
}

// ─── withAuth Higher-Order Wrapper ──────────────────────────────────

/**
 * Wraps an API route handler with:
 * 1. Clerk configuration check
 * 2. Authentication + user resolution
 * 3. Structured error handling with logging
 *
 * Eliminates the duplicated auth guard pattern across 6 routes.
 */
export function withAuth(
  handler: (ctx: AuthenticatedContext) => Promise<NextResponse>,
  routeName: string
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      if (!isClerkConfigured()) {
        throw new FeatureNotConfiguredError("Authentication");
      }

      const user = await getOrCreateUser();
      if (!user) {
        throw new AuthError();
      }

      return await handler({ user, request });
    } catch (error) {
      logger.error(`${routeName} error`, error, {
        route: routeName,
        method: request.method,
        url: request.url,
      });
      return errorToResponse(error);
    }
  };
}

// ─── handleApiError ─────────────────────────────────────────────────

/**
 * Lightweight error handler for routes that don't need auth
 * (e.g. search, anime/video, health).
 */
export function handleApiError(error: unknown, routeName: string): NextResponse {
  logger.error(`${routeName} error`, error, { route: routeName });
  return errorToResponse(error);
}

// ─── Zod Validation Helpers ─────────────────────────────────────────

/**
 * Convert Zod error issues into a field map for our ValidationError.
 */
function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    fields[path] = issue.message;
  }
  return fields;
}

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Throws ValidationError on parse/validation failure.
 */
export async function validateBody<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Validation failed", zodFieldErrors(result.error));
  }
  return result.data;
}

/**
 * Parse and validate URL search params against a Zod schema.
 * Throws ValidationError on validation failure.
 */
export function validateSearchParams<T>(request: NextRequest, schema: z.ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ValidationError("Invalid query parameters", zodFieldErrors(result.error));
  }
  return result.data;
}

// ─── Search Params Helper ───────────────────────────────────────────

/**
 * Extract search params from a request URL.
 */
export function getSearchParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}
