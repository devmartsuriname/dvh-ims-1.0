# Restore Point: V1.7 Security Hardening — Remove Redundant Anonymous RLS Policies

**Date:** 2026-02-27
**Version:** v1.7.x
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## What Changed

Dropped 6 redundant anonymous RLS policies that exposed PII-bearing tables to the `anon` role:

| Policy Name | Table | Type |
|-------------|-------|------|
| `anon_can_select_person_for_status` | `person` | SELECT |
| `anon_can_select_subsidy_case_status` | `subsidy_case` | SELECT |
| `anon_can_select_housing_registration_status` | `housing_registration` | SELECT |
| `anon_can_select_subsidy_status_history` | `subsidy_case_status_history` | SELECT |
| `anon_can_select_housing_status_history` | `housing_registration_status_history` | SELECT |
| `anon_can_insert_audit_event` | `audit_event` | INSERT |

**NOT dropped:** `anon_can_select_public_status_access` on `public_status_access` — design-intentional, contains no PII.

---

## Why Safe

All 3 public Edge Functions (`lookup-public-status`, `submit-bouwsubsidie-application`, `submit-housing-registration`) use `SUPABASE_SERVICE_ROLE_KEY` to interact with the database. The service role key bypasses RLS entirely. Therefore, these anonymous policies were redundant and only increased attack surface.

**Evidence:**
- `lookup-public-status/index.ts`: `createClient(supabaseUrl, supabaseServiceKey)`
- `submit-bouwsubsidie-application/index.ts`: same pattern
- `submit-housing-registration/index.ts`: same pattern
- No browser-side anonymous Supabase calls to any of the 6 affected tables exist in the codebase.

---

## Exact SQL Executed

```sql
DROP POLICY IF EXISTS "anon_can_select_person_for_status" ON person;
DROP POLICY IF EXISTS "anon_can_select_subsidy_case_status" ON subsidy_case;
DROP POLICY IF EXISTS "anon_can_select_housing_registration_status" ON housing_registration;
DROP POLICY IF EXISTS "anon_can_select_subsidy_status_history" ON subsidy_case_status_history;
DROP POLICY IF EXISTS "anon_can_select_housing_status_history" ON housing_registration_status_history;
DROP POLICY IF EXISTS "anon_can_insert_audit_event" ON audit_event;
```

---

## Validation Results

### Phase 3 — Functional Validation (STAGING)

| Test | Result |
|------|--------|
| Public status lookup (Edge Function) | PASS — Function responds correctly (validation errors for test data, service role bypasses RLS) |
| Admin dashboard (person SELECT) | PASS — 9 records returned |
| Admin dashboard (subsidy_case SELECT) | PASS — 5 records returned |
| Admin dashboard (audit_event SELECT) | PASS — 45 records returned |
| Remaining anon policies | PASS — Only `anon_can_select_public_status_access` + 2 storage bucket policies remain |

### Phase 4 — Post-Migration Security Scan

| Finding | Before | After |
|---------|--------|-------|
| `anon_can_select_person_for_status` | ERROR | REMOVED |
| `anon_can_select_subsidy_case_status` | ERROR | REMOVED |
| `anon_can_select_housing_registration_status` | ERROR | REMOVED |
| `anon_can_select_subsidy_status_history` | ERROR | REMOVED |
| `anon_can_select_housing_status_history` | ERROR | REMOVED |
| `anon_can_insert_audit_event` | WARN | REMOVED |
| `anon_can_select_public_status_access` | DESIGN-INTENTIONAL | UNCHANGED |

No new HIGH/CRITICAL findings introduced.

---

## Rollback Script

If public status lookup fails after this migration, execute:

```sql
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
```

---

## Files Changed

| File | Action |
|------|--------|
| SQL migration | Drop 6 policies |
| `docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md` | Created |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | Updated (RLS section) |

No source code changes. No Edge Function changes. No routing changes.
