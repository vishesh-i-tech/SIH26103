-- ==============================================================================
-- PAIMANA AI — MoSPI Infrastructure Project Monitoring Platform
-- Database Schema (Postgres / Supabase)
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'field_officer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL CHECK (sector IN ('Roads', 'Bridges', 'Railways', 'Power')),
  location TEXT NOT NULL,
  contractor TEXT NOT NULL,
  cost_original NUMERIC NOT NULL DEFAULT 0,
  cost_revised NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  duration_months INTEGER DEFAULT 36,
  target_date DATE,
  planned_progress INTEGER DEFAULT 0 CHECK (planned_progress >= 0 AND planned_progress <= 100),
  actual_progress INTEGER DEFAULT 0 CHECK (actual_progress >= 0 AND actual_progress <= 100),
  risk_score INTEGER DEFAULT 25 CHECK (risk_score >= 0 AND risk_score <= 100),
  reason TEXT,
  recommendation TEXT,
  days_flagged INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON public.projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_risk_score ON public.projects(risk_score DESC);

-- ------------------------------------------------------------------------------
-- 3. RISK TREND TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_trend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  month_label TEXT NOT NULL,
  risk_value INTEGER NOT NULL CHECK (risk_value >= 0 AND risk_value <= 100),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_trend_project ON public.risk_trend(project_id, recorded_at ASC);

-- ------------------------------------------------------------------------------
-- 4. RISK FACTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  factor_text TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_risk_factors_project ON public.risk_factors(project_id);

-- ------------------------------------------------------------------------------
-- 5. DAILY ENTRIES TABLE (Field Officer Telemetry Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_status TEXT NOT NULL CHECK (work_status IN ('Running', 'Stalled', 'Off')),
  delay_reason TEXT,
  material_notes TEXT,
  photo_url TEXT,
  notes TEXT,
  reviewed_status TEXT NOT NULL DEFAULT 'Pending Review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_entries_project ON public.daily_entries(project_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_submitted_by ON public.daily_entries(submitted_by);

-- ------------------------------------------------------------------------------
-- 6. BILLING ENTRIES TABLE (Running Account Bill Verification)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bill_code TEXT NOT NULL,
  claimed_amount NUMERIC NOT NULL DEFAULT 0,
  expected_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('approved', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_entries_project ON public.billing_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_entries_status ON public.billing_entries(status);

-- ------------------------------------------------------------------------------
-- 7. HELPER FUNCTION & ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Helper to verify if the current authenticated caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger to automatically create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Officer'),
    coalesce(new.raw_user_meta_data->>'role', 'field_officer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_trend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_entries ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile or admins can read all" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Projects Policies
DROP POLICY IF EXISTS "Authenticated users can read projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and assigned officers can read projects" ON public.projects;
CREATE POLICY "Admins and assigned officers can read projects"
  ON public.projects FOR SELECT
  TO authenticated, anon
  USING (
    public.is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
    OR auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Risk Trend Policies
DROP POLICY IF EXISTS "Authenticated users can read risk_trend" ON public.risk_trend;
DROP POLICY IF EXISTS "Admins and assigned officers can read risk_trend" ON public.risk_trend;
CREATE POLICY "Admins and assigned officers can read risk_trend"
  ON public.risk_trend FOR SELECT
  TO authenticated, anon
  USING (
    public.is_admin()
    OR auth.role() = 'anon'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = risk_trend.project_id
        AND (p.created_by = auth.uid() OR p.created_by IS NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can insert risk_trend" ON public.risk_trend;
CREATE POLICY "Admins can insert risk_trend"
  ON public.risk_trend FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update risk_trend" ON public.risk_trend;
CREATE POLICY "Admins can update risk_trend"
  ON public.risk_trend FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete risk_trend" ON public.risk_trend;
CREATE POLICY "Admins can delete risk_trend"
  ON public.risk_trend FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Risk Factors Policies
DROP POLICY IF EXISTS "Authenticated users can read risk_factors" ON public.risk_factors;
DROP POLICY IF EXISTS "Admins and assigned officers can read risk_factors" ON public.risk_factors;
CREATE POLICY "Admins and assigned officers can read risk_factors"
  ON public.risk_factors FOR SELECT
  TO authenticated, anon
  USING (
    public.is_admin()
    OR auth.role() = 'anon'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = risk_factors.project_id
        AND (p.created_by = auth.uid() OR p.created_by IS NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can insert risk_factors" ON public.risk_factors;
CREATE POLICY "Admins can insert risk_factors"
  ON public.risk_factors FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update risk_factors" ON public.risk_factors;
CREATE POLICY "Admins can update risk_factors"
  ON public.risk_factors FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete risk_factors" ON public.risk_factors;
CREATE POLICY "Admins can delete risk_factors"
  ON public.risk_factors FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Daily Entries Policies
DROP POLICY IF EXISTS "Authenticated users can read daily_entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Admins and officers can read daily_entries" ON public.daily_entries;
CREATE POLICY "Admins and officers can read daily_entries"
  ON public.daily_entries FOR SELECT
  TO authenticated, anon
  USING (
    public.is_admin()
    OR auth.role() = 'anon'
    OR submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = daily_entries.project_id
        AND (p.created_by = auth.uid() OR p.created_by IS NULL)
    )
  );

DROP POLICY IF EXISTS "Field officers and admins can insert daily_entries" ON public.daily_entries;
CREATE POLICY "Field officers and admins can insert daily_entries"
  ON public.daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR auth.uid() = submitted_by
  );

DROP POLICY IF EXISTS "Admins can update review status on daily_entries" ON public.daily_entries;
CREATE POLICY "Admins can update review status on daily_entries"
  ON public.daily_entries FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = submitted_by);

-- Billing Entries Policies
DROP POLICY IF EXISTS "Authenticated users can read billing_entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Admins and assigned officers can read billing_entries" ON public.billing_entries;
CREATE POLICY "Admins and assigned officers can read billing_entries"
  ON public.billing_entries FOR SELECT
  TO authenticated, anon
  USING (
    public.is_admin()
    OR auth.role() = 'anon'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = billing_entries.project_id
        AND (p.created_by = auth.uid() OR p.created_by IS NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can insert billing_entries" ON public.billing_entries;
CREATE POLICY "Admins can insert billing_entries"
  ON public.billing_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update billing_entries" ON public.billing_entries;
CREATE POLICY "Admins can update billing_entries"
  ON public.billing_entries FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete billing_entries" ON public.billing_entries;
CREATE POLICY "Admins can delete billing_entries"
  ON public.billing_entries FOR DELETE
  TO authenticated
  USING (public.is_admin());
