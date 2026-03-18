# Restore Point: DVH-IMS Phase 4 — Quick Wins Start

**Created:** 2026-03-18
**Phase:** Pre-Phase 4 (Quick Wins)
**Authority:** Delroy
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Baseline State

Phases 1–3 are complete. This restore point captures the state before Phase 4 quick wins.

---

## Changes Planned in Phase 4

### 1. New File Created
- `src/constants/statusBadges.ts` — shared badge constants module (does not exist before this phase)

### 2. Files Modified — Status Badge Consolidation

| File | Local Constant Removed | Shared Import Added |
|------|----------------------|---------------------|
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | `STATUS_BADGES` (8-entry housing) | `HOUSING_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx` | `STATUS_BADGES` (8-entry housing) | `HOUSING_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/housing-waiting-list/page.tsx` | `STATUS_BADGES` (8-entry housing) | `HOUSING_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/archive/housing/[id]/page.tsx` | `STATUS_BADGES` (8-entry housing) | `HOUSING_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | `STATUS_BADGES` (27-entry subsidy) | `SUBSIDY_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/archive/subsidy/[id]/page.tsx` | `STATUS_BADGES` (27-entry subsidy) | `SUBSIDY_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/schedule-visits/page.tsx` | `VISIT_TYPE_BADGES` | `VISIT_TYPE_BADGES` (direct import) |
| `src/app/(admin)/my-visits/page.tsx` | `VISIT_TYPE_BADGES` | `VISIT_TYPE_BADGES` (direct import) |
| `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx` | `DECISION_BADGES` | `DECISION_BADGES` (direct import) |
| `src/app/(admin)/allocation-runs/components/RunTable.tsx` | `STATUS_BADGES` (4-entry run status) | `ALLOCATION_RUN_STATUS_BADGES as STATUS_BADGES` |
| `src/app/(admin)/allocation-runs/[id]/page.tsx` | `STATUS_BADGES` + `DECISION_BADGES` | `ALLOCATION_RUN_STATUS_BADGES as STATUS_BADGES` + `DECISION_BADGES` |

### 3. Dead Code Removal

| File | Removed |
|------|---------|
| `src/app/(admin)/allocation-runs/components/RunExecutorModal.tsx` | Unused `session` variable destructuring from `getSession()` |

---

## Rollback Instructions

To revert Phase 4:
1. Delete `src/constants/statusBadges.ts`
2. Restore each file's local badge constant definitions from the content documented in the Phase 4 report
3. Remove the `import` lines added from `@/constants/statusBadges`

No database changes, no schema changes, no RLS changes.
