# DVH-IMS v1.7.x — CRITICAL BUGFIX: Housing Registration Submit Failure

## Root Cause Analysis (DETERMINISTIC, PROVEN)

### What Fails

Edge function `submit-housing-registration` **always** rejects every submission at the INPUT VALIDATION stage (line 119 and 127). The function never reaches the database layer.

### Evidence

Every edge function log entry shows the same validation failure:

```text
Validation failed: [{"field":"email","message":"Invalid email format"},{"field":"date_of_birth","message":"Date must be in YYYY-MM-DD format"}]
```

Direct curl test with valid data (`test.user@example.com`, `1998-02-10`) also returns HTTP 400 with the same error. This confirms the issue is **deterministic and 100% reproducible** -- no submission can ever pass validation.

### Why It Fails: Double-Escaped Regex in Housing Edge Function

In `supabase/functions/submit-housing-registration/index.ts`, lines 119 and 127:

```text
// BROKEN (housing) -- double backslash in regex LITERAL
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/     // line 119
const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/               // line 127
```

In a JavaScript/TypeScript regex literal (`/.../`), `\\s` means a literal backslash + letter `s`, NOT the `\s` whitespace character class. Similarly `\\d` means literal backslash + `d`, NOT a digit. So:

- The email regex rejects ALL valid emails (it expects literal backslashes in the input)
- The date regex rejects ALL valid dates like `1998-02-10` (it expects literal backslashes)

### Proof by Comparison: Bouwsubsidie Works

In `supabase/functions/submit-bouwsubsidie-application/index.ts`, lines 106 and 114:

```text
// CORRECT (bouwsubsidie) -- single backslash in regex literal
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/          // line 106
const dateRegex = /^\d{4}-\d{2}-\d{2}$/                  // line 114
```

This is why Bouwsubsidie submissions succeed and Housing submissions always fail.

### Category

**Regex escaping bug in edge function validation.** NOT RLS, NOT DB constraint, NOT Phase 8 regression.

### Regression Window

The double-escaped regex was introduced when `submit-housing-registration/index.ts` was last written/rewritten. The prior bugfix iteration (person upsert + reference number retry) included this double-escaping error in the regenerated file, masking the original constraint fix behind a new validation-layer bug.

## Fix Proposal

### Minimal Change: 2 Lines in 1 File

**File:** `supabase/functions/submit-housing-registration/index.ts`

**Line 119** -- Fix email regex:

```text
// Before (BROKEN):
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
// After (FIXED):
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Line 127** -- Fix date regex:

```text
// Before (BROKEN):
const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/
// After (FIXED):
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
```

### Additional Required Deliverables

1. **Restore point:** `docs/restore-points/v1.7/RESTORE_POINT_V1_7_HOUSING_SUBMIT_DEEP_DIAG.md`
2. **Incident RCA doc:** `docs/incidents/v1.7/INCIDENT_HOUSING_SUBMIT_FAILURE_RCA.md`
3. **Documentation updates:** `docs/backend.md` and `docs/DVH-IMS-V1.0_1.1/architecture.md`
4. **Build error note:** The pre-existing `TS1540` apexcharts type error is a known wontfix (see `RESTORE_POINT_V1.7x_TS1540_WONTFIX.md`) -- not related to this bug.

### Risk Assessment


| Risk                        | Level | Mitigation                                                       |
| --------------------------- | ----- | ---------------------------------------------------------------- |
| Fix breaks other validation | NONE  | Only regex literals change; all other validation logic untouched |
| Bouwsubsidie regression     | NONE  | Different file, not touched                                      |
| DB/RLS impact               | NONE  | Fix is in input validation layer, before any DB call             |


### Rollback Plan

Revert 2 regex lines to double-escaped versions (effectively re-breaks validation). Redeploy edge function. No DB rollback needed.

### Verification Plan (Post-Fix)

1. Deploy updated edge function to staging
2. Submit fresh housing registration end-to-end -- expect receipt screen
3. Submit again with same national_id -- expect receipt (person reuse)
4. Confirm record in `housing_registration` table with status `received`
5. Quick bouwsubsidie smoke test -- confirm no regression

**NOTE — Validation Layer Parity Check (Mandatory)**

After fixing the housing regex, verify that validation rules in:

- submit-housing-registration

- submit-bouwsubsidie-application

are fully aligned in structure and escaping style.

We must ensure no future divergence in shared validation logic.

If possible, extract shared validation helpers to a common module to prevent duplication drift (document only, not required for this fix).  
  
  
Constraints

- Staging environment only
- No production promotion
- No DB/schema/RLS changes
- HARD STOP after verification + report