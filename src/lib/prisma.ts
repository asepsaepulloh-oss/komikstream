import "server-only";

import { Pool } from "pg";
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

// Only initialize pool/prisma if DATABASE_URL is present.
// This prevents build errors when DB is not configured (e.g. CI without DB).
function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined. Please set it in your environment variables.");
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      // Supabase requires SSL; reject unauthorized certs in production
      ssl: isProduction ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
      // Serverless optimization: minimal connections
      max: isProduction ? 1 : 5,
      min: 0,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
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
