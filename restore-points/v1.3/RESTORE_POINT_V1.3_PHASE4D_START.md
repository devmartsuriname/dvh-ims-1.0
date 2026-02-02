# Restore Point: V1.3 Phase 4D Start

**Created:** 2026-02-02
**Phase:** 4D - Director Activation for Bouwsubsidie
**Purpose:** Pre-implementation checkpoint

---

## System State at Checkpoint

### Active Roles (9 total)

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

### Workflow States (Bouwsubsidie)

```text
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs → screening (loop)
                ↓
            fieldwork → approved_for_council → council_doc_generated → finalized
```

### Recent Completed Phases

- Phase 5C: Housing Document Upload + Admin Tab (COMPLETE)
- Phase 4C: Admin Officer Workflow (COMPLETE)
- Phase 4B: Technical Inspector Workflow (COMPLETE)
- Phase 4A: Social Field Worker Workflow (COMPLETE)

---

## Changes to Be Made in Phase 4D

1. Add `director` to `app_role` enum
2. Add workflow states: `awaiting_director_approval`, `director_approved`, `returned_to_screening`
3. Update `validate_subsidy_case_transition()` trigger
4. Create RLS policies for Director role
5. Update TypeScript types and audit actions
6. Update Admin UI with new status badges and transitions
7. Update menu visibility for Director role

---

## Rollback Instructions

If Phase 4D must be rolled back:

1. Remove `director` from `app_role` enum (requires migration)
2. Restore original `validate_subsidy_case_transition()` trigger
3. Drop all Director-related RLS policies
4. Revert TypeScript type changes
5. Revert Admin UI changes
6. Revert menu visibility changes

---

## Verification Before Proceeding

- [x] All Phase 5C changes verified
- [x] Bouwsubsidie workflow functional
- [x] Housing Registration workflow unchanged
- [x] Audit logging operational
- [x] Admin notifications functional

---

**Status:** CHECKPOINT CREATED
**Next Action:** Execute Phase 4D Implementation
