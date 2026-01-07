-- =============================================
-- PHASE 3: HOUSING REGISTRATION TABLES
-- =============================================

-- Table 1: housing_registration
CREATE TABLE public.housing_registration (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number text NOT NULL UNIQUE,
  household_id uuid NOT NULL REFERENCES public.household(id) ON DELETE RESTRICT,
  applicant_person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE RESTRICT,
  district_code text NOT NULL,
  current_status text NOT NULL DEFAULT 'received',
  registration_date timestamptz NOT NULL DEFAULT now(),
  housing_type_preference text,
  urgency_score integer,
  waiting_list_position integer,
  assigned_officer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table 2: housing_registration_status_history (append-only)
CREATE TABLE public.housing_registration_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES public.housing_registration(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- Table 3: housing_urgency (append-only, immutable)
CREATE TABLE public.housing_urgency (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES public.housing_registration(id) ON DELETE CASCADE,
  urgency_category text NOT NULL,
  urgency_points integer NOT NULL,
  assessed_by uuid,
  assessment_date timestamptz NOT NULL DEFAULT now(),
  justification text,
  supporting_document_path text
);

-- Table 4: public_status_access (for Phase 5 preparation)
CREATE TABLE public.public_status_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reference_number text NOT NULL,
  access_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger for housing_registration
CREATE TRIGGER update_housing_registration_updated_at
  BEFORE UPDATE ON public.housing_registration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (ALLOWLIST MODEL)
-- =============================================

-- Enable RLS + FORCE RLS on all tables
ALTER TABLE public.housing_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_registration FORCE ROW LEVEL SECURITY;

ALTER TABLE public.housing_registration_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_registration_status_history FORCE ROW LEVEL SECURITY;

ALTER TABLE public.housing_urgency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_urgency FORCE ROW LEVEL SECURITY;

ALTER TABLE public.public_status_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_status_access FORCE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: housing_registration
-- =============================================

-- SELECT: Allowlist only
CREATE POLICY "housing_registration_select_allowlist"
  ON public.housing_registration
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- INSERT: Allowlist only
CREATE POLICY "housing_registration_insert_allowlist"
  ON public.housing_registration
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- UPDATE: Allowlist only
CREATE POLICY "housing_registration_update_allowlist"
  ON public.housing_registration
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  )
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- DELETE: DENIED (no policy = denied)

-- =============================================
-- RLS POLICIES: housing_registration_status_history (append-only)
-- =============================================

-- SELECT: Allowlist only
CREATE POLICY "housing_registration_status_history_select_allowlist"
  ON public.housing_registration_status_history
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- INSERT: Allowlist only
CREATE POLICY "housing_registration_status_history_insert_allowlist"
  ON public.housing_registration_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- UPDATE: DENIED (no policy = append-only)
-- DELETE: DENIED (no policy = append-only)

-- =============================================
-- RLS POLICIES: housing_urgency (append-only, immutable)
-- =============================================

-- SELECT: Allowlist only
CREATE POLICY "housing_urgency_select_allowlist"
  ON public.housing_urgency
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- INSERT: Allowlist only
CREATE POLICY "housing_urgency_insert_allowlist"
  ON public.housing_urgency
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- UPDATE: DENIED (no policy = immutable)
-- DELETE: DENIED (no policy = immutable)

-- =============================================
-- RLS POLICIES: public_status_access
-- =============================================

-- SELECT: Allowlist only (public access via token will be added in Phase 5)
CREATE POLICY "public_status_access_select_allowlist"
  ON public.public_status_access
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- INSERT: Allowlist only
CREATE POLICY "public_status_access_insert_allowlist"
  ON public.public_status_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- UPDATE: Allowlist only
CREATE POLICY "public_status_access_update_allowlist"
  ON public.public_status_access
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  )
  WITH CHECK (
    (SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'
  );

-- DELETE: DENIED (no policy = denied)