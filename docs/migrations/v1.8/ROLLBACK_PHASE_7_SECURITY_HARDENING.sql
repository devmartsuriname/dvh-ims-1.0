-- ============================================================
-- ROLLBACK — Phase 7 Security Hardening
-- ============================================================
-- Project:    DVH-IMS (VolksHuisvesting IMS)
-- Version:    v1.8.x
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Date:       2026-03-07
-- ============================================================

BEGIN;

-- Rollback Migration C: Remove housing_document_upload INSERT policy
DROP POLICY IF EXISTS "role_insert_housing_document_upload" ON housing_document_upload;

-- Rollback Migration B: Restore unrestricted self-update policy
DROP POLICY IF EXISTS "Users can update own profile" ON app_user_profile;
CREATE POLICY "Users can update own profile"
ON app_user_profile
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Rollback Migration A: Recreate anonymous SELECT on public_status_access
CREATE POLICY "anon_can_select_public_status_access"
ON public_status_access
FOR SELECT
TO anon
USING (true);

COMMIT;
