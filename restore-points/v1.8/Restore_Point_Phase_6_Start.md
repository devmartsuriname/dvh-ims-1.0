# Restore Point — Phase 6 Start
**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Phase:** 6 — Testability Extraction & Critical RBAC Coverage

---

## Purpose

Created before any Phase 6 changes. Documents the exact state of the codebase at Phase 6 entry so that any Phase 6 change can be rolled back to this point.

---

## Pre-Phase 6 State

### Phase 5 Completion Confirmed

Phase 5 — Test Foundation — was completed in the prior session. The following files were added:

| File | Phase 5 Action |
|------|----------------|
| `vitest.config.ts` | Created — Vitest test runner config |
| `src/test/setup.ts` | Created — jest-dom setup |
| `src/constants/statusBadges.test.ts` | Created — 18 badge constant regression tests |
| `src/context/useAuthContext.test.tsx` | Created — 7 auth stability regression tests |
| `supabase/functions/execute-allocation-run/index.test.ts` | Created — 5 Deno integration tests |
| `package.json` | Modified — `test`/`test:watch` scripts + 4 devDependencies |
| `tsconfig.node.json` | Modified — added `vitest.config.ts` to `include` |
| `docs/DVH-IMS/V1.8/PHASE_5_TEST_FOUNDATION_REPORT.md` | Created — Phase 5 report |

**Note (BL-02):** npm/Node.js was not on the PATH in the Claude shell environment during Phase 5. Tests were written but could not be executed. User must run `npm install && npm test` to verify.

### Current Test Coverage State

| Coverage Area | Status Before Phase 6 |
|---------------|----------------------|
| Badge constants (statusBadges.ts) | COVERED — 18 assertions |
| Auth loading stability (Phase 3 S-01/S-02) | COVERED — 7 assertions |
| execute-allocation-run auth/validation gate | COVERED — 5 Deno tests |
| ROLE_ALLOWED_TRANSITIONS (subsidy RBAC) | **UNCOVERED — not exported** |
| STATUS_TRANSITIONS (subsidy state machine) | **UNCOVERED — not exported** |
| useUserRole hook | **UNCOVERED** |
| get-document-download-url auth gate | **UNCOVERED** |

### Key File States Before Phase 6

#### `src/app/(admin)/subsidy-cases/[id]/page.tsx`
- Lines: 969
- Contains module-scoped (non-exported) constants:
  - `STATUS_TRANSITIONS` (lines 108–133): 22 states × allowed next states
  - `NEXT_RESPONSIBLE_ROLE` (lines 140–166): notification routing map
  - `ROLE_ALLOWED_TRANSITIONS` (lines 173–278): RBAC enforcement matrix (22 from-states)
- These constants are used at lines 465–475 to compute `allowedTransitions`
- Also uses `NEXT_RESPONSIBLE_ROLE` at line 413 for notification routing

#### `src/hooks/useUserRole.ts`
- Lines: 100
- Not tested
- Exports: `AppRole` type, `useUserRole` hook
- Dependencies: `supabase.auth.getUser()` + `user_roles` table + `app_user_profile` table

#### `supabase/functions/get-document-download-url/index.ts`
- Lines: 170
- Auth gate: `AUTH_MISSING` (no header) → 401, `AUTH_INVALID` (bad token) → 401
- RBAC: `AUTH_FORBIDDEN` (wrong role) → 403
- Validation: `VALIDATION_UUID` (bad document_id) → 400
- Happy path: DB lookup → signed URL → 200
- Audit log write at line 139 (INSERT into `audit_event`)
- NOT tested in Phase 5

---

## Rollback Instructions

If Phase 6 must be rolled back:

### Files to DELETE (created in Phase 6):
- `src/lib/subsidyCaseTransitions.ts`
- `src/lib/subsidyCaseTransitions.test.ts`
- `src/hooks/useUserRole.test.ts`
- `supabase/functions/get-document-download-url/index.test.ts`
- `docs/DVH-IMS/V1.8/PHASE_6_TESTABILITY_RBAC_REPORT.md`
- `restore-points/v1.8/Restore_Point_Phase_6_Start.md` (this file)

### Files to REVERT (modified in Phase 6):
- `src/app/(admin)/subsidy-cases/[id]/page.tsx` — restore original (remove import from lib, restore local const declarations)
- `docs/DVH-IMS/V1.8/SYSTEM_STATUS_AUDIT_V1.8.md` — remove Phase 6 amendment section

### Verification after rollback:
- `src/app/(admin)/subsidy-cases/[id]/page.tsx` must compile without errors
- `npm test` must pass (Phase 5 tests only)
- Admin subsidy case detail page must function normally

---

## Phase 6 Scope (Authorized)

1. Extract `ROLE_ALLOWED_TRANSITIONS` + `STATUS_TRANSITIONS` from `subsidy-cases/[id]/page.tsx` to `src/lib/subsidyCaseTransitions.ts`
2. Add unit tests for extracted constants (`src/lib/subsidyCaseTransitions.test.ts`)
3. Add Deno integration tests for `get-document-download-url`
4. Add unit tests for `useUserRole` hook
5. Create Phase 6 report + update docs

**Phase 6 is NOT authorized to:**
- Modify database schema
- Modify RLS policies
- Redesign UI
- Introduce new libraries
- Alter business behavior
- Proceed to Phase 7 automatically
