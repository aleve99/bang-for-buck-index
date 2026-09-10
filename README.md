# bang-for-buck-index

Data-driven web application that ranks alcoholic beverages across countries using a single metric: Cost per Liter of Pure Alcohol (CLPA), colloquially known as the "Bang-for-Buck" index.

This repo implements **PureHop** — MVP Phase 1 (beer). See [`PRD.md`](./PRD.md) for the full product spec.

## Stack

- **Next.js 15** (App Router, Server Components) + **TypeScript** (strict)
- **PostgreSQL 16** (local user-owned cluster) + **Drizzle ORM**
- **Tailwind CSS v4** + shadcn-style UI primitives
- **Zod** validated Server Actions, **Vitest** unit tests, **Playwright** E2E

> The PRD targets Supabase for local dev. To keep the Cloud Agent environment
> reproducible and snapshot-friendly (no Docker-in-Docker), local development
> runs against a native Postgres cluster. The SQL schema and seed still live
> under `supabase/migrations/` and `supabase/seed.sql`, and `pnpm db:reset`
> mirrors `supabase db reset`.

## Prerequisites

- Node.js `>= 20` and `pnpm`
- PostgreSQL 16 client/server binaries (`/usr/lib/postgresql/16/bin`)
  - Install on Debian/Ubuntu: `sudo apt-get install -y postgresql postgresql-contrib`

## Quick start

```bash
pnpm install
cp .env.example .env.local        # DATABASE_URL etc.

pnpm db:start                     # init + start local Postgres (idempotent)
pnpm db:reset                     # apply migrations + seed

pnpm dev                          # http://localhost:3000
```

## Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:start` | Init (if needed) and start the local Postgres cluster |
| `pnpm db:reset` | Drop schema, apply `supabase/migrations/*`, run `supabase/seed.sql` |
| `pnpm test` | Vitest unit tests (CLPA math) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`next lint`) |
| `pnpm e2e` | Playwright E2E (`pnpm e2e:install` first) |

## Features

- **Global leaderboard** (`/`) ranked by CLPA with currency-unit toggle (USD / Local / PPP) and venue/style filters.
- **Country leaderboards** (`/country/[code]`, e.g. `/country/cz`).
- **Style leaderboards** (`/styles/[style]`, e.g. `/styles/Pilsner`).
- **Crowdsourced submission** (`/submit`) with a live CLPA preview and Zod-validated Server Action.
- **FX sync cron** (`/api/cron/sync-fx`) pulling live USD rates from Frankfurter.
