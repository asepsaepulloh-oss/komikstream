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

// Content Security Policy
// - frame-src: allows video embeds from any HTTPS source (dynamic third-party player URLs)
// - img-src: allows HTTPS images from any source (external manga/anime cover CDNs)
// - script-src 'unsafe-eval' 'unsafe-inline': required by Next.js dev mode; production
//   builds don't inject eval but Clerk and analytics scripts may need inline
// - connect-src: allows API calls to the external data source
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  "frame-src https: blob:",
  "connect-src 'self' https://api.sansekai.my.id https://*.clerk.accounts.dev https://*.clerk.dev wss://*.clerk.dev",
  "media-src 'self' https: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment
  output: "standalone",

  // Remove X-Powered-By header (information disclosure)
  poweredByHeader: false,

  // Security headers (defense-in-depth for Docker/standalone deployment)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization for performance
  // NOTE: All images currently use `unoptimized` (bypass optimization), so
  // remotePatterns only applies if `unoptimized` is removed in the future.
  // The wildcard is necessary because the external API (api.sansekai.my.id)
  // returns cover images from unpredictable CDN hostnames.
  // Mitigations: HTTPS-only, CSP img-src restricts to https:/data:/blob:.
  // TODO: Replace with an image proxy (e.g. /api/img?url=...) to remove wildcard.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Enable modern formats for 60-80% size reduction
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 7 days
    minimumCacheTTL: 604800,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for thumbnails
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Mark server-only packages
  serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"],

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Enable persistent file-system cache for Turbopack builds.
    // Only takes effect when building with `next build --turbopack`.
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
