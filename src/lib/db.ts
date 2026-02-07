// Prisma client will be available after running `npx prisma generate`
// For now, we'll create a placeholder that works without the database

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any = null;

try {
  // Dynamic import to avoid build errors when Prisma is not generated yet
  const { PrismaClient } = require("@prisma/client");
  
  const globalForPrisma = globalThis as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma: any | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch {
  // Prisma client not generated yet
  console.warn("Prisma client not available. Run `npx prisma generate` after setting up your database.");
}

export { prisma };
export default prisma;
