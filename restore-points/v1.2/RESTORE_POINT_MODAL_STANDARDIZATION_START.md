# RESTORE POINT: Modal Standardization Start

**Version:** DVH-IMS-V1.2
**Created:** 2026-01-24
**Type:** Pre-Implementation Checkpoint

---

## Context

Beginning Admin UI Modal Standardization task to apply Darkone 1:1 compliance across all admin modals.

## Scope

- Standardize all admin modals to `size="lg"` + `centered`
- 8 modals identified, 7 require changes
- No functional changes, UI positioning only

## Files to Modify

| File | Change Required |
|------|-----------------|
| PersonFormModal.tsx | Add `size="lg"` |
| HouseholdFormModal.tsx | Add `size="lg"` |
| CaseFormModal.tsx | Add `centered` |
| RegistrationFormModal.tsx | Add `size="lg"` |
| QuotaFormModal.tsx | Add `size="lg"` |
| RunExecutorModal.tsx | Add `size="lg"` |
| AssignmentFormModal.tsx | Add `size="lg"` |
| DecisionFormModal.tsx | No change (already compliant) |

## Governance

- Documentation-first approach completed
- Plan approved by authority
- Guardian Rules enforced

---

**END OF RESTORE POINT**
