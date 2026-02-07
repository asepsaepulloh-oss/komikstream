// Prisma client will be available after running `npx prisma generate`
// For now, we'll create a placeholder that works without the database

import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

// Check if we should skip database connection (for CI builds)
const shouldSkipDB = (): boolean => {
  // Skip during build time with dummy credentials
  if (process.env.SKIP_DB_CONNECTION === "true") {
    return true;
  }

  // Skip if DATABASE_URL is missing or contains dummy
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("dummy") || dbUrl.includes("localhost:5432")) {
    return true;
  }

  return false;
};

async function initPrisma(): Promise<PrismaClient | null> {
  // Skip DB connection during build or CI
  if (shouldSkipDB()) {
    if (process.env.NODE_ENV !== "production") {
      console.log("📦 Skipping database connection (build mode or CI)");
    }
    return null;
  }

  try {
    // Dynamic import to avoid build errors when Prisma is not generated yet
    const { PrismaClient: PrismaClientClass } = await import("@prisma/client");

    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };

    prisma = globalForPrisma.prisma ?? new PrismaClientClass();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }

    return prisma;
  } catch {
    // Prisma client not generated yet
    console.warn(
      "Prisma client not available. Run `npx prisma generate` after setting up your database."
    );
    return null;
  }
}

// Initialize prisma on module load
initPrisma();

export { prisma };
export default prisma;
