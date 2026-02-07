import type { NextConfig } from "next";

// Validate critical environment variables at build time
const requiredEnvVars = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

// Only validate in production builds (not during CI/testing)
if (process.env.NODE_ENV === "production" && !process.env.CI) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(
        `⚠️ Missing environment variable: ${envVar}\n` +
          `Please set it in your Vercel dashboard or .env file.`
      );
    }
  }
}

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment
  output: "standalone",

  // Allow images from external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },

  // Mark server-only packages
  serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"],

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
