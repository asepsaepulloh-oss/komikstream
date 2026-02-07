// Prisma client will be available after running `npx prisma generate`
// For now, we'll create a placeholder that works without the database

import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

async function initPrisma(): Promise<PrismaClient | null> {
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
