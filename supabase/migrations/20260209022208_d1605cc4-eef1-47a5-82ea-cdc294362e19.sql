
-- =============================================================
-- DVH-IMS V1.5 — Security Remediation Migration
-- Fix 1: Remove public exposure on housing_document_requirement
-- Fix 3: Remove 12 unnecessary anon INSERT policies
-- =============================================================

-- ---- FIX 1: housing_document_requirement ----

DROP POLICY IF EXISTS "anon_can_select_housing_document_requirement" ON public.housing_document_requirement;
DROP POLICY IF EXISTS "authenticated_can_select_housing_document_requirement" ON public.housing_document_requirement;

CREATE POLICY "role_select_housing_document_requirement" ON public.housing_document_requirement
FOR SELECT TO authenticated
USING (
  is_national_role(auth.uid())
  OR has_role(auth.uid(), 'frontdesk_housing'::app_role)
  OR has_role(auth.uid(), 'frontdesk_bouwsubsidie'::app_role)
  OR has_role(auth.uid(), 'admin_staff'::app_role)
);

-- ---- FIX 3: Drop 12 anon INSERT policies with WITH CHECK (true) ----

DROP POLICY IF EXISTS "anon_can_insert_address" ON public.address;
DROP POLICY IF EXISTS "anon_can_insert_contact_point" ON public.contact_point;
DROP POLICY IF EXISTS "anon_can_insert_household" ON public.household;
DROP POLICY IF EXISTS "anon_can_insert_household_member" ON public.household_member;
DROP POLICY IF EXISTS "anon_can_insert_housing_document_upload" ON public.housing_document_upload;
DROP POLICY IF EXISTS "anon_can_insert_housing_registration" ON public.housing_registration;
DROP POLICY IF EXISTS "anon_can_insert_housing_status_history" ON public.housing_registration_status_history;
DROP POLICY IF EXISTS "anon_can_insert_person" ON public.person;
DROP POLICY IF EXISTS "anon_can_insert_public_status_access" ON public.public_status_access;
DROP POLICY IF EXISTS "anon_can_insert_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "anon_can_insert_subsidy_status_history" ON public.subsidy_case_status_history;
DROP POLICY IF EXISTS "anon_can_insert_document_upload" ON public.subsidy_document_upload;
