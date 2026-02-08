# Changelog

All notable changes to this project will be documented in this file.

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



