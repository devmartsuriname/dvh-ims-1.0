# Restore Point — Phase 8 Start
**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Phase:** 8 — Null Safety Migration (Controlled, Incremental, Governance-Enforced)

---

## Purpose

Created before any Phase 8 changes. Documents the exact state of the codebase at Phase 8 entry so that any Phase 8 change can be rolled back to this point.

---

## Pre-Phase 8 State

### Phase 7 Completion Confirmed

Phase 7 — Remaining Critical Coverage & Safe Quality Hardening — was completed in the prior session:

| File | Phase 7 Action |
|------|----------------|
| `supabase/functions/generate-raadvoorstel/index.test.ts` | Created — 4 Deno boundary tests (auth + validation) |
| `src/app/(admin)/control-queue/page.tsx` | Modified — replaced `return null` with Spinner |
| `docs/DVH-IMS/V1.8/PHASE_7_COVERAGE_QUALITY_HARDENING_REPORT.md` | Created — Phase 7 report |

### Verified Test Baseline (from Lovable, pre-Phase 8)

| Test Suite | Result |
|------------|--------|
| Vitest (npm test) | 92/92 tests pass — 4 suites |
| Deno unauthenticated auth-gate tests | 5/5 pass |
| Deno authenticated tests (verify_jwt = true functions) | BLOCKED — JWT relay mismatch (out of scope for Phase 8) |

### Known External Blocker (NOT Phase 8 scope)

- **Supabase JWT relay mismatch**: Authenticated Deno tests for `verify_jwt = true` functions (generate-raadvoorstel, get-document-download-url) fail with `401 "Invalid JWT"` due to a gateway-level JWT relay issue
- This is a platform/infrastructure issue, not a code issue
- Do NOT fix in Phase 8

### TypeScript Config State Before Phase 8

`tsconfig.app.json`:
- `"strict": false`
- No `strictNullChecks` setting (defaults to `false`)
- `"noImplicitAny": false`

---

## Rollback Instructions

If Phase 8 must be rolled back:

### Files to DELETE (created in Phase 8):
- `docs/DVH-IMS/V1.8/PHASE_8_NULL_SAFETY_REPORT.md`
- `restore-points/v1.8/Restore_Point_Fix_Phase_8_Start.md` (this file)

### Files to REVERT (potentially modified in Phase 8):
- `tsconfig.app.json` — remove `strictNullChecks: true` if added
- Any `.tsx` / `.ts` files with null-guard additions — revert to prior state

### Verification after rollback:
- `npm test` must pass 92/92
- `tsc --noEmit` must pass without the null-safety errors
- All admin pages must compile and load

---

## Phase 8 Scope (Authorized)

1. Null safety audit — identify high-risk null/undefined access patterns
2. Attempt `strictNullChecks: true` — measure blast radius
3. Fix only approved high-risk null sites (local, low-risk fixes)
4. Re-run tests, verify no regression
5. Defer any items requiring broad refactor

**Phase 8 is NOT authorized to:**
- Modify database schema
- Modify RLS policies
- Redesign UI
- Introduce new libraries
- Modify business logic or workflow behavior
- Fix the Supabase JWT relay mismatch
- Proceed to Phase 9 automatically
