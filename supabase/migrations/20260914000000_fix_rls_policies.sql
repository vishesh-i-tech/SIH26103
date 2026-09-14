-- ==============================================================================
-- PAIMANA AI — Fix Row Level Security (RLS) Policies for Telemetry & Demo Ingestion
-- ==============================================================================
-- This migration updates RLS policies so that Field Officers, Admins, and
-- 1-Click Demo Evaluation sessions (using the public anon key) can insert
-- ground telemetry logs (daily_entries) and persist newly onboarded projects.
-- ==============================================================================

-- 1. Daily Entries Policies (Field Site Telemetry Logs)
DROP POLICY IF EXISTS "Field officers and admins can insert daily_entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Allow insert daily_entries" ON public.daily_entries;

CREATE POLICY "Allow insert daily_entries"
  ON public.daily_entries FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update review status on daily_entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Allow update daily_entries" ON public.daily_entries;

CREATE POLICY "Allow update daily_entries"
  ON public.daily_entries FOR UPDATE
  TO authenticated, anon
  USING (true);

-- 2. Projects Policies (Allow demo/officer project onboarding)
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow insert projects" ON public.projects;

CREATE POLICY "Allow insert projects"
  ON public.projects FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow update projects" ON public.projects;

CREATE POLICY "Allow update projects"
  ON public.projects FOR UPDATE
  TO authenticated, anon
  USING (true);

-- 3. Risk Trend Policies
DROP POLICY IF EXISTS "Admins can insert risk_trend" ON public.risk_trend;
DROP POLICY IF EXISTS "Allow insert risk_trend" ON public.risk_trend;

CREATE POLICY "Allow insert risk_trend"
  ON public.risk_trend FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 4. Risk Factors Policies
DROP POLICY IF EXISTS "Admins can insert risk_factors" ON public.risk_factors;
DROP POLICY IF EXISTS "Allow insert risk_factors" ON public.risk_factors;

CREATE POLICY "Allow insert risk_factors"
  ON public.risk_factors FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 5. Billing Entries Policies
DROP POLICY IF EXISTS "Admins can insert billing_entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Allow insert billing_entries" ON public.billing_entries;

CREATE POLICY "Allow insert billing_entries"
  ON public.billing_entries FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update billing_entries" ON public.billing_entries;
DROP POLICY IF EXISTS "Allow update billing_entries" ON public.billing_entries;

CREATE POLICY "Allow update billing_entries"
  ON public.billing_entries FOR UPDATE
  TO authenticated, anon
  USING (true);
