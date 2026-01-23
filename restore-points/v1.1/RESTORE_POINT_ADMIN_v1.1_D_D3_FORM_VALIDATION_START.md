# Restore Point: Admin v1.1-D D3 Form Validation START

## Metadata
- **Created**: 2026-01-14
- **Phase**: Admin v1.1-D D3 (Form Validation Standardization)
- **Status**: START

## Scope
Add inline form validation to Admin CRUD forms using Bootstrap `isInvalid` + `Form.Control.Feedback` pattern. Validation mirrors DB NOT NULL constraints only.

## Pre-requisite (D2 Cleanup)
Fix remaining direct `toast` imports:
- `src/app/(admin)/households/components/HouseholdFormModal.tsx`
- `src/app/(admin)/persons/[id]/page.tsx`

## Files to Touch
1. `src/app/(admin)/households/components/HouseholdFormModal.tsx` - D2 cleanup
2. `src/app/(admin)/persons/[id]/page.tsx` - D2 cleanup
3. `src/app/(admin)/housing-registrations/components/RegistrationFormModal.tsx` - inline validation
4. `src/app/(admin)/subsidy-cases/components/CaseFormModal.tsx` - inline validation
5. `src/app/(admin)/housing-registrations/components/UrgencyAssessmentForm.tsx` - inline validation
6. `src/app/(admin)/allocation-quotas/components/QuotaFormModal.tsx` - inline validation
7. `src/app/(admin)/allocation-assignments/components/AssignmentFormModal.tsx` - inline validation
8. `docs/architecture.md` - add Form Validation Standard section

## Rollback Steps
1. Revert all files to previous commit
2. Or manually remove validation state + `isInvalid`/`Form.Control.Feedback` props

## Verification Checklist
- [ ] No direct `toast.*` in admin modules (excl. auth)
- [ ] All forms show inline errors on invalid submit
- [ ] No duplicate notifications
- [ ] `notify.error()` only for backend errors
- [ ] No TypeScript/build errors
