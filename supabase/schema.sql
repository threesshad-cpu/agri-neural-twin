-- Agri-Neural Twin — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  aadhaar     TEXT        UNIQUE,
  role        TEXT        NOT NULL DEFAULT 'farmer',
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id        TEXT    UNIQUE NOT NULL,
  user_id          UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  name             TEXT,
  district         TEXT,
  taluk            TEXT,
  village          TEXT,
  survey_no        TEXT,
  pincode          TEXT,
  total_land       NUMERIC,
  current_crop     TEXT,
  current_acreage  NUMERIC,
  soil_type        TEXT,
  irrigation_type  TEXT,
  water_source     TEXT,
  coordinates      JSONB,
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  agri_stack_id    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Land Details
CREATE TABLE IF NOT EXISTS public.land_details (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       TEXT    NOT NULL REFERENCES public.farmer_profiles(farmer_id) ON DELETE CASCADE,
  survey_no       TEXT,
  area            NUMERIC,
  soil_type       TEXT,
  irrigation_type TEXT,
  water_source    TEXT,
  coordinates     JSONB,
  current_crop    TEXT,
  season          TEXT,
  year            INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI Reports
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       TEXT  NOT NULL REFERENCES public.farmer_profiles(farmer_id) ON DELETE CASCADE,
  type            TEXT  NOT NULL,
  file_name       TEXT,
  mime_type       TEXT,
  source          TEXT,
  insights        JSONB,
  recommendations JSONB,
  analysis        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Disease History
CREATE TABLE IF NOT EXISTS public.disease_history (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id   TEXT    NOT NULL REFERENCES public.farmer_profiles(farmer_id) ON DELETE CASCADE,
  disease     TEXT,
  severity    TEXT,
  confidence  NUMERIC,
  treatment   TEXT,
  image_ref   TEXT,
  crop        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrient History
CREATE TABLE IF NOT EXISTS public.nutrient_history (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id      TEXT    NOT NULL REFERENCES public.farmer_profiles(farmer_id) ON DELETE CASCADE,
  n_value        NUMERIC,
  p_value        NUMERIC,
  k_value        NUMERIC,
  score          NUMERIC,
  recommendation TEXT,
  crop           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan       TEXT  NOT NULL DEFAULT 'free',
  status     TEXT  NOT NULL DEFAULT 'active',
  features   JSONB,
  starts_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id  UUID    REFERENCES public.subscriptions(id),
  amount           NUMERIC NOT NULL,
  currency         TEXT    DEFAULT 'INR',
  status           TEXT    NOT NULL DEFAULT 'pending',
  payment_method   TEXT,
  transaction_id   TEXT    UNIQUE,
  gateway_response JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_farmer_id  ON public.farmer_profiles(farmer_id);
CREATE INDEX IF NOT EXISTS idx_land_details_farmer_id     ON public.land_details(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_farmer_id       ON public.ai_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_history_farmer_id  ON public.disease_history(farmer_id);
CREATE INDEX IF NOT EXISTS idx_nutrient_history_farmer_id ON public.nutrient_history(farmer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id      ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id           ON public.payments(user_id);

-- Row Level Security (permissive for anon key — tighten per Supabase Auth in production)
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_details       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrient_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_users"              ON public.users              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_farmer_profiles"    ON public.farmer_profiles    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_land_details"       ON public.land_details       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ai_reports"         ON public.ai_reports         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_disease_history"    ON public.disease_history    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_nutrient_history"   ON public.nutrient_history   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_subscriptions"      ON public.subscriptions      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_payments"           ON public.payments           FOR ALL USING (true) WITH CHECK (true);
