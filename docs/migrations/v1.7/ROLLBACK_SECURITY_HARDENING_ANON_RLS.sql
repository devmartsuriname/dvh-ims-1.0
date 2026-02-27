-- ============================================================
-- ROLLBACK — Security Hardening: Recreate Anonymous RLS Policies
-- ============================================================
-- Project:    DVH-IMS (VolksHuisvesting IMS)
-- Version:    v1.7.x
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Date:       2026-02-27
-- Purpose:    Recreate the 6 anonymous RLS policies dropped by
--             PROD_SECURITY_HARDENING_ANON_RLS.sql
-- ============================================================
-- WHEN TO USE:
--   - Edge Function lookup-public-status fails post-migration
--   - Admin access to person/subsidy_case is denied
--   - New HIGH/CRITICAL security findings appear
--   - Authorization: Delroy
--   - Time window: within 1 hour of migration execution
-- ============================================================
-- SAFETY: Uses CREATE POLICY (not CREATE OR REPLACE).
--   Will ERROR if policies already exist — this is intentional
--   to prevent accidental double-creation.
-- ============================================================

BEGIN;

CREATE POLICY "anon_can_select_person_for_status" ON person FOR SELECT TO anon
  USING (
    (EXISTS (SELECT 1 FROM subsidy_case sc JOIN public_status_access psa ON psa.entity_id = sc.id
     WHERE sc.applicant_person_id = person.id AND psa.entity_type = 'subsidy_case'))
    OR
    (EXISTS (SELECT 1 FROM housing_registration hr JOIN public_status_access psa ON psa.entity_id = hr.id
     WHERE hr.applicant_person_id = person.id AND psa.entity_type = 'housing_registration'))
  );

CREATE POLICY "anon_can_select_subsidy_case_status" ON subsidy_case FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public_status_access psa
    WHERE psa.entity_id = subsidy_case.id AND psa.entity_type = 'subsidy_case'));

CREATE POLICY "anon_can_select_housing_registration_status" ON housing_registration FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public_status_access psa
    WHERE psa.entity_id = housing_registration.id AND psa.entity_type = 'housing_registration'));

CREATE POLICY "anon_can_select_subsidy_status_history" ON subsidy_case_status_history FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public_status_access psa
    WHERE psa.entity_id = subsidy_case_status_history.case_id AND psa.entity_type = 'subsidy_case'));

CREATE POLICY "anon_can_select_housing_status_history" ON housing_registration_status_history FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public_status_access psa
    WHERE psa.entity_id = housing_registration_status_history.registration_id AND psa.entity_type = 'housing_registration'));

CREATE POLICY "anon_can_insert_audit_event" ON audit_event FOR INSERT TO anon
  WITH CHECK ((actor_user_id IS NULL) AND (actor_role = 'public'));

COMMIT;
