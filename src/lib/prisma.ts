import "server-only";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Determine if we're using Supabase pooler (port 6543 for transaction mode)
const connectionString = process.env.DATABASE_URL;

// Create pool only once with conservative settings for serverless
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Limit connections for serverless environment
    max: 5, // Maximum connections in pool (Supabase free tier has limited connections)
    min: 1, // Minimum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Timeout after 10s when acquiring connection
  });

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache globally in ALL environments (important for serverless)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
