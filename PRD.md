# Product Requirement Document (PRD): PureHop (Alcohol Bang-for-Buck Index)

**Project Name:** PureHop (Global Alcohol Efficiency Index)

**Target Milestone:** MVP Phase 1 (Beer Only)

**Primary Architecture:** Next.js (App Router, Vercel) + Supabase (Local CLI $\to$ Managed Cloud) + Drizzle ORM + Tailwind/shadcn

**Development Methodology:** Multi-Agent AI System (Orchestrator, DB Agent, Backend Agent, Frontend Agent, QA Agent)

---

## 1. Executive Summary & Vision

PureHop is a data-driven web application that ranks alcoholic beverages across countries using a single metric: **Cost per Liter of Pure Alcohol (CLPA)**, colloquially known as the "Bang-for-Buck" index.

While existing platforms (e.g., Numbeo, Untappd) isolate price from ABV or fail to normalize across packaging sizes and currencies, PureHop delivers a clean leaderboard allowing tourists and locals alike to answer:

1. *Where can a budget traveler acquire pure ethanol at the lowest nominal cost?*
2. *How do domestic beers compare in real purchasing efficiency across supermarket vs. bar venues?*

This PRD is structured for **agentic workflows** (e.g., Claude Code, Cursor Composer, Devin, Roo Code). Tasks, interfaces, contracts, and database migrations are partitioned into deterministic, isolated units.

---

## 2. Core Economic & Mathematical Specification

### 2.1 Pure Alcohol Volume Equation

$$\text{Pure Ethanol (L)} = \text{Pack Size} \times \left(\frac{\text{Volume in mL}}{1000}\right) \times \left(\frac{\text{ABV \%}}{100}\right)$$

### 2.2 Cost per Liter of Pure Alcohol (CLPA)

$$\text{CLPA}_{\text{local}} = \frac{\text{Price}_{\text{local}}}{\text{Pure Ethanol (L)}}$$

### 2.3 Normalized Global Pricing

* **Nominal USD (`CLPA_USD`):**

$$\text{CLPA}_{\text{USD}} = \text{CLPA}_{\text{local}} \times \text{FX Rate (Local to USD)}$$


* **PPP Normalized (Purchasing Power Parity Index):**

$$\text{CLPA}_{\text{PPP}} = \frac{\text{CLPA}_{\text{USD}}}{\text{PPP Conversion Factor}}$$



---

## 3. Multi-Agent Development Roles & Boundaries

To allow parallel development without context clashes, tasks are partitioned across five specialized agent personas:

```
                  ┌────────────────────────┐
                  │   Orchestrator Agent   │
                  │ (Contracts, PR Review) │
                  └───────────┬────────────┘
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    DB Agent     │  │  Backend Agent  │  │ Frontend Agent  │
│ Supabase/SQL/RLS│  │  APIs/FX/Cron   │  │ Next.js/UI/UX   │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                  ┌────────────────────────┐
                  │   QA & Test Agent      │
                  │ E2E / Unit / Linting   │
                  └────────────────────────┘

```

| Agent Persona | File Ownership & Scope | Non-Negotiable Constraints |
| --- | --- | --- |
| **Architect / Orchestrator** | Root configs, `package.json`, `src/types/*`, architectural decisions. | Enforces TypeScript strictness; resolves contract mismatches. |
| **Database Agent (DB-A)** | `/supabase/migrations/*`, `/supabase/seed.sql`, `/src/db/*`. | No direct UI code; all schema changes must be versioned migrations. |
| **Backend Agent (BE-A)** | `/src/app/api/*`, `/src/actions/*`, `/src/services/*`. | Must use typed Drizzle queries or Supabase client; validate all payloads with Zod. |
| **Frontend Agent (FE-A)** | `/src/app/(routes)/*`, `/src/components/*`, `/src/hooks/*`. | Must use Server Components by default; shadcn/ui components only. |
| **QA / Testing Agent (QA-A)** | `/tests/*`, `playwright.config.ts`, `vitest.config.ts`. | Tests must run headlessly against local Supabase instance. |

---

## 4. Local Development & Migration Architecture

We avoid cloud lock-in during development by operating a 100% offline-capable Supabase environment via Docker.

### 4.1 Local Toolchain

* **Node.js:** `v20.x LTS`
* **Package Manager:** `pnpm`
* **Local Postgres/Auth/Storage:** Supabase CLI (`v1.160+`)
* **ORM:** Drizzle ORM (`drizzle-kit` for schema introspection)

### 4.2 Local Setup Workflow

```bash
# 1. Initialize local Supabase instance
supabase init

# 2. Start local Docker stack (Postgres on port 54322, Studio on port 54323)
supabase start

# 3. Create a migration
supabase migration new init_schema

# 4. Apply migrations & seed data
supabase db reset

# 5. Export generated TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

```

---

## 5. Database Schema & Migration Spec (DB-A)

All migrations live under `supabase/migrations/<timestamp>_init_schema.sql`.

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COUNTRIES & REGIONS
CREATE TABLE public.countries (
    code VARCHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2 (e.g., 'DE', 'US')
    name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    ppp_factor NUMERIC(8, 4) DEFAULT 1.0000, -- Relative to US baseline (1.0)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. EXCHANGE RATES (Base currency: USD)
CREATE TABLE public.exchange_rates (
    currency_code VARCHAR(3) PRIMARY KEY,
    rate_to_usd NUMERIC(14, 6) NOT NULL, -- 1 Local Unit = X USD
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. BEERS (Canonical Entities)
CREATE TABLE public.beers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    brewery VARCHAR(150),
    country_code VARCHAR(2) REFERENCES public.countries(code) ON DELETE RESTRICT,
    abv NUMERIC(4, 2) NOT NULL CHECK (abv > 0.0 AND abv <= 100.0),
    style VARCHAR(50) NOT NULL, -- 'Lager', 'Pilsner', 'IPA', 'Stout', etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PRICE ENTRIES (Crowdsourced / Scraped)
CREATE TYPE venue_category AS ENUM ('supermarket', 'convenience_store', 'bar_pub', 'restaurant');

CREATE TABLE public.price_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beer_id UUID NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL REFERENCES public.countries(code),
    city VARCHAR(100),
    venue_type venue_category NOT NULL,
    pack_size INT NOT NULL DEFAULT 1 CHECK (pack_size > 0),
    volume_ml INT NOT NULL CHECK (volume_ml > 0), -- e.g., 330, 500
    price_local NUMERIC(10, 2) NOT NULL CHECK (price_local > 0),
    currency_code VARCHAR(3) NOT NULL REFERENCES public.exchange_rates(currency_code),
    
    -- Calculated Ethanol Fields
    pure_alcohol_liters NUMERIC(8, 5) NOT NULL,
    clpa_local NUMERIC(10, 2) NOT NULL,
    
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    receipt_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES for fast querying & leaderboard aggregation
CREATE INDEX idx_price_entries_beer_id ON public.price_entries(beer_id);
CREATE INDEX idx_price_entries_country ON public.price_entries(country_code);
CREATE INDEX idx_price_entries_clpa ON public.price_entries(clpa_local);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_entries ENABLE ROW LEVEL SECURITY;

-- Public read access on all catalogue data
CREATE POLICY "Public read access for countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read access for exchange_rates" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Public read access for beers" ON public.beers FOR SELECT USING (true);
CREATE POLICY "Public read access for verified prices" ON public.price_entries FOR SELECT USING (verified = true);

-- Authenticated/Anonymous price submissions (Insert-only)
CREATE POLICY "Anyone can submit price entries" ON public.price_entries FOR INSERT WITH CHECK (verified = false);

```

---

## 6. Service & API Specifications (BE-A)

### 6.1 Exchange Rate Synchronizer (`src/services/fx.ts`)

* **Source:** Open Exchange Rates or Frankfurter API (`[https://api.frankfurter.dev/v1/latest?base=USD](https://api.frankfurter.dev/v1/latest?base=USD)`).
* **Trigger:** Vercel Cron (`/api/cron/sync-fx`) running once every 24 hours at `00:00 UTC`.
* **Execution:**
1. Fetch base USD rates.
2. Perform upsert into `exchange_rates`.
3. Log delta updates.



### 6.2 Price Ingestion Server Action (`src/actions/submit-price.ts`)

```typescript
import { z } from "zod";

export const PriceSubmissionSchema = z.object({
  beerName: z.string().min(2).max(150),
  brewery: z.string().max(150).optional(),
  countryCode: z.string().length(2),
  abv: z.number().min(0.5).max(80.0),
  style: z.string().min(2).max(50),
  venueType: z.enum(["supermarket", "convenience_store", "bar_pub", "restaurant"]),
  packSize: z.coerce.number().int().min(1).default(1),
  volumeMl: z.coerce.number().int().min(50).max(5000),
  priceLocal: z.coerce.number().positive(),
  currencyCode: z.string().length(3),
  receiptImageUrl: z.string().url().optional()
});

export type PriceSubmissionInput = z.infer<typeof PriceSubmissionSchema>;

```

**Calculation Contract:**

```typescript
export function computeCLPA(input: {
  packSize: number;
  volumeMl: number;
  abv: number;
  priceLocal: number;
}) {
  const totalVolumeLiters = (input.packSize * input.volumeMl) / 1000;
  const pureAlcoholLiters = totalVolumeLiters * (input.abv / 100);
  const clpaLocal = input.priceLocal / pureAlcoholLiters;

  return {
    pureAlcoholLiters: Number(pureAlcoholLiters.toFixed(5)),
    clpaLocal: Number(clpaLocal.toFixed(2))
  };
}

```

---

## 7. Frontend Interface & Routing Spec (FE-A)

### 7.1 Page Structure

```
src/app/
├── (leaderboard)/
│   ├── page.tsx                    # Global Top 50 Leaderboard
│   ├── country/[code]/page.tsx     # Country-Specific Leaderboard (e.g. /country/de)
│   └── styles/[style]/page.tsx     # Style Leaderboard (e.g. /styles/ipa)
├── submit/
│   └── page.tsx                    # Crowdsourced submission form
├── api/
│   └── cron/
│       └── sync-fx/route.ts        # FX daily sync
└── layout.tsx

```

### 7.2 Core Component Hierarchy

1. **`Navbar`**: Global search (command menu), currency unit toggle (`USD`, `EUR`, `Local Currency`), PPP Mode switch.
2. **`LeaderboardTable`** (`src/components/leaderboard/table.tsx`):
* Columns: Rank, Beer Name & Brewery, Country, ABV %, Package (e.g., `6 × 330ml`), Venue Tag, Retail Price, **CLPA Normalized ($/L pure alc)**.
* Client-side filters: Venue (Supermarket vs. Bar), ABV slider, Style picker.


3. **`SubmitPriceModal`** (`src/components/forms/price-submission-dialog.tsx`):
* Multi-step submission with instant preview of calculated CLPA before submitting.



---

## 8. Directory & File Tree Layout

```
├── .env.example
├── .env.local
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260101000000_init_schema.sql
│   └── seed.sql
├── src/
│   ├── actions/
│   │   └── submit-price.ts
│   ├── app/
│   ├── components/
│   │   ├── forms/
│   │   ├── leaderboard/
│   │   └── ui/                    # shadcn components
│   ├── db/
│   │   ├── client.ts              # Supabase / Drizzle initialization
│   │   └── schema.ts              # Drizzle schema mirror
│   ├── hooks/
│   │   └── use-currency-toggle.ts
│   ├── lib/
│   │   ├── calculations.ts        # Math formula functions
│   │   └── utils.ts
│   ├── services/
│   │   └── fx.ts
│   └── types/
│       ├── database.ts            # Generated Supabase types
│       └── index.ts
└── tests/
    ├── calculations.test.ts
    └── e2e/
        └── leaderboard.spec.ts

```

---

## 9. Seed Data for Local Verification (`supabase/seed.sql`)

```sql
-- SEED COUNTRIES
INSERT INTO public.countries (code, name, currency_code, ppp_factor) VALUES
('DE', 'Germany', 'EUR', 0.85),
('US', 'United States', 'USD', 1.00),
('CZ', 'Czech Republic', 'CZK', 0.55),
('GB', 'United Kingdom', 'GBP', 0.90),
('JP', 'Japan', 'JPY', 0.70)
ON CONFLICT DO NOTHING;

-- SEED FX RATES
INSERT INTO public.exchange_rates (currency_code, rate_to_usd) VALUES
('USD', 1.000000),
('EUR', 1.085000),
('CZK', 0.043000),
('GBP', 1.270000),
('JPY', 0.006500)
ON CONFLICT DO NOTHING;

-- SEED BEERS
INSERT INTO public.beers (id, name, brewery, country_code, abv, style) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pilsner Urquell', 'Plzeňský Prazdroj', 'CZ', 4.40, 'Pilsner'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Oettinger Pils', 'Oettinger Brauerei', 'DE', 4.70, 'Pilsner'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Bud Light', 'Anheuser-Busch', 'US', 4.20, 'Light Lager')
ON CONFLICT DO NOTHING;

-- SEED PRICES
-- 1. Oettinger Pils: 0.5L bottle in German supermarket for €0.49
-- Ethanol = 1 * 0.500 * 0.047 = 0.0235 L. CLPA = 0.49 / 0.0235 = €20.85 / L
INSERT INTO public.price_entries 
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'DE', 'Berlin', 'supermarket', 1, 500, 0.49, 'EUR', 0.02350, 20.85, true);

-- 2. Pilsner Urquell: 0.5L Draught in Prague Pub for 60 CZK
-- Ethanol = 1 * 0.500 * 0.044 = 0.0220 L. CLPA = 60 / 0.0220 = 2727.27 CZK / L
INSERT INTO public.price_entries 
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CZ', 'Prague', 'bar_pub', 1, 500, 60.00, 'CZK', 0.02200, 2727.27, true);

```

---

## 10. Implementation Sequence for Agents

```
Step 1: Orchestrator -> Scaffold repository with Next.js App Router, Tailwind, Drizzle, and Supabase CLI configs.
Step 2: DB-A         -> Write and execute migrations via `supabase start` and apply `seed.sql`.
Step 3: DB-A         -> Run `supabase gen types typescript --local` to emit schema contracts.
Step 4: BE-A         -> Implement `calculations.ts`, unit tests, and the `sync-fx` cron job.
Step 5: FE-A         -> Build the shadcn-based leaderboard UI with dynamic currency/PPP conversions.
Step 6: BE-A + FE-A  -> Connect the Price Submission form with Server Actions and optimistic validation.
Step 7: QA-A         -> Run calculation unit tests and Playwright integration tests against local Supabase.

```

---

## 11. Verification Commands & Acceptance Criteria

Each agent must verify its work locally using the following deterministic commands before handing off tasks:

1. **Database & Schema Validation:**
```bash
supabase db lint
supabase db reset # Must apply all migrations and seeds with 0 errors

```


2. **Formula Unit Tests:**
```bash
pnpm vitest run tests/calculations.test.ts
# Must pass: €0.49 0.5L 4.7% ABV -> exactly 20.85 EUR/L ethanol (±0.01 tolerance)

```


3. **Type & Code Quality Checks:**
```bash
pnpm tsc --noEmit
pnpm lint

```


4. **End-to-End Test Suite:**
```bash
pnpm playwright test
# Must verify: Landing page loads table, sorts by CLPA ascending, and switches currency units.

```
