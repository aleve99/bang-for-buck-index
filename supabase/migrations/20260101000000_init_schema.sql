-- PureHop initial schema (MVP Phase 1: Beer)
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
