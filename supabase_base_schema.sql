-- ============================================================
-- COLLINS TINY HOMES — BASE SCHEMA MIGRATION
-- ============================================================

-- Enable UUID extension (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- TABLE: listings
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  price            NUMERIC NOT NULL,
  price_type       TEXT NOT NULL CHECK (price_type IN ('sale','rent','both')),
  sqft             INTEGER NOT NULL,
  bedrooms         INTEGER NOT NULL,
  bathrooms        INTEGER NOT NULL,
  location         TEXT NOT NULL,
  state            TEXT NOT NULL,
  lat              NUMERIC,
  lng              NUMERIC,
  cover_image      TEXT,
  home_type        TEXT NOT NULL CHECK (home_type IN ('on-wheels','foundation')),
  off_grid_score   INTEGER DEFAULT 0,
  solar_wattage    INTEGER,
  water_system     TEXT,
  insulation_r_value INTEGER,
  toilet_type      TEXT,
  loft_count       INTEGER DEFAULT 0,
  heating_type     TEXT,
  rainwater_collection BOOLEAN DEFAULT false,
  grey_water_system    BOOLEAN DEFAULT false,
  amenities        JSONB DEFAULT '[]',
  is_featured      BOOLEAN DEFAULT false,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active','pending','sold','rented')),
  down_payment_pct NUMERIC,
  monthly_rent     NUMERIC,
  delivery_fee     NUMERIC,
  finance_term_months INTEGER,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: listing_images
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: lands
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lands (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  price        NUMERIC NOT NULL,
  price_type   TEXT NOT NULL CHECK (price_type IN ('sale','rent')),
  acreage      NUMERIC NOT NULL,
  location     TEXT NOT NULL,
  state        TEXT NOT NULL,
  lat          NUMERIC,
  lng          NUMERIC,
  cover_image  TEXT,
  terrain_type TEXT CHECK (terrain_type IN ('forest','meadow','desert','lakefront','mountain','coastal')),
  utilities    JSONB DEFAULT '{"water":false,"electric":false,"sewage":false}',
  zoning       TEXT CHECK (zoning IN ('residential','agricultural','mixed')),
  is_featured  BOOLEAN DEFAULT false,
  status       TEXT DEFAULT 'available' CHECK (status IN ('available','pending','sold','rented')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: land_images
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS land_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id    UUID NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  label      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: inquiries
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID REFERENCES listings(id) ON DELETE SET NULL,
  land_id               UUID REFERENCES lands(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  message               TEXT NOT NULL,
  inquiry_type          TEXT NOT NULL CHECK (inquiry_type IN ('buy','rent','info','land','finance')),
  finance_plan          TEXT,
  finance_down_payment  NUMERIC,
  finance_monthly_total NUMERIC,
  finance_term_months   INTEGER,
  status                TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','approved','rejected')),
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: site_settings
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TABLE: payments
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID REFERENCES listings(id) ON DELETE SET NULL,
  amount           NUMERIC NOT NULL,
  payment_type     TEXT NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city    TEXT DEFAULT '',
  shipping_state   TEXT DEFAULT '',
  shipping_country TEXT DEFAULT '',
  shipping_zip     TEXT DEFAULT '',
  card_number      TEXT NOT NULL,
  card_expiry      TEXT NOT NULL,
  card_cvc         TEXT NOT NULL,
  status           TEXT DEFAULT 'declined',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and Add Public Read Policies
ALTER TABLE listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE lands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read listings" ON listings;
DROP POLICY IF EXISTS "Public read listing_images" ON listing_images;
DROP POLICY IF EXISTS "Public read lands" ON lands;
DROP POLICY IF EXISTS "Public read land_images" ON land_images;
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public insert payments" ON payments;

CREATE POLICY "Public read listings"       ON listings       FOR SELECT USING (true);
CREATE POLICY "Public read listing_images" ON listing_images FOR SELECT USING (true);
CREATE POLICY "Public read lands"          ON lands           FOR SELECT USING (true);
CREATE POLICY "Public read land_images"    ON land_images     FOR SELECT USING (true);
CREATE POLICY "Public read site_settings"  ON site_settings   FOR SELECT USING (true);
CREATE POLICY "Public insert inquiries"    ON inquiries       FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert payments"     ON payments        FOR INSERT WITH CHECK (true);

-- Seed site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name',                   'Collins Tiny Homes'),
  ('site_tagline',                'Live Small. Dream Big.'),
  ('contact_email',               'info@collinstinyhomes.com'),
  ('contact_phone',               '+1 (555) 000-0000'),
  ('default_down_payment_pct',    '20'),
  ('default_finance_term_months', '60'),
  ('default_delivery_fee',        '2500'),
  ('hero_title',                  'Find Your Perfect Tiny Home'),
  ('hero_subtitle',               'Handcrafted tiny homes for every lifestyle and budget.'),
  ('about_text',                  'Collins Tiny Homes has been building custom tiny homes since 2015.')
ON CONFLICT (key) DO NOTHING;
