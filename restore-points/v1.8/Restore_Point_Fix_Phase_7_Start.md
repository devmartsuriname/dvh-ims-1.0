# Restore Point — Phase 7 Start
**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Phase:** 7 — Remaining Critical Coverage & Safe Quality Hardening

---

## Purpose

Created before any Phase 7 changes. Documents the exact state of the codebase at Phase 7 entry so that any Phase 7 change can be rolled back to this point.

---

## Pre-Phase 7 State

### Phase 6 Completion Confirmed

Phase 6 — Testability Extraction & Critical RBAC Coverage — was completed in the prior session. The following files were added/modified:

| File | Phase 6 Action |
|------|----------------|
| `src/lib/subsidyCaseTransitions.ts` | Created — exported ROLE_ALLOWED_TRANSITIONS, STATUS_TRANSITIONS, NEXT_RESPONSIBLE_ROLE |
| `src/lib/subsidyCaseTransitions.test.ts` | Created — unit tests for extracted constants |
| `src/hooks/useUserRole.test.ts` | Created — unit tests for useUserRole hook |
| `supabase/functions/get-document-download-url/index.test.ts` | Created — 4 Deno boundary tests |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Modified — imports from lib instead of inline constants |
| `docs/DVH-IMS/V1.8/PHASE_6_TESTABILITY_RBAC_REPORT.md` | Created — Phase 6 report |

### Current Known Issues at Phase 7 Entry

| Issue | Location | Severity |
|-------|----------|----------|
| No auth/boundary tests for `generate-raadvoorstel` | `supabase/functions/generate-raadvoorstel/` | Medium — test coverage gap |
| `return null` during loading in control-queue | `src/app/(admin)/control-queue/page.tsx:42` | Low — blank screen on slow load |
| `strictNullChecks` disabled | `tsconfig.app.json` | Low — type safety gap |

### Key File States Before Phase 7

#### `supabase/functions/generate-raadvoorstel/index.ts`
- Lines: 666
- Auth gate: `AUTH_MISSING` (no header → 401), `AUTH_INVALID` (bad token → 401)
- RBAC: `AUTH_FORBIDDEN` (wrong role → 403)
- Validation: `VALIDATION_UUID` (bad/missing case_id → 400)
- Happy path: generates DOCX, uploads to storage, creates DB record, logs audit event → 200
- NOT tested as of Phase 6 end

#### `src/app/(admin)/control-queue/page.tsx`
- Line 42: `if (loading) return null` — blank screen while `useControlQueue` loads
- This is a blank-screen UX gap

#### `tsconfig.app.json`
- `"strict": false`
- No `strictNullChecks` setting
- `"noImplicitAny": false`

### Current Test Coverage State

| Coverage Area | Status Before Phase 7 |
|---------------|----------------------|
| Badge constants (statusBadges.ts) | COVERED — 18 assertions |
| Auth loading stability | COVERED — 7 assertions |
| execute-allocation-run auth/validation gate | COVERED — 5 Deno tests |
| subsidyCaseTransitions (RBAC constants) | COVERED — Phase 6 |
| useUserRole hook | COVERED — Phase 6 |
| get-document-download-url auth gate | COVERED — 4 Deno tests (Phase 6) |
| generate-raadvoorstel auth/boundary gate | **UNCOVERED** |

---

## Rollback Instructions

If Phase 7 must be rolled back:

### Files to DELETE (created in Phase 7):
- `supabase/functions/generate-raadvoorstel/index.test.ts`
- `docs/DVH-IMS/V1.8/PHASE_7_COVERAGE_QUALITY_HARDENING_REPORT.md`
- `restore-points/v1.8/Restore_Point_Fix_Phase_7_Start.md` (this file)

### Files to REVERT (modified in Phase 7):
- `src/app/(admin)/control-queue/page.tsx` — restore `if (loading) return null` at line 42

### Verification after rollback:
- `src/app/(admin)/control-queue/page.tsx` must compile without errors
- Control queue page must load (blank during load is acceptable on rollback)
- `npm test` must pass (Phase 5 + Phase 6 tests only)

---

## Phase 7 Scope (Authorized)

1. Add minimal Deno boundary tests for `generate-raadvoorstel` (auth gate + validation only)
2. Assess `strictNullChecks` feasibility — enable if safe, defer if cascading
3. Fix `return null` blank-screen in `control-queue/page.tsx`
4. Audit and fix remaining empty-state gaps in table/list pages

**Phase 7 is NOT authorized to:**
- Modify database schema
- Modify RLS policies
- Redesign UI
- Introduce new libraries
- Alter business behavior or workflow logic
- Proceed to Phase 8 automatically
