# Phase 4E Activation Report: Ministerial Advisor Role

**Date:** 2026-02-02
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 4E - Ministerial Advisor Activation
**Status:** COMPLETE

---

## Executive Summary

Phase 4E successfully activated the **Ministerial Advisor** role to complete the pre-ministerial decision chain for the Bouwsubsidie workflow. After this phase, dossiers approved by the Director must receive Ministerial Advisor advice ("paraaf") before proceeding to Minister decision.

---

## Implementation Details

### 1. Database Changes

#### Enum Extension
- Added `ministerial_advisor` to `app_role` enum

#### Function Updates
- Updated `is_national_role()` to include `ministerial_advisor`

#### Trigger Updates
- Updated `validate_subsidy_case_transition()` with new states:
  - `director_approved` → `in_ministerial_advice`
  - `in_ministerial_advice` → `ministerial_advice_complete` | `returned_to_director`
  - `returned_to_director` → `awaiting_director_approval`
  - `ministerial_advice_complete` → `approved_for_council`

#### RLS Policies Created (10 total)
| Policy | Table | Operation |
|--------|-------|-----------|
| ministerial_advisor_select_subsidy_case | subsidy_case | SELECT |
| ministerial_advisor_update_subsidy_case | subsidy_case | UPDATE |
| ministerial_advisor_select_person | person | SELECT |
| ministerial_advisor_select_household | household | SELECT |
| ministerial_advisor_insert_audit_event | audit_event | INSERT |
| ministerial_advisor_select_status_history | subsidy_case_status_history | SELECT |
| ministerial_advisor_insert_status_history | subsidy_case_status_history | INSERT |
| ministerial_advisor_select_admin_notification | admin_notification | SELECT |
| ministerial_advisor_update_admin_notification | admin_notification | UPDATE |
| ministerial_advisor_insert_admin_notification | admin_notification | INSERT |

### 2. TypeScript Updates

#### useUserRole.ts
- Added `ministerial_advisor` to `AppRole` type
- Updated `isNationalRole` check to include `ministerial_advisor`

#### useAuditLog.ts
- Added audit actions:
  - `MINISTERIAL_ADVICE_STARTED`
  - `MINISTERIAL_ADVICE_COMPLETED`
  - `MINISTERIAL_ADVICE_RETURNED`

### 3. Admin UI Updates

#### subsidy-cases/[id]/page.tsx
- Added STATUS_BADGES:
  - `in_ministerial_advice`: info, "In Ministerial Advice"
  - `ministerial_advice_complete`: success, "Advice Complete"
  - `returned_to_director`: warning, "Returned to Director"

- Added STATUS_TRANSITIONS:
  - `director_approved` → `in_ministerial_advice`, `rejected`
  - `in_ministerial_advice` → `ministerial_advice_complete`, `returned_to_director`, `rejected`
  - `returned_to_director` → `awaiting_director_approval`, `rejected`
  - `ministerial_advice_complete` → `approved_for_council`, `rejected`

### 4. Menu Visibility

#### menu-items.ts
Added `ministerial_advisor` to:
- Dashboard
- Persons
- Households
- Subsidy Cases
- Audit Log

---

## Workflow Diagram (Post-Phase 4E)

```
[Pre-Director Chain - Phases 4A/4B/4C]
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs → screening (loop)
                ↓
            fieldwork
                ↓
[Phase 4D Director Chain]
    awaiting_director_approval
           ↓              ↓
    director_approved    returned_to_screening → screening
           ↓
[Phase 4E Ministerial Advisor Chain]
    in_ministerial_advice
           ↓                    ↓
    ministerial_advice_complete  returned_to_director → awaiting_director_approval
           ↓
    approved_for_council → council_doc_generated → finalized

[Any non-terminal state] → rejected (terminal)
```

---

## Active Roles (11 total)

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
| **ministerial_advisor** | **Bouwsubsidie** | **NEW** |

---

## Verification Results

| Check | Result |
|-------|--------|
| `ministerial_advisor` in app_role enum | ✓ PASS |
| `ministerial_advisor` in is_national_role() | ✓ PASS |
| 10 RLS policies created | ✓ PASS |
| 3 workflow states added | ✓ PASS |
| TypeScript types updated | ✓ PASS |
| Audit actions added | ✓ PASS |
| UI badges render correctly | ✓ PASS |
| Status transitions configured | ✓ PASS |
| Woningregistratie unchanged | ✓ PASS |

---

## Files Modified

| File | Change |
|------|--------|
| `supabase/migrations/*_phase_4e_*.sql` | 2 migration files |
| `src/hooks/useUserRole.ts` | Added role, updated isNationalRole |
| `src/hooks/useAuditLog.ts` | Added 3 audit actions |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Added badges and transitions |
| `src/assets/data/menu-items.ts` | Added ministerial_advisor to menus |

---

## Security Compliance

- National-level SELECT access for ministerial_advisor
- Status UPDATE access enforced via RLS
- All actions logged to audit_event
- Authentication required for all operations
- No anonymous access granted

---

## Governance Compliance

| Requirement | Status |
|-------------|--------|
| Bouwsubsidie only | ✓ ENFORCED |
| No Woningregistratie changes | ✓ ENFORCED |
| No public wizard changes | ✓ ENFORCED |
| No user account creation | ✓ ENFORCED |
| Restore points created | ✓ COMPLETE |
| Audit trail mandatory | ✓ IMPLEMENTED |

---

## Next Steps

- Phase 4F: Minister Final Decision Enforcement (if authorized)
- User provisioning for ministerial_advisor role (operational)
- End-to-end testing with test accounts

---

**Phase 4E COMPLETE - Awaiting next authorization**
