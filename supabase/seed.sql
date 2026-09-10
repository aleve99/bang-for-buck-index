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
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Bud Light', 'Anheuser-Busch', 'US', 4.20, 'Light Lager'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Asahi Super Dry', 'Asahi Breweries', 'JP', 5.00, 'Lager'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Tennents Lager', 'Wellpark Brewery', 'GB', 4.00, 'Lager'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Guinness Draught', 'St. James''s Gate', 'GB', 4.20, 'Stout')
ON CONFLICT DO NOTHING;

-- SEED PRICES
-- 1. Oettinger Pils: 0.5L bottle in German supermarket for €0.49
-- Ethanol = 1 * 0.500 * 0.047 = 0.0235 L. CLPA = 0.49 / 0.0235 = €20.85 / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'DE', 'Berlin', 'supermarket', 1, 500, 0.49, 'EUR', 0.02350, 20.85, true)
ON CONFLICT DO NOTHING;

-- 2. Pilsner Urquell: 0.5L Draught in Prague Pub for 60 CZK
-- Ethanol = 1 * 0.500 * 0.044 = 0.0220 L. CLPA = 60 / 0.0220 = 2727.27 CZK / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CZ', 'Prague', 'bar_pub', 1, 500, 60.00, 'CZK', 0.02200, 2727.27, true)
ON CONFLICT DO NOTHING;

-- 3. Pilsner Urquell: 6 x 500ml supermarket multipack in Prague for 150 CZK
-- Ethanol = 6 * 0.500 * 0.044 = 0.1320 L. CLPA = 150 / 0.1320 = 1136.36 CZK / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CZ', 'Prague', 'supermarket', 6, 500, 150.00, 'CZK', 0.13200, 1136.36, true)
ON CONFLICT DO NOTHING;

-- 4. Bud Light: 12 x 355ml supermarket case in the US for $12.99
-- Ethanol = 12 * 0.355 * 0.042 = 0.17892 L. CLPA = 12.99 / 0.17892 = $72.60 / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'US', 'Chicago', 'supermarket', 12, 355, 12.99, 'USD', 0.17892, 72.60, true)
ON CONFLICT DO NOTHING;

-- 5. Asahi Super Dry: 500ml convenience store can in Tokyo for 220 JPY
-- Ethanol = 1 * 0.500 * 0.050 = 0.0250 L. CLPA = 220 / 0.0250 = 8800 JPY / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'JP', 'Tokyo', 'convenience_store', 1, 500, 220.00, 'JPY', 0.02500, 8800.00, true)
ON CONFLICT DO NOTHING;

-- 6. Tennents Lager: 4 x 440ml supermarket pack in Glasgow for £4.50
-- Ethanol = 4 * 0.440 * 0.040 = 0.0704 L. CLPA = 4.50 / 0.0704 = £63.92 / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'GB', 'Glasgow', 'supermarket', 4, 440, 4.50, 'GBP', 0.07040, 63.92, true)
ON CONFLICT DO NOTHING;

-- 7. Guinness Draught: 500ml pub pint in London for £5.80
-- Ethanol = 1 * 0.500 * 0.042 = 0.0210 L. CLPA = 5.80 / 0.0210 = £276.19 / L
INSERT INTO public.price_entries
(beer_id, country_code, city, venue_type, pack_size, volume_ml, price_local, currency_code, pure_alcohol_liters, clpa_local, verified)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'GB', 'London', 'bar_pub', 1, 500, 5.80, 'GBP', 0.02100, 276.19, true)
ON CONFLICT DO NOTHING;
