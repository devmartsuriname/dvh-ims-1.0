-- =============================================
-- PHASE 1: SHARED CORE TABLES
-- =============================================

-- 1. Create person table
CREATE TABLE public.person (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  nationality text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.person ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person FORCE ROW LEVEL SECURITY;

-- 2. Create household table
CREATE TABLE public.household (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_person_id uuid NOT NULL REFERENCES public.person(id),
  household_size integer NOT NULL DEFAULT 1 CHECK (household_size >= 1),
  district_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.household ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household FORCE ROW LEVEL SECURITY;

-- 3. Create household_member table
CREATE TABLE public.household_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.household(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.person(id),
  relationship text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, person_id)
);

ALTER TABLE public.household_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_member FORCE ROW LEVEL SECURITY;

-- 4. Create contact_point table
CREATE TABLE public.contact_point (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('phone', 'email', 'other')),
  contact_value text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_point ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_point FORCE ROW LEVEL SECURITY;

-- 5. Create address table
CREATE TABLE public.address (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.household(id) ON DELETE CASCADE,
  address_line_1 text NOT NULL,
  address_line_2 text,
  district_code text NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address FORCE ROW LEVEL SECURITY;

-- =============================================
-- PHASE 1: ALLOWLIST RLS POLICIES
-- =============================================

-- Person RLS Policies
CREATE POLICY "Allowlist users can read person"
ON public.person FOR SELECT TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can insert person"
ON public.person FOR INSERT TO authenticated
WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can update person"
ON public.person FOR UPDATE TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

-- Household RLS Policies
CREATE POLICY "Allowlist users can read household"
ON public.household FOR SELECT TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can insert household"
ON public.household FOR INSERT TO authenticated
WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can update household"
ON public.household FOR UPDATE TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

-- Household Member RLS Policies
CREATE POLICY "Allowlist users can read household_member"
ON public.household_member FOR SELECT TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can insert household_member"
ON public.household_member FOR INSERT TO authenticated
WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can update household_member"
ON public.household_member FOR UPDATE TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

-- Contact Point RLS Policies
CREATE POLICY "Allowlist users can read contact_point"
ON public.contact_point FOR SELECT TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can insert contact_point"
ON public.contact_point FOR INSERT TO authenticated
WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can update contact_point"
ON public.contact_point FOR UPDATE TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

-- Address RLS Policies
CREATE POLICY "Allowlist users can read address"
ON public.address FOR SELECT TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can insert address"
ON public.address FOR INSERT TO authenticated
WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

CREATE POLICY "Allowlist users can update address"
ON public.address FOR UPDATE TO authenticated
USING (current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr');

-- =============================================
-- PHASE 1: AUDIT_EVENT POLICY FIX
-- =============================================

-- Drop existing overly-permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert audit events" ON public.audit_event;

-- Create allowlist INSERT policy
CREATE POLICY "Allowlist users can insert audit_event"
ON public.audit_event FOR INSERT TO authenticated
WITH CHECK (
  actor_user_id = auth.uid()
  AND current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr'
);

-- =============================================
-- PHASE 1: TRIGGERS
-- =============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to person table
CREATE TRIGGER update_person_updated_at
  BEFORE UPDATE ON public.person
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to household table
CREATE TRIGGER update_household_updated_at
  BEFORE UPDATE ON public.household
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();