# bang-for-buck-index

Data-driven web application that ranks alcoholic beverages across countries using a single metric: Cost per Liter of Pure Alcohol (CLPA), colloquially known as the "Bang-for-Buck" index.

This repo implements **PureHop** — MVP Phase 1 (beer). See [`PRD.md`](./PRD.md) for the full product spec.

## Stack

- **Next.js 15** (App Router, Server Components) + **TypeScript** (strict)
- **Supabase CLI** local stack (Postgres, Auth, REST, Studio) + **Drizzle ORM**
- **Tailwind CSS v4** + shadcn-style UI primitives
- **Zod** validated Server Actions, **Vitest** unit tests, **Playwright** E2E

## Prerequisites

- Node.js `>= 20` and `pnpm`
- Docker (required by `supabase start`)

## Quick start

```bash
pnpm install
cp .env.example .env.local        # ADMIN_SECRET etc. URLs are filled by db:start

pnpm db:start                     # supabase start + write .env.local
pnpm db:reset                     # optional: recreate DB from migrations + seed

pnpm dev                          # http://localhost:3000
```

Local services after `pnpm db:start`:

| URL | What |
| --- | --- |
| http://localhost:3000 | App |
| http://127.0.0.1:54323 | Supabase Studio |
| postgresql://postgres:postgres@127.0.0.1:54322/postgres | Postgres |
| http://127.0.0.1:54321 | Kong / API |

Admin moderation: open `/admin`, password = `ADMIN_SECRET` (default `dev-admin-secret`). Crowdsourced rows stay `verified=false` until you Verify.

## Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:start` | `supabase start` (idempotent) and sync `.env.local` |
| `pnpm db:reset` | `supabase db reset` — migrations + `supabase/seed.sql` |
| `pnpm db:stop` | Stop the local Supabase containers (data kept) |
| `pnpm db:types` | Generate `src/types/database.ts` from local schema |
| `pnpm test` | Vitest unit tests (CLPA math) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`next lint`) |
| `pnpm e2e` | Playwright E2E (`pnpm e2e:install` first) |

## Features

- **Global leaderboard** (`/`) ranked by CLPA with currency-unit toggle (USD / EUR / Local), PPP switch, venue/style/ABV filters.
- **Country leaderboards** (`/country/[code]`, e.g. `/country/cz`).
- **Style leaderboards** (`/styles/[style]`, e.g. `/styles/Pilsner`).
- **Crowdsourced submission** (`/submit` and `+ Add`) with a live CLPA preview. Rows are unverified until an admin approves them.
- **Admin queue** (`/admin`) to verify or reject pending prices.
- **FX sync cron** (`/api/cron/sync-fx`) pulling live USD rates from Frankfurter.
