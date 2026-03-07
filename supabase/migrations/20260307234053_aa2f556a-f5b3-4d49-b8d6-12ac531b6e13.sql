-- Phase 7 — Migration B: Restrict app_user_profile self-update to prevent district_code/is_active modification
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Finding: MEDIUM — Users can change own district_code, escalating district-level access

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