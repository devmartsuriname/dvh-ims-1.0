-- ============================================================
-- PRODUCTION VERSION
-- ============================================================
-- Project:    DVH-IMS (VolksHuisvesting IMS)
-- Version:    v1.7.x
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Date:       2026-02-27
-- Purpose:    Remove 6 redundant anonymous RLS policies that
--             expose PII-bearing tables to the anon role.
--             All public Edge Functions use SUPABASE_SERVICE_ROLE_KEY
--             and bypass RLS entirely, making these policies
--             redundant attack surface.
-- Staging:    VALIDATED — Phase 3 functional + Phase 4 scan PASS
-- Authority:  Requires explicit written production authorization
-- ============================================================
-- ROLLBACK:   See ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "anon_can_select_person_for_status" ON person;
DROP POLICY IF EXISTS "anon_can_select_subsidy_case_status" ON subsidy_case;
DROP POLICY IF EXISTS "anon_can_select_housing_registration_status" ON housing_registration;
DROP POLICY IF EXISTS "anon_can_select_subsidy_status_history" ON subsidy_case_status_history;
DROP POLICY IF EXISTS "anon_can_select_housing_status_history" ON housing_registration_status_history;
DROP POLICY IF EXISTS "anon_can_insert_audit_event" ON audit_event;

COMMIT;
