-- ============================================================
-- COLLINS TINY HOMES — DISCOVERY & FINANCE ENGINE MIGRATION
-- ============================================================

-- 1. ALTER existing listings table to support location availability check
ALTER TABLE listings ADD COLUMN IF NOT EXISTS location_availability BOOLEAN DEFAULT true;

-- 2. CREATE agents table for regional CRM assignments
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  region TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE projects table (represents client tiny home projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Qualified', 'Deposit', 'Build', 'AwaitingProcessing')),
  goal TEXT CHECK (goal IN ('living', 'investment', 'land-placement')),
  land_ownership TEXT,
  timeline TEXT,
  payment_method TEXT,
  lease_duration_months INTEGER DEFAULT 12,
  shipping_address TEXT DEFAULT '',
  shipping_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE leads table (maps unserviced regions to nearest regional agent)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  unserviced_location TEXT NOT NULL,
  unserviced_lat NUMERIC,
  unserviced_lng NUMERIC,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CREATE finance_plans table
CREATE TABLE IF NOT EXISTS finance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  term_months INTEGER NOT NULL,
  base_price NUMERIC NOT NULL,
  equity_amount NUMERIC NOT NULL,
  rent_amount NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CREATE messages table (real-time chat tied to project ID)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL, -- 'client' or 'agent'
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 7. CREATE cases table for operations team tracking
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Public read agents" ON agents;
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "Public insert projects" ON projects;
DROP POLICY IF EXISTS "Public update projects" ON projects;
DROP POLICY IF EXISTS "Public insert leads" ON leads;
DROP POLICY IF EXISTS "Public read leads" ON leads;
DROP POLICY IF EXISTS "Public read finance_plans" ON finance_plans;
DROP POLICY IF EXISTS "Public insert finance_plans" ON finance_plans;
DROP POLICY IF EXISTS "Public read messages" ON messages;
DROP POLICY IF EXISTS "Public insert messages" ON messages;
DROP POLICY IF EXISTS "Public read cases" ON cases;
DROP POLICY IF EXISTS "Public insert cases" ON cases;

-- Create policies for public access (compatible with Next.js Server Components)
CREATE POLICY "Public read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Public read finance_plans" ON finance_plans FOR SELECT USING (true);
CREATE POLICY "Public insert finance_plans" ON finance_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Public insert cases" ON cases FOR INSERT WITH CHECK (true);

-- Seed regional agents for local coordinates (US-based regional centers)
INSERT INTO agents (name, email, phone, region, lat, lng) VALUES
  ('Sarah Jenkins', 'sarah.j@collinstinyhomes.com', '(206) 555-0122', 'Pacific Northwest', 47.6062, -122.3321),
  ('Marcus Vance', 'marcus.v@collinstinyhomes.com', '(303) 555-0144', 'Rocky Mountains', 39.7392, -104.9903),
  ('Elena Rostova', 'elena.r@collinstinyhomes.com', '(512) 555-0188', 'Southwest', 30.2672, -97.7431),
  ('David Kim', 'david.k@collinstinyhomes.com', '(404) 555-0199', 'Southeast', 33.7490, -84.3880),
  ('Chloe Dubois', 'chloe.d@collinstinyhomes.com', '(617) 555-0166', 'Northeast', 42.3601, -71.0589)
ON CONFLICT DO NOTHING;
