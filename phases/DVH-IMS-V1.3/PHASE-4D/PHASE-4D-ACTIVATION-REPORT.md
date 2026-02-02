# Phase 4D: Director Activation Report

**Completed:** 2026-02-02
**Phase:** 4D - Director Activation for Bouwsubsidie
**Status:** COMPLETE

---

## Executive Summary

Phase 4D has successfully activated the **Director** role to complete the pre-ministerial approval chain for the Bouwsubsidie workflow. Dossiers that pass fieldwork now require Director organizational approval before proceeding to council document generation.

---

## Implementation Summary

### 1. Database Changes

#### Enum Extension
- Added `director` to `app_role` enum

#### New Workflow States
| Status | Description |
|--------|-------------|
| `awaiting_director_approval` | Dossier awaiting Director review |
| `director_approved` | Director has approved the dossier |
| `returned_to_screening` | Director returned dossier for additional screening |

#### Transition Trigger Update
Updated `validate_subsidy_case_transition()` to include:
- `fieldwork` → `awaiting_director_approval`, `rejected`
- `awaiting_director_approval` → `director_approved`, `returned_to_screening`, `rejected`
- `returned_to_screening` → `screening`, `rejected`
- `director_approved` → `approved_for_council`, `rejected`

#### RLS Policies Created (10 total)

| Policy Name | Table | Operation |
|-------------|-------|-----------|
| `director_select_subsidy_case` | subsidy_case | SELECT |
| `director_update_subsidy_case` | subsidy_case | UPDATE |
| `director_select_person` | person | SELECT |
| `director_select_household` | household | SELECT |
| `director_insert_audit_event` | audit_event | INSERT |
| `director_select_status_history` | subsidy_case_status_history | SELECT |
| `director_insert_status_history` | subsidy_case_status_history | INSERT |
| `director_select_admin_notification` | admin_notification | SELECT |
| `director_update_admin_notification` | admin_notification | UPDATE |
| `director_insert_admin_notification` | admin_notification | INSERT |

---

### 2. TypeScript Updates

#### useUserRole.ts
- Added `director` to `AppRole` type union

#### useAuditLog.ts
- Added audit actions:
  - `DIRECTOR_REVIEW_STARTED`
  - `DIRECTOR_APPROVED`
  - `DIRECTOR_RETURNED`

---

### 3. Admin UI Updates

#### Subsidy Case Detail Page
- Added status badges:
  - `awaiting_director_approval` (info)
  - `director_approved` (success)
  - `returned_to_screening` (warning)
- Updated transition matrix for Director workflow

---

### 4. Menu Visibility Updates

Added `director` role access to:
- Dashboard
- Persons
- Households
- Subsidy Cases
- Audit Log

---

## Updated Workflow Diagram

```text
[Pre-Director Chain - Phases 4A/4B/4C]
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs → screening (loop)
                ↓
            fieldwork
                ↓
[NEW Phase 4D Director Chain]
    awaiting_director_approval
           ↓              ↓
    director_approved    returned_to_screening → screening
           ↓
    approved_for_council → council_doc_generated → finalized

[Any non-terminal state] → rejected (terminal)
```

---

## Verification Checklist

| Check | Status |
|-------|--------|
| `director` in app_role enum | ✓ VERIFIED |
| RLS SELECT policy (national scope) | ✓ VERIFIED |
| RLS UPDATE policy (national scope) | ✓ VERIFIED |
| Transition trigger updated | ✓ VERIFIED |
| TypeScript types updated | ✓ VERIFIED |
| Audit actions added | ✓ VERIFIED |
| Status badges render | ✓ VERIFIED |
| Status transitions available | ✓ VERIFIED |
| Menu visibility updated | ✓ VERIFIED |
| Woningregistratie unchanged | ✓ VERIFIED |

---

## Active Roles (10 total)

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
| **director** | **Bouwsubsidie** | **NEW - ACTIVE** |

---

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useUserRole.ts` | Added director to AppRole |
| `src/hooks/useAuditLog.ts` | Added director audit actions |
| `src/assets/data/menu-items.ts` | Added director to menu access |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Added statuses and transitions |

---

## Security Compliance

- Director role has national-level SELECT access
- Director role has national-level UPDATE access for status changes
- All Director actions logged to audit_event
- RLS policies enforce authentication
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

## Out of Scope (Explicitly Deferred)

- Ministerial Advisor role (Phase 4E)
- Minister final decision step
- Director user account creation
- Public wizard changes
- Scale optimizations

---

## Restore Points

- Pre-implementation: `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_START.md`
- Post-implementation: `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_COMPLETE.md`

---

## Next Phase

**Phase 4E: Ministerial Advisor Activation** (requires authorization)

---

**Phase 4D Status: COMPLETE**
