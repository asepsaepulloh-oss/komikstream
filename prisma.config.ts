// Prisma configuration for Vercel + Supabase
// See: https://pris.ly/d/config-datasource
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use pooler URL for runtime queries
    url: process.env["DATABASE_URL"],
    // Use direct URL for migrations (bypasses pooler)
    directUrl: process.env["DIRECT_URL"],
  },
});
