# Restore Point: v1.7.x — Housing Submit Failure Fix

## Identifier
`RESTORE_POINT_V1_7_HOUSING_SUBMIT_FAIL`

## Date
2026-03-01

## Context
Woningregistratie "Registratie indienen" fails on final submission step (staging).
Bouwsubsidie flow works correctly.

## Root Cause
Edge function `submit-housing-registration` fails on two DB unique constraint violations:
1. `person_national_id_key` — duplicate person when national_id already exists
2. `housing_registration_reference_number_key` — duplicate reference number from prior failed attempt

## Category
DB unique constraint violation (NOT RLS, NOT Phase 8 regression)

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/submit-housing-registration/index.ts` | Person lookup-first + reference number retry loop + correlation ID logging |
| `docs/backend.md` | Bugfix entry |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | Change History entry |

## Files NOT Modified
- No frontend changes
- No DB schema changes
- No RLS changes
- No Bouwsubsidie edge function changes

## Rollback Approach
1. Revert `supabase/functions/submit-housing-registration/index.ts` to prior version
2. Redeploy edge function
3. No DB rollback needed (no schema changes)

## Environment
Staging ONLY. No production promotion.
