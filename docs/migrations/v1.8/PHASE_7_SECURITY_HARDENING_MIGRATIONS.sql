-- ============================================================
-- PRODUCTION VERSION — Phase 7 Security Hardening
-- ============================================================
-- Project:    DVH-IMS (VolksHuisvesting IMS)
-- Version:    v1.8.x
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Date:       2026-03-07
-- Status:     EXECUTED — All 3 migrations applied successfully
-- ============================================================

-- Migration A: Drop anon_can_select_public_status_access (HIGH)
DROP POLICY IF EXISTS "anon_can_select_public_status_access" ON public_status_access;

-- Migration B: Restrict app_user_profile self-update (MEDIUM)
DROP POLICY IF EXISTS "Users can update own profile" ON app_user_profile;
CREATE POLICY "Users can update own profile"
ON app_user_profile
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND district_code IS NOT DISTINCT FROM (
    SELECT district_code FROM app_user_profile WHERE user_id = auth.uid()
  )
  AND is_active IS NOT DISTINCT FROM (
    SELECT is_active FROM app_user_profile WHERE user_id = auth.uid()
  )
);

-- Migration C: Add INSERT policy for housing_document_upload (MEDIUM)
CREATE POLICY "role_insert_housing_document_upload"
ON housing_document_upload
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'system_admin'::app_role)
  OR has_role(auth.uid(), 'project_leader'::app_role)
  OR (EXISTS (
    SELECT 1 FROM housing_registration hr
    WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing'::app_role)
           OR has_role(auth.uid(), 'admin_staff'::app_role))
      AND hr.district_code = get_user_district(auth.uid())
  ))
);
