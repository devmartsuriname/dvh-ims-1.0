# Phase 7 — Remaining Critical Coverage & Safe Quality Hardening Report

**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Status:** COMPLETE (pending user-run deno test verification)

---

## Objective

Close the most important remaining low-risk quality gaps identified in the audit and Phase 6 report, with emphasis on:
- Additional protected-function test coverage (`generate-raadvoorstel`)
- Safe null-safety / UX hardening
- AuthProvider and loading state hygiene
- Empty state completeness audit

---

## 1. Pre-Phase State

| Gap from Phase 6 Report | Status Before Phase 7 |
|--------------------------|----------------------|
| `generate-raadvoorstel` auth gate — no tests | **Resolved in Phase 7** |
| `control-queue/page.tsx` returns `null` during load (blank screen) | **Resolved in Phase 7** |
| `strictNullChecks` disabled | **Deferred — see section 3** |
| Empty states in admin table/list pages | **Confirmed complete — no gaps found** |

**Local test execution note (BL-02 carry-forward):** Node.js and Deno are not on the Claude shell PATH in this environment. Neither `npm test` nor `deno test` could be executed. All new test files are additive and structurally consistent with the existing test patterns. User must run verification commands manually.

---

## 2. Task 1 — generate-raadvoorstel Protected Function Coverage

### 2.1 File Created

`supabase/functions/generate-raadvoorstel/index.test.ts`

### 2.2 Tests Added

| Test Name | Input | Expected Response | Side Effects |
|-----------|-------|-------------------|--------------|
| No Authorization header → 401 AUTH_MISSING | No `Authorization` header | `401`, `{ success: false, error: "AUTH_MISSING" }` | None — rejected before any DB op |
| Malformed/expired token → 401 AUTH_INVALID | `Authorization: Bearer this-is-not-a-valid-jwt-token` | `401`, `{ success: false, error: "AUTH_INVALID" }` | None — rejected before any DB op |
| Missing case_id with valid auth → 400 VALIDATION_UUID | Valid admin token, empty body `{}` | `400`, `{ success: false, error: "VALIDATION_UUID" }` | None — rejected at UUID validation, before DB fetch |
| Invalid case_id UUID format → 400 VALIDATION_UUID | Valid admin token, `{ case_id: "not-a-valid-uuid" }` | `400`, `{ success: false, error: "VALIDATION_UUID" }` | None — rejected at UUID validation, before DB fetch |

### 2.3 What Was NOT Tested (by design)

The happy path (valid `case_id` → DOCX generation → storage upload → DB record insert → audit log write) is explicitly excluded. Testing the happy path would:
- Generate real DOCX files and upload them to the `generated-documents` storage bucket
- Insert rows into the `generated_document` table
- Write audit events to `audit_event`

These are all irreversible side effects in the shared database and storage. The 4 boundary tests above cover all security-critical rejection paths without any side effects.

### 2.4 Verification

Run with:
```
deno test --allow-net supabase/functions/generate-raadvoorstel/index.test.ts
```

---

## 3. Task 2 — strictNullChecks Assessment

### 3.1 Assessment

The project `tsconfig.app.json` currently has:
- `"strict": false`
- No `strictNullChecks` setting (defaults to `false` when `strict` is `false`)
- `"noImplicitAny": false`

A grep survey of `.tsx` files found **61 `.data` accessor usages across 18 files**. These primarily stem from Supabase query results, where the pattern `const { data, error } = await supabase.from(...)...` returns `T | null` for `data`.

Enabling `strictNullChecks: true` alone (without `strict: true`) would require explicit null guards for every such access site. The estimated blast radius is **15–20 files across the `src/app` and `src/hooks` directories**, exceeding the Phase 7 safety constraint of local, low-risk changes.

### 3.2 Decision: DEFERRED

`strictNullChecks` was **not enabled** in Phase 7. Enabling it would constitute a broad migration violating the Phase 7 safety constraints.

**Recommended future path:** Create a dedicated `Phase 8 – Null Safety Migration` session where the TypeScript compiler output can be reviewed and each issue addressed systematically.

---

## 4. Task 3 — AuthProvider UX Completion

### 4.1 AuthProvider — Already Complete

`src/context/useAuthContext.tsx` already implements the approved spinner/loading pattern (added in a prior phase):

```tsx
if (isLoading) {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}
```

No `return null` pattern was found in `AuthProvider`. This task was already complete — no changes required to `useAuthContext.tsx`.

### 4.2 control-queue/page.tsx — Fixed

**Issue found:** `src/app/(admin)/control-queue/page.tsx:42` contained `if (loading) return null`, which rendered a blank page while `useControlQueue` was resolving data.

**Fix applied:** Replaced with the standard spinner pattern consistent with all other admin pages:

```tsx
if (loading) {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-50">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}
```

`Spinner` was added to the react-bootstrap imports on line 2.

**File modified:** `src/app/(admin)/control-queue/page.tsx`

---

## 5. Task 4 — Empty State Audit

All admin table/list pages were systematically checked for `length === 0` guards. The following pages were audited:

| Page / Component | Empty State Present? |
|------------------|---------------------|
| `allocation-runs/components/RunTable.tsx` | ✅ Yes |
| `allocation-decisions/components/DecisionTable.tsx` | ✅ Yes (Pending + History tabs) |
| `allocation-assignments/components/AssignmentTable.tsx` | ✅ Yes |
| `allocation-quotas/components/QuotaTable.tsx` | ✅ Yes |
| `case-assignments/page.tsx` | ✅ Yes |
| `control-queue/page.tsx` | ✅ Yes |
| `archive/page.tsx` | ✅ Yes (Bouwsubsidie + Woningregistratie tabs) |
| `audit-log/components/AuditLogTable.tsx` | ✅ Yes (inline `<td colSpan>` row) |
| `housing-waiting-list/page.tsx` | ✅ Yes |
| `households/components/HouseholdTable.tsx` | ✅ Yes |
| `my-visits/page.tsx` | ✅ Yes |
| `schedule-visits/page.tsx` | ✅ Yes (Pending Cases + Field Workers) |
| `persons/components/PersonTable.tsx` | ✅ Yes |
| `housing-registrations/components/RegistrationTable.tsx` | ✅ Yes |
| `subsidy-cases/components/CaseTable.tsx` | ✅ Yes |
| `qr-codes/page.tsx` | N/A — static config page, not a dynamic list |

**Conclusion:** No empty state gaps found. All dynamic list/table pages have proper `length === 0` guards.

---

## 6. Files Changed

| File | Action | Reason |
|------|--------|--------|
| `supabase/functions/generate-raadvoorstel/index.test.ts` | **Created** | Auth/boundary test coverage for Phase 7 Task 1 |
| `src/app/(admin)/control-queue/page.tsx` | **Modified** | Replace `return null` with spinner (Task 3/4) |
| `restore-points/v1.8/Restore_Point_Fix_Phase_7_Start.md` | **Created** | Phase 7 restore point |
| `docs/DVH-IMS/V1.8/PHASE_7_COVERAGE_QUALITY_HARDENING_REPORT.md` | **Created** | This report |

---

## 7. Files NOT Changed

| File | Reason |
|------|--------|
| `tsconfig.app.json` | `strictNullChecks` deferred — blast radius too broad |
| `src/context/useAuthContext.tsx` | Already has correct spinner pattern — no changes needed |
| All other admin pages | Empty states already present — no changes needed |
| Any Supabase edge function (production) | No test file modifies production edge function logic |

---

## 8. Test Coverage Summary — Cumulative State After Phase 7

| Coverage Area | Status |
|---------------|--------|
| Badge constants (statusBadges.ts) | ✅ COVERED — 18 assertions (Phase 5) |
| Auth loading stability (useAuthContext) | ✅ COVERED — 7 assertions (Phase 5) |
| `execute-allocation-run` auth/validation gate | ✅ COVERED — 5 Deno tests (Phase 5) |
| `ROLE_ALLOWED_TRANSITIONS` (subsidy RBAC) | ✅ COVERED — extracted and tested (Phase 6) |
| `STATUS_TRANSITIONS` (subsidy state machine) | ✅ COVERED — extracted and tested (Phase 6) |
| `useUserRole` hook | ✅ COVERED — unit tests (Phase 6) |
| `get-document-download-url` auth/validation gate | ✅ COVERED — 4 Deno tests (Phase 6) |
| `generate-raadvoorstel` auth/validation gate | ✅ COVERED — 4 Deno tests (Phase 7) |

---

## 9. Regression Notes

- No public/citizen flows were modified
- No admin workflow or business logic was modified
- The only production code change is `control-queue/page.tsx:42` — spinner replaces blank render during loading
- The spinner pattern used is identical to the one present in all other admin pages
- No visual regression expected on any other page
- No routing or permission model changes

---

## 10. Skipped / Deferred Items

| Item | Reason for Deferral |
|------|---------------------|
| `strictNullChecks: true` | Estimated 15–20 files affected (61 `.data` accesses across 18 `.tsx` files). Violates Phase 7 safety constraint of local, low-risk changes only. Recommend dedicated null-safety migration phase. |
| Happy path test for `generate-raadvoorstel` | Would create real DOCX files, storage objects, DB records, and audit events in the shared environment. Explicitly excluded per Phase 7 safety constraints. |

---

## 11. Verification Checklist

- [ ] `npm install && npm test` — existing Vitest tests (Phase 5 + Phase 6) still pass
- [ ] `deno test --allow-net supabase/functions/generate-raadvoorstel/index.test.ts` — 4 new tests pass
- [ ] Navigate to Control Queue in admin UI — spinner displays during load instead of blank screen
- [ ] No admin pages show blank content during data loading
- [ ] No public/citizen pages affected

---

**Phase 7 is COMPLETE. Do not proceed to Phase 8 without explicit authorization.**
