-- ============================================
-- PHASE 2: BOUWSUBSIDIE MODULE TABLES
-- RLS: Allowlist model (info@devmart.sr only)
-- ============================================

-- 1. SUBSIDY_CASE TABLE
CREATE TABLE public.subsidy_case (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  household_id UUID NOT NULL REFERENCES public.household(id),
  applicant_person_id UUID NOT NULL REFERENCES public.person(id),
  status TEXT NOT NULL DEFAULT 'received',
  district_code TEXT NOT NULL,
  requested_amount NUMERIC(12,2),
  approved_amount NUMERIC(12,2),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.subsidy_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_case FORCE ROW LEVEL SECURITY;

CREATE TRIGGER update_subsidy_case_updated_at
  BEFORE UPDATE ON public.subsidy_case
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Allowlist users can read subsidy_case"
  ON public.subsidy_case FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert subsidy_case"
  ON public.subsidy_case FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can update subsidy_case"
  ON public.subsidy_case FOR UPDATE
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 2. SUBSIDY_CASE_STATUS_HISTORY TABLE
CREATE TABLE public.subsidy_case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subsidy_case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_case_status_history FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allowlist users can read subsidy_case_status_history"
  ON public.subsidy_case_status_history FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert subsidy_case_status_history"
  ON public.subsidy_case_status_history FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 3. SUBSIDY_DOCUMENT_REQUIREMENT TABLE
CREATE TABLE public.subsidy_document_requirement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_code TEXT NOT NULL UNIQUE,
  document_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subsidy_document_requirement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_document_requirement FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allowlist users can read subsidy_document_requirement"
  ON public.subsidy_document_requirement FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert subsidy_document_requirement"
  ON public.subsidy_document_requirement FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can update subsidy_document_requirement"
  ON public.subsidy_document_requirement FOR UPDATE
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 4. SUBSIDY_DOCUMENT_UPLOAD TABLE
CREATE TABLE public.subsidy_document_upload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.subsidy_document_requirement(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ
);

ALTER TABLE public.subsidy_document_upload ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_document_upload FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allowlist users can read subsidy_document_upload"
  ON public.subsidy_document_upload FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert subsidy_document_upload"
  ON public.subsidy_document_upload FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can update subsidy_document_upload"
  ON public.subsidy_document_upload FOR UPDATE
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 5. SOCIAL_REPORT TABLE
CREATE TABLE public.social_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL DEFAULT '{}',
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.social_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_report FORCE ROW LEVEL SECURITY;

CREATE TRIGGER update_social_report_updated_at
  BEFORE UPDATE ON public.social_report
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Allowlist users can read social_report"
  ON public.social_report FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert social_report"
  ON public.social_report FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can update social_report"
  ON public.social_report FOR UPDATE
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 6. TECHNICAL_REPORT TABLE
CREATE TABLE public.technical_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL DEFAULT '{}',
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.technical_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_report FORCE ROW LEVEL SECURITY;

CREATE TRIGGER update_technical_report_updated_at
  BEFORE UPDATE ON public.technical_report
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Allowlist users can read technical_report"
  ON public.technical_report FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert technical_report"
  ON public.technical_report FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can update technical_report"
  ON public.technical_report FOR UPDATE
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- 7. GENERATED_DOCUMENT TABLE
CREATE TABLE public.generated_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.generated_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_document FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allowlist users can read generated_document"
  ON public.generated_document FOR SELECT
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

CREATE POLICY "Allowlist users can insert generated_document"
  ON public.generated_document FOR INSERT
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text);

-- Insert default document requirements
INSERT INTO public.subsidy_document_requirement (document_code, document_name, description, is_mandatory) VALUES
  ('ID_COPY', 'Copy of ID', 'Valid government-issued ID card or passport', true),
  ('INCOME_PROOF', 'Income Proof', 'Recent salary slips or income statement', true),
  ('LAND_TITLE', 'Land Title / Deed', 'Proof of land ownership or lease agreement', true),
  ('BUILDING_PERMIT', 'Building Permit', 'Approved building permit from authorities', true),
  ('CONSTRUCTION_PLAN', 'Construction Plan', 'Approved construction/floor plan', true),
  ('COST_ESTIMATE', 'Cost Estimate', 'Detailed cost estimate from contractor', true),
  ('HOUSEHOLD_COMP', 'Household Composition', 'Declaration of household members', false),
  ('BANK_STATEMENT', 'Bank Statement', 'Recent bank statements (3 months)', false);