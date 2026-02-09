# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-02-09

### ✨ Features
- feat: update CI/CD workflows and add security headers (e157dc6)



## [0.3.6] - 2026-02-09

### 🐛 Bug Fixes
- fix: remove transform settings from Jest configuration (daddc22)



## [0.3.5] - 2026-02-08

### 🐛 Bug Fixes
- fix: resolve merge conflict in package-lock.json (ab5a78e)
- fix: re-add @tailwindcss/postcss required by postcss config (5b4f0a7)
- fix: update search API to use api-client, add prisma fallback for build (02f78e5)
- fix: revert homepage to simpler approach using HomePageClient (d1e094a)
- fix: force dynamic rendering for homepage to avoid build-time API calls (52994c9)
- fix: correct TypeScript types for Next.js fetch options (b62f029)

### 📦 Other Changes
- perf: major performance optimization (7245430)



## [0.3.4] - 2026-02-08

### 🐛 Bug Fixes
- fix: remove directUrl from prisma.config.ts and fix unused vars in e2e tests (11848a5)



## [0.3.3] - 2026-02-08

### 🐛 Bug Fixes
- fix: remove prisma migrate deploy from vercel-build (0bf5626)



## [0.3.2] - 2026-02-07

### 🐛 Bug Fixes
- fix: database connection for Clerk webhook and API routes (ef0b79f)



## [0.3.1] - 2026-02-07

### 🐛 Bug Fixes
- fix(e2e): make tests more resilient for CI environment (faad06a)



## [0.3.0] - 2026-02-07

### 🐛 Bug Fixes
- fix(ci): add mock Prisma client for CI/build environments (bed8736)



## [0.2.0] - 2026-02-07

### ✨ Features
- feat(ci): add comprehensive CI/CD upgrade (f335b85)
- feat: initial commit with CI/CD setup (b4a05ff)

### 🐛 Bug Fixes
- fix(ci): fix release workflow for repos with few commits (7885088)
- fix(ci): lower coverage threshold to match current test coverage (f8af750)
- fix: resolve database connection pool exhaustion (b0c317e)
- fix: resolve ESLint warnings and add comprehensive tests (1cb3a00)
- fix: reject dummy/placeholder Clerk keys in auth-config and middleware (278dea1)
- fix: replace useState+useEffect with useSyncExternalStore for mounted state (865bf79)
- fix: add ts-node dependency for Jest TypeScript config (427472f)
- fix: add workflow_call trigger to ci.yml for reusable workflow (1a682aa)
- fix: replace any types with proper interfaces in api-client.ts and fix require import in db.ts (b85f0fd)
- fix: rename jest.setup.ts to jest.setup.tsx for JSX support (b4b9051)

### 📦 Other Changes
- style: format code with Prettier (3cfb91c)



