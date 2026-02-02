# RESTORE POINT V1.3 - PHASE 4F START

**Created:** 2026-02-02
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 4F - Minister Final Decision Enforcement (Pre-Implementation)
**Previous Phase:** 4E - Ministerial Advisor Activation (COMPLETE)

---

## Current State Summary

### Active Roles (11)

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
| ministerial_advisor | Bouwsubsidie | ACTIVE |

### Bouwsubsidie Workflow States (Post-Phase 4E)

```
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs/fieldwork → awaiting_director_approval → director_approved →
in_ministerial_advice → ministerial_advice_complete → approved_for_council →
council_doc_generated → finalized
```

### Key Files (Pre-Change Checksums)

| File | Status |
|------|--------|
| `src/hooks/useUserRole.ts` | Contains 11 roles, ministerial_advisor included |
| `src/hooks/useAuditLog.ts` | Contains MINISTERIAL_ADVICE_* actions |
| `src/assets/data/menu-items.ts` | Ministerial advisor visibility configured |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Ministerial advisor states in UI |

---

## Changes To Be Made (Phase 4F)

1. Add workflow states: `awaiting_minister_decision`, `minister_approved`, `returned_to_advisor`
2. Update `validate_subsidy_case_transition()` trigger
3. Block direct path from `ministerial_advice_complete` to `approved_for_council`
4. Add audit actions: `MINISTER_DECISION_STARTED`, `MINISTER_APPROVED`, `MINISTER_RETURNED`
5. Update UI STATUS_BADGES and STATUS_TRANSITIONS

---

## Rollback Instructions

If Phase 4F fails:
1. Reference this restore point
2. Revert database to pre-Phase 4F state
3. Restore TypeScript files from Phase 4E state
4. Notify Delroy with error details

---

## Governance

- Authorization: Explicit approval received
- Scope: Bouwsubsidie only
- Excluded: Woningregistratie, public wizard, user provisioning
- Note: No new RLS policies needed (Minister role already has national access)

---

**STOP CONDITION:** This restore point marks the start of Phase 4F implementation.
