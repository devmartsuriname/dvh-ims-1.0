# Restore Point: DVH-IMS Fix Phase Start

**Created:** 2026-03-18
**Phase:** Pre-Security Hardening (Fix Execution Phase 1)
**Authority:** Delroy
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Baseline State

This restore point captures the system state immediately before the controlled fix execution begins. The system is at the end of V1.8 development, with the following known baseline:

- All edge functions configured with `verify_jwt = false` in `supabase/config.toml`
- All 9 functions have internal auth checks where appropriate
- No Phase 1–5 fix execution has been applied yet
- Git branch: `main`, clean working tree

## Trigger

Full codebase audit completed on 2026-03-18. Phase 1 (Security Hardening) authorized to begin.

## State of `supabase/config.toml` Before Changes

```toml
project_id = "okfqnqsvsesdpkpvltpr"

[functions.execute-allocation-run]
verify_jwt = false

[functions.submit-bouwsubsidie-application]
verify_jwt = false

[functions.submit-housing-registration]
verify_jwt = false

[functions.lookup-public-status]
verify_jwt = false

[functions.generate-raadvoorstel]
verify_jwt = false

[functions.get-document-download-url]
verify_jwt = false

[functions.health-check]
verify_jwt = false

[functions.get-citizen-document]
verify_jwt = false

[functions.track-qr-scan]
verify_jwt = false
```

## Changes Introduced in Phase 1

The following 4 functions will have `verify_jwt` changed from `false` → `true`:

- `execute-allocation-run`
- `generate-raadvoorstel`
- `get-citizen-document`
- `get-document-download-url`

The following 5 functions remain `verify_jwt = false` (intentional public access):

- `submit-bouwsubsidie-application`
- `submit-housing-registration`
- `lookup-public-status`
- `health-check`
- `track-qr-scan`

## Rollback Instructions

To restore the pre-Phase-1 state:

1. Open `supabase/config.toml`
2. For each of these 4 functions, change `verify_jwt = true` back to `verify_jwt = false`:
   - `execute-allocation-run`
   - `generate-raadvoorstel`
   - `get-citizen-document`
   - `get-document-download-url`
3. Redeploy edge functions via Supabase dashboard or CLI

**Note:** No function code was modified in Phase 1. The internal auth logic inside each function remains intact regardless of the config setting. Rollback is limited to the single config file.

## Files Modified in Phase 1

- `supabase/config.toml` (config change only)

## Files Created in Phase 1

- `restore-points/v1.8/Restore_Point_Fix_Phase_Start.md` (this file)
- `docs/DVH-IMS/V1.8/PHASE_1_SECURITY_HARDENING_REPORT.md`
