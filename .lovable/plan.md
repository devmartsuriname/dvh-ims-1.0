

# Phase 4D: Director Activation for Bouwsubsidie

## Executive Summary

Phase 4D will activate the **Director** role to complete the pre-ministerial approval chain for the Bouwsubsidie workflow. After this phase, dossiers that pass screening and fieldwork will require Director organizational approval before proceeding to the Minister.

---

## Current State Analysis

### Workflow Chain (Post-Phase 4C)

```text
received → in_social_review → social_completed → in_technical_review → 
technical_approved → in_admin_review → admin_complete → screening → 
needs_more_docs/fieldwork → approved_for_council → council_doc_generated → finalized
```

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

### Gap Identified

The `approved_for_council` state currently transitions directly to `council_doc_generated`. Per V1.2 documentation, Director organizational approval must occur between fieldwork completion and council document generation.

---

## Phase 4D Scope (STRICT)

### In Scope

1. Add `director` to `app_role` enum
2. Add new workflow states: `awaiting_director_approval`, `director_approved`
3. Update `validate_subsidy_case_transition()` trigger
4. Create 6+ RLS policies for Director role
5. Update UI STATUS_BADGES and STATUS_TRANSITIONS
6. Add audit actions for Director workflow
7. Update menu visibility for Director role

### Explicitly Out of Scope

- Ministerial Advisor role (Phase 4E)
- Minister final decision step enforcement
- Woningregistratie changes
- Public wizard changes
- New user account creation
- Scale optimizations

---

## Implementation Plan

### Step 1: Create Restore Point (Pre-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_START.md`

---

### Step 2: Database Migration

**Action:** Create new migration file

**Changes:**

1. **Extend app_role enum:**
   ```sql
   ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'director';
   ```

2. **Update validate_subsidy_case_transition():**

   Modified transition matrix:

   | From Status | To Status (NEW) |
   |-------------|-----------------|
   | `fieldwork` | `awaiting_director_approval`, `rejected` |
   | `awaiting_director_approval` | `director_approved`, `returned_to_screening`, `rejected` |
   | `returned_to_screening` | `screening`, `rejected` |
   | `director_approved` | `approved_for_council`, `rejected` |
   | `approved_for_council` | `council_doc_generated`, `rejected` (unchanged) |

3. **Create RLS policies for Director:**

   | Policy Name | Table | Operation | Scope |
   |-------------|-------|-----------|-------|
   | `director_select_subsidy_case` | subsidy_case | SELECT | National |
   | `director_update_subsidy_case` | subsidy_case | UPDATE | National |
   | `director_select_person` | person | SELECT | National |
   | `director_select_household` | household | SELECT | National |
   | `director_insert_audit_event` | audit_event | INSERT | Authenticated |
   | `director_select_status_history` | subsidy_case_status_history | SELECT | National |
   | `director_insert_status_history` | subsidy_case_status_history | INSERT | National |

**Director Scope Justification:**
Per V1.2 Roles & Authority Matrix, Director (DVH Supervisor) is a national-level decision authority with oversight responsibilities across all districts.

---

### Step 3: TypeScript Type Updates

**File:** `src/hooks/useUserRole.ts`

```typescript
export type AppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit'
  | 'social_field_worker'
  | 'technical_inspector'
  | 'director'  // NEW
```

---

### Step 4: Audit Action Updates

**File:** `src/hooks/useAuditLog.ts`

Add new audit actions:
- `DIRECTOR_REVIEW_STARTED`
- `DIRECTOR_APPROVED`
- `DIRECTOR_RETURNED`

---

### Step 5: Admin UI Updates

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

1. **Add STATUS_BADGES:**
   ```typescript
   awaiting_director_approval: { bg: 'info', label: 'Awaiting Director' },
   director_approved: { bg: 'success', label: 'Director Approved' },
   returned_to_screening: { bg: 'warning', label: 'Returned to Screening' },
   ```

2. **Update STATUS_TRANSITIONS:**
   ```typescript
   fieldwork: ['awaiting_director_approval', 'rejected'],
   awaiting_director_approval: ['director_approved', 'returned_to_screening', 'rejected'],
   returned_to_screening: ['screening', 'rejected'],
   director_approved: ['approved_for_council', 'rejected'],
   ```

---

### Step 6: Menu Visibility Update

**File:** `src/assets/data/menu-items.ts`

Add `director` to allowedRoles for:
- Dashboard
- Persons
- Households
- Subsidy Cases
- Audit Log

---

### Step 7: Create Restore Point (Post-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_COMPLETE.md`

---

## Workflow Diagram (Post-Phase 4D)

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

| Check | Expected Result |
|-------|-----------------|
| `director` appears in app_role enum | ✓ |
| RLS SELECT policy allows national access | ✓ |
| RLS UPDATE policy allows national access | ✓ |
| Transition from `fieldwork` → `awaiting_director_approval` works | ✓ |
| Transition from `awaiting_director_approval` → `director_approved` works | ✓ |
| Transition from `director_approved` → `approved_for_council` works | ✓ |
| Return path to screening works | ✓ |
| Audit events logged for all Director actions | ✓ |
| UI badges render correctly | ✓ |
| Status transitions appear in Change Status dropdown | ✓ |
| Woningregistratie workflow unchanged | ✓ |
| No console errors | ✓ |

---

## Governance Compliance

| Requirement | Status |
|-------------|--------|
| Bouwsubsidie only | ENFORCED |
| No Woningregistratie changes | ENFORCED |
| No public wizard changes | ENFORCED |
| No user account creation | ENFORCED |
| Restore points required | PLANNED |
| Audit trail mandatory | DESIGNED |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_START.md` | CREATE |
| `supabase/migrations/[timestamp]_phase_4d_director_activation.sql` | CREATE |
| `src/hooks/useUserRole.ts` | MODIFY (add director) |
| `src/hooks/useAuditLog.ts` | MODIFY (add audit actions) |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFY (add statuses) |
| `src/assets/data/menu-items.ts` | MODIFY (add director to roles) |
| `phases/DVH-IMS-V1.3/PHASE-4D/PHASE-4D-ACTIVATION-REPORT.md` | CREATE |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4D_COMPLETE.md` | CREATE |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Migration fails | Restore point allows rollback |
| RLS policy conflicts | National scope avoids district complexity |
| UI transition breaks | STATUS_TRANSITIONS follows established pattern |
| Audit gaps | All transitions log via existing pattern |

---

## Estimated Effort

- Database migration: 1 hour
- TypeScript updates: 30 minutes
- UI updates: 30 minutes
- Verification: 1 hour
- Documentation: 30 minutes

**Total:** ~3.5 hours

---

## Authorization Confirmation

This plan implements Phase 4D as authorized:
- Director role activation for Bouwsubsidie
- Pre-ministerial approval chain completion
- No scope expansion beyond documented requirements

**Ready for implementation upon approval.**

