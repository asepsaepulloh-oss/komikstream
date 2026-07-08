**AGENTS — Repo Assistant Instructions**

Purpose: Provide concise, actionable guidance for AI coding agents working in this repository.

**Quick Commands**
- **Install:** `pnpm install`
- **Dev:** `pnpm dev` (uses Next.js + Turbopack)
- **Build:** `pnpm build` (runs `prisma generate` then `next build`)
- **Build (Azure):** `pnpm run build:azure`
- **Test (unit):** `pnpm test`
- **Test (e2e):** `pnpm run test:e2e`
- **Lint:** `pnpm run lint`
- **Typecheck:** `pnpm run typecheck`

**Architecture & Key Areas**
- **Framework:** Next.js app using the /src/app directory (App Router).
- **Database:** Prisma schema at [prisma/schema.prisma](prisma/schema.prisma) and migrations in `prisma/migrations/`.
- **Workers:** Cloudflare Worker code under `workers/` and `workers/proxy/`.
- **Server/runtime targets:** Builds for both Node/Azure and Cloudflare (`build:azure`, `build:cf`).
- **Tests:** Unit tests under `__tests__/` and e2e tests under `e2e/` (Playwright).

**Conventions**
- **Package manager:** `pnpm` (see `packageManager` in `package.json`).
- **TypeScript:** Strict typing; run `pnpm run typecheck` before major changes.
- **Formatting & linting:** `prettier` and `eslint` with Husky + lint-staged pre-commit hooks.
- **Small, focused changes:** Prefer several small PRs over one large change.

**Agent Guidelines (how to operate)**
- **Discover first:** Link to existing docs instead of duplicating them. See [README.md](README.md).
- **Run scripts locally:** Run `pnpm install` then `pnpm run typecheck` and `pnpm test` for safety.
- **When modifying runtime code:** If changes affect workers or build targets, run the appropriate build script (`build:cf` or `build:azure`) and note differences.
- **E2E or integration changes:** Run Playwright tests (`pnpm run test:e2e`) where relevant.
- **Database changes:** For Prisma schema edits, update migrations and run `prisma generate`; do not apply destructive migrations without human review.
- **Ask before risky changes:** If a change touches infra, deploy scripts, or migrations, request human confirmation.

**Where to look first**
- [README.md](README.md)
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/app](src/app)
- [workers/proxy/index.ts](workers/proxy/index.ts)
- [__tests__/](__tests__/)
- [e2e/](e2e/)

**Suggested next customizations**
- Add a repository-scoped `.github/copilot-instructions.md` for quick onboarding hints per area (frontend/backend/workers).
- Consider small skill files for running test suites and common refactors.

If you'd like, I can create `.github/copilot-instructions.md` next scoped to frontend or workers.
