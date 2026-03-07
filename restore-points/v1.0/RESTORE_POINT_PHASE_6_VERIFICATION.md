# Restore Point: Phase 6 — Verification & Closure

**Created:** 2026-03-07
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 6 — Verification, Closure, and Freeze
**Status:** DEFECT-001 RESOLVED

## Scope

- Runtime validation of all V1.8 changes
- Edge function positive/negative test matrix
- Admin UI children display verification
- DEFECT-001: Gender constraint fix
- Final closure report

## DEFECT-001 Resolution

**Migration:** `fix_subsidy_household_child_gender_constraint`
- Dropped constraint `subsidy_household_child_gender_check` (was `('M','V')`)
- Recreated as `CHECK (gender IN ('M', 'F'))`
- No data conversion needed (only `'M'` records existed)

**Edge Function:** `submit-bouwsubsidie-application` redeployed (no code changes)

**Verification:** Case BS-2026-000009 created with 2 children:
- Child 1: M, age 5, no disability ✅
- Child 2: F, age 3, has disability ✅

## Rollback

Revert migration: `ALTER TABLE public.subsidy_household_child DROP CONSTRAINT subsidy_household_child_gender_check; ALTER TABLE public.subsidy_household_child ADD CONSTRAINT subsidy_household_child_gender_check CHECK (gender IN ('M', 'V'));`
