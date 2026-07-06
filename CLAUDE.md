# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test             # Vitest unit tests (run once)
pnpm test:watch       # Vitest in watch mode
pnpm test:e2e         # Playwright e2e tests
pnpm test:agent-browser  # Playwright visual QA tests

# Database
pnpm prisma:generate  # Regenerate Prisma client after schema changes
pnpm prisma:migrate   # Create and apply a new migration
pnpm prisma:studio    # Open Prisma Studio GUI
pnpm db:setup         # generate + deploy + seed (first-time setup)
```

## Architecture

**Next.js 15 App Router** with an embedded REST backend. All routes live under `src/app/`.

### Route structure
- `src/app/[locale]/` — locale-prefixed pages (default: `pt`, 33+ locales via next-intl)
- `src/app/[locale]/(landing-page)/(root)/` — the main landing page
- `src/app/[locale]/admin/login/` — admin login
- `src/app/api/v1/` — embedded REST API (Next.js Route Handlers)
  - Public: `/auth/*`, `/landing-pages/default`, `/newsletter/subscriptions`
  - Protected (ADMIN JWT): `/admin/**`

### i18n
next-intl handles routing. Locale files are in `lang/*.json`. Default locale is `pt`. The middleware (`src/middleware.ts`) skips `/api`, `/_next`, and static assets, and redirects localeless paths to `/{defaultLocale}{path}`.

### Landing CMS
Database-driven content hierarchy: `LandingPage → LandingSection → LandingItem + LandingAsset`. Assets are stored as base64 in the DB. The client-side API is `src/lib/api/festival-api.ts` (`festivalApi` singleton). Content types are defined in `src/lib/landing/types.ts`.

### Admin mode
`AdminModeContext` (`src/context/AdminModeContext.tsx`) stores the JWT session in localStorage and exposes `isAdmin`, `accessToken`, and `logout`. The API client automatically retries with a refreshed token on 401s.

### Database
PostgreSQL via Prisma. Schema at `prisma/schema.prisma`. Key models: `User`, `RefreshToken`, `LandingPage/Section/Item/Asset`, `NewsletterSubscription`, `RequestLog`.

### Auth
JWT with access (15m) + refresh (7d) tokens. Secrets and TTLs come from env vars (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, etc.). Passwords hashed with bcryptjs.

### Key env vars
Copy `.env.example` to `.env.local`. Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Set `DATABASE_REQUIRED=false` to skip DB connection at startup.
