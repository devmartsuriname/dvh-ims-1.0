# Restore Point: Admin v1.1-D D2 Notification Hygiene — START

**Created:** 2026-01-14
**Phase:** Admin v1.1-D
**Step:** D2 — Notification Hygiene

## Pre-Implementation State

D1 (Empty State Standardization) is verified complete:
- Allocation Runs, Quotas, Dashboard chart have standardized empty states
- No regressions detected

## Scope

Create unified notification helper (`src/utils/notify.ts`) and replace direct `toast` imports across 14 admin module files.

## Files to Modify

### New File
- `src/utils/notify.ts` — Unified notification helper

### Files to Update (Import Replacement)
1. `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx`
2. `src/app/(admin)/allocation-runs/components/RunTable.tsx`
3. `src/app/(admin)/allocation-runs/components/RunExecutorModal.tsx`
4. `src/app/(admin)/allocation-runs/[id]/page.tsx`
5. `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx`
6. `src/app/(admin)/allocation-decisions/components/DecisionFormModal.tsx`
7. `src/app/(admin)/allocation-assignments/components/AssignmentTable.tsx`
8. `src/app/(admin)/allocation-assignments/components/AssignmentFormModal.tsx`
9. `src/app/(admin)/subsidy-cases/components/CaseFormModal.tsx`
10. `src/app/(admin)/subsidy-cases/[id]/page.tsx`
11. `src/app/(admin)/housing-registrations/components/RegistrationFormModal.tsx`
12. `src/app/(admin)/housing-registrations/components/UrgencyAssessmentForm.tsx`
13. `src/app/(admin)/housing-registrations/[id]/page.tsx`
14. `src/app/(admin)/households/[id]/page.tsx`

### Documentation Update
- `docs/architecture.md` — Add Notification Standard section

## Rollback Steps

1. Delete `src/utils/notify.ts`
2. Revert import changes in 14 files (replace `notify` with direct `toast`)
3. Revert `docs/architecture.md` Notification Standard section

## Verification Checklist (Pre-Implementation)

- [x] D1 stable — empty states rendering correctly
- [x] No console errors on admin modules
- [x] All CRUD notifications currently functioning (with direct toast)
