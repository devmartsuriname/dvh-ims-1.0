# Restore Point: v1.7.x — Housing Submit Deep Diagnosis + Regex Fix

## Identifier
`RESTORE_POINT_V1_7_HOUSING_SUBMIT_DEEP_DIAG`

## Date
2026-03-01

## Context
Woningregistratie "Registratie indienen" fails deterministically on ALL submissions in staging. Root cause: double-escaped regex literals in `submit-housing-registration` edge function validation layer (lines 119, 127). Every valid email and date is rejected before the function reaches the database.

## Root Cause
Double-escaped backslashes in regex literals:
- `\\s` interpreted as literal backslash + 's' instead of whitespace class
- `\\d` interpreted as literal backslash + 'd' instead of digit class

## Category
Regex escaping bug in edge function input validation. NOT RLS, NOT DB constraint, NOT Phase 8 regression.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/submit-housing-registration/index.ts` | Fix email regex (line 119) and date regex (line 127) — remove double escaping |
| `docs/incidents/v1.7/INCIDENT_HOUSING_SUBMIT_FAILURE_RCA.md` | Root cause analysis document |
| `docs/backend.md` | Bugfix entry |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | Change History entry |

## Files NOT Modified
- No frontend changes
- No DB schema changes
- No RLS changes
- No Bouwsubsidie edge function changes

## Rollback Approach
1. Revert 2 regex lines to double-escaped versions in `submit-housing-registration/index.ts`
2. Redeploy edge function
3. No DB rollback needed

## Environment
Staging ONLY. No production promotion.
