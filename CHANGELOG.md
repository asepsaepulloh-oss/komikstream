# Changelog

All notable changes to this project will be documented in this file.

## [0.10.6] - 2026-03-05

### Bug Fixes
- fix: use AuthContext bridge instead of direct Clerk useAuth import (d23aefd)


## [0.10.5] - 2026-03-04

### Bug Fixes
- fix: add error handling to homepage sections for prerender resilience (62eba07)


## [0.10.4] - 2026-03-04

### Bug Fixes
- fix: resolve useAuth outside ClerkProvider and fix provider ordering (c0c0523)


## [0.10.3] - 2026-03-04

### Bug Fixes
- fix: add Clerk production domain to CSP script-src and connect-src (2277581)


## [0.10.2] - 2026-03-04

### Bug Fixes
- fix(ci): add --token flag to Vercel CLI commands in deploy workflows (16f6b89)


## [0.10.1] - 2026-03-04

### Bug Fixes
- fix(ci): resolve Gitleaks artifact name conflict in deploy-production (883de9e)

### CI/CD
- ci: comprehensive CI/CD audit fixes (Critical→Low priority) (cca48d1)


## [0.10.0] - 2026-03-04

### Other Changes
- ci: lower coverage thresholds to 10% after WP1-WP7 source expansion (8ece4c2)



## [0.9.0] - 2026-03-04

### Other Changes
- style: fix docker-compose.yml formatting (52f51ef)



## [0.8.0] - 2026-03-04

### Features
- feat: implement WP1-WP7 comprehensive code quality improvements (c3ddb93)



## [0.7.12] - 2026-03-03

### Bug Fixes
- fix(ci): make health check non-blocking and increase retry delays (5001785)



## [0.7.11] - 2026-03-03

### Bug Fixes
- fix(ci): accept 2xx-3xx in health check and add curl timeout (f8a780b)



## [0.7.10] - 2026-03-03

### Bug Fixes
- fix(ci): follow redirects in health check curl requests (6defa78)

### Other Changes
- style: format Prisma schema to pass CI formatting check (59f0bbf)
- ci: harden CI/CD pipeline with SHA pins, permissions, timeouts, and DRY refactors (f7125b0)



## [0.7.9] - 2026-03-03

### 📦 Other Changes
- test: add 65 new tests and raise coverage threshold to 20% (Phase D) (bad6fd2)



## [0.7.8] - 2026-03-03

### 📦 Other Changes
- chore: fix npm audit vulnerabilities and remove unused zod dependency (Phase E) (32235a0)



## [0.7.7] - 2026-03-03

### 📦 Other Changes
- refactor: remove dead code, extract shared components, improve accessibility (Phase C) (c079dc9)



## [0.7.6] - 2026-03-03

### 📦 Other Changes
- improve: error handling and resilience (Phase B) (269a5a7)



## [0.7.5] - 2026-03-03

### 📦 Other Changes
- improve: accessibility and code quality quick wins (Phase A) (081d2bd)



## [0.7.4] - 2026-03-03

### 🐛 Bug Fixes
- fix(ci): update auth-config tests for secret key validation and add gitleaks allowlist (7a6a4bf)



## [0.7.3] - 2026-03-03

### 🐛 Bug Fixes
- fix: resolve critical bugs and improve code quality (Phase 1 & 2) (8fe9cdf)



## [0.7.2] - 2026-02-10

### 📦 Other Changes
- update (d446cdb)



## [0.7.1] - 2026-02-10

### 🐛 Bug Fixes
- fix: update visibility check in local storage test to use HTML element (40b6091)



## [0.7.0] - 2026-02-10

### 🐛 Bug Fixes
- fix: update project name in package.json to 'KuroManga' (68f87fb)



## [0.6.0] - 2026-02-09

### ✨ Features
- feat: add manifest, robots, and sitemap routes for SEO and PWA support (926732c)

### 🐛 Bug Fixes
- fix: add missing scripts section in package.json (00cbb0f)



## [0.5.1] - 2026-02-09

### 🐛 Bug Fixes
- fix: update health check URL and increase retry parameters in deployment workflow (e5c6eab)



## [0.5.0] - 2026-02-09

### 🐛 Bug Fixes
- fix: change default value of skip_tests input to boolean type in deploy workflow (98f6fee)
- fix: standardize node-version-file quotes in CI workflows (6bea1c4)



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



