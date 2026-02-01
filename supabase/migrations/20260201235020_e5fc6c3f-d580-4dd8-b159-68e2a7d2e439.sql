-- Phase 5C: Housing Document Upload Tables
-- Creates tables for housing registration document requirements and uploads

-- Create housing_document_requirement table
CREATE TABLE IF NOT EXISTS public.housing_document_requirement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_code TEXT NOT NULL UNIQUE,
  document_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create housing_document_upload table
CREATE TABLE IF NOT EXISTS public.housing_document_upload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.housing_registration(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.housing_document_requirement(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ
);

-- Enable RLS on both tables
ALTER TABLE public.housing_document_requirement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_document_upload ENABLE ROW LEVEL SECURITY;

-- RLS Policies for housing_document_requirement
-- Anyone can read requirements (needed for public wizard)
CREATE POLICY "anon_can_select_housing_document_requirement"
  ON public.housing_document_requirement 
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_can_select_housing_document_requirement"
  ON public.housing_document_requirement 
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage requirements
CREATE POLICY "role_insert_housing_document_requirement"
  ON public.housing_document_requirement 
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'project_leader'));

CREATE POLICY "role_update_housing_document_requirement"
  ON public.housing_document_requirement 
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'system_admin') OR has_role(auth.uid(), 'project_leader'));

-- RLS Policies for housing_document_upload
-- Anonymous insert for public wizard submissions
CREATE POLICY "anon_can_insert_housing_document_upload"
  ON public.housing_document_upload 
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Staff can select based on district
CREATE POLICY "role_select_housing_document_upload"
  ON public.housing_document_upload 
  FOR SELECT
  TO authenticated
  USING (
    is_national_role(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.housing_registration hr
      WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing') OR has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = get_user_district(auth.uid())
    )
  );

-- Staff can update verification status
CREATE POLICY "role_update_housing_document_upload"
  ON public.housing_document_upload 
  FOR UPDATE
  TO authenticated
  USING (
    is_national_role(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.housing_registration hr
      WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing') OR has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = get_user_district(auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_housing_document_upload_registration_id 
  ON public.housing_document_upload(registration_id);

CREATE INDEX IF NOT EXISTS idx_housing_document_upload_requirement_id 
  ON public.housing_document_upload(requirement_id);

-- Seed initial document requirements for housing registration
INSERT INTO public.housing_document_requirement (document_code, document_name, description, is_mandatory)
VALUES
  ('ID_COPY', 'Copy of ID', 'Valid government-issued ID card or passport', true),
  ('INCOME_PROOF', 'Proof of Income', 'Recent salary slips or income statement', true),
  ('RESIDENCE_PROOF', 'Proof of Current Residence', 'Utility bill or rental agreement', true),
  ('FAMILY_COMPOSITION', 'Family Composition', 'Declaration of household members', false),
  ('MEDICAL_CERT', 'Medical Certificate', 'Medical certificate for disability (if applicable)', false),
  ('EMERGENCY_PROOF', 'Emergency Documentation', 'Proof of emergency situation (if applicable)', false)
ON CONFLICT (document_code) DO NOTHING;