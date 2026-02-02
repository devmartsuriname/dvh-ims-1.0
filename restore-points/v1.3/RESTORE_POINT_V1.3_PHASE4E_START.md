# RESTORE POINT V1.3 - PHASE 4E START

**Created:** 2026-02-02
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 4E - Ministerial Advisor Activation (Pre-Implementation)
**Previous Phase:** 4D - Director Activation (COMPLETE)

---

## Current State Summary

### Active Roles (10)

| Role | Service | Status |
|------|---------|--------|
| system_admin | Both | ACTIVE |
| minister | Both | ACTIVE |
| project_leader | Both | ACTIVE |
| frontdesk_bouwsubsidie | Bouwsubsidie | ACTIVE |
| frontdesk_housing | Woningregistratie | ACTIVE |
| admin_staff | Both | ACTIVE |
| audit | Both | ACTIVE |
| social_field_worker | Bouwsubsidie | ACTIVE |
| technical_inspector | Bouwsubsidie | ACTIVE |
| director | Bouwsubsidie | ACTIVE |

### Bouwsubsidie Workflow States (Post-Phase 4D)

```
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs/fieldwork → awaiting_director_approval → director_approved →
approved_for_council → council_doc_generated → finalized
```

### Key Files (Pre-Change Checksums)

| File | Status |
|------|--------|
| `src/hooks/useUserRole.ts` | Contains 10 roles, director included |
| `src/hooks/useAuditLog.ts` | Contains DIRECTOR_* actions |
| `src/assets/data/menu-items.ts` | Director visibility configured |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Director states in UI |

---

## Changes To Be Made (Phase 4E)

1. Add `ministerial_advisor` to `app_role` enum
2. Update `is_national_role()` function
3. Add workflow states: `in_ministerial_advice`, `ministerial_advice_complete`, `returned_to_director`
4. Update `validate_subsidy_case_transition()` trigger
5. Create 10 RLS policies for ministerial_advisor
6. Update TypeScript types and audit actions
7. Update UI STATUS_BADGES and STATUS_TRANSITIONS
8. Update menu visibility

---

## Rollback Instructions

If Phase 4E fails:
1. Reference this restore point
2. Revert database to pre-Phase 4E state
3. Restore TypeScript files from Phase 4D state
4. Notify Delroy with error details

---

## Governance

- Authorization: Explicit approval received
- Scope: Bouwsubsidie only
- Excluded: Woningregistratie, public wizard, user provisioning

---

**STOP CONDITION:** This restore point marks the start of Phase 4E implementation.
