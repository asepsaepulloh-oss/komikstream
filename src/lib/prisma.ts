import "server-only";

import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Global singleton pattern for Vercel serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";

/**
 * Check if database is configured (DATABASE_URL exists).
 * Used by getSafePrisma() to gracefully degrade when DB is unavailable.
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * Normalize DATABASE_URL for the pg library:
 *  - Replace `sslmode=require` with `sslmode=verify-full` to suppress
 *    the pg v8.x SECURITY WARNING about deprecated SSL mode aliases.
 *  - Remove `channel_binding=require` as it's a libpq-specific param
 *    that pg handles via the PoolConfig instead.
 */
function normalizeConnectionString(url: string): { url: string; channelBinding?: string } {
  const parsed = new URL(url);
  const channelBinding = parsed.searchParams.get("channel_binding") ?? undefined;

  // Fix SSL mode: 'require' triggers a deprecation warning in pg 8.x
  const sslMode = parsed.searchParams.get("sslmode");
  if (sslMode === "require" || sslMode === "prefer" || sslMode === "verify-ca") {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  // Remove channel_binding from URL — handled via PoolConfig
  parsed.searchParams.delete("channel_binding");

  return { url: parsed.toString(), channelBinding };
}

// Only initialize pool/prisma if DATABASE_URL is present.
// This prevents build errors when DB is not configured (e.g. CI without DB).
function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined. Please set it in your environment variables.");
  }

  const { url: normalizedUrl } = normalizeConnectionString(connectionString);

  const poolConfig: PoolConfig = {
    connectionString: normalizedUrl,
    ssl: { rejectUnauthorized: isProduction },
    // Serverless optimization: minimal connections
    max: isProduction ? 1 : 5,
    min: 0,
    idleTimeoutMillis: 10_000,
    // Neon cold starts can take 3-7s; 10s handles worst-case
    connectionTimeoutMillis: isProduction ? 10_000 : 5_000,
  };

  const pool = globalForPrisma.pool ?? new Pool(poolConfig);

  // Log pool errors instead of crashing the process
  pool.on("error", (err) => {
    console.error("[pg:pool] Unexpected pool error:", err.message);
  });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });

  // Cache globally (critical for serverless to prevent connection exhaustion)
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = client;
    globalForPrisma.pool = pool;
  }

  return client;
}

/**
 * Get the singleton PrismaClient instance.
 * Throws if DATABASE_URL is not set.
 */
const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

/**
 * Safe Prisma accessor — returns PrismaClient or null.
 * Use this in API routes to gracefully handle missing DB config
 * instead of duplicating dynamic imports everywhere.
 */
export async function getSafePrisma(): Promise<PrismaClient | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }
  try {
    return globalForPrisma.prisma ?? createPrismaClient();
  } catch {
    return null;
  }
}

export { prisma };
