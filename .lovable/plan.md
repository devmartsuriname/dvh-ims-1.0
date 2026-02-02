
# Phase 4E: Ministerial Advisor Activation for Bouwsubsidie

## Executive Summary

Phase 4E will activate the **Ministerial Advisor** role to complete the ministerial decision chain for the Bouwsubsidie workflow. After this phase, dossiers approved by the Director will require Ministerial Advisor review and "paraaf" (initialing) before proceeding to the Minister for final decision.

---

## Current State Analysis

### Workflow Chain (Post-Phase 4D)

```text
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs/fieldwork → awaiting_director_approval → director_approved →
approved_for_council → council_doc_generated → finalized
```

### Active Roles (10 total)

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

### Gap Identified

Per V1.2 documentation (Step 6 of 7), dossiers approved by the Director must go through Ministerial Advisor advice and "paraaf" before reaching the Minister for final decision. Currently, `director_approved` transitions directly to `approved_for_council`.

---

## Phase 4E Scope (STRICT)

### In Scope

1. Add `ministerial_advisor` to `app_role` enum
2. Add new workflow states: `in_ministerial_advice`, `ministerial_advice_complete`, `returned_to_director`
3. Update `validate_subsidy_case_transition()` trigger
4. Update `is_national_role()` function to include `ministerial_advisor`
5. Create 8+ RLS policies for Ministerial Advisor role
6. Update UI STATUS_BADGES and STATUS_TRANSITIONS
7. Add audit actions for Ministerial Advisor workflow
8. Update menu visibility for Ministerial Advisor role

### Explicitly Out of Scope

- Minister final decision step enforcement (structurally prepared, not enforced)
- Woningregistratie changes (Ministerial Advisor is Bouwsubsidie-only)
- Public wizard changes
- New user account creation
- Scale optimizations
- Ministerial Advisor user account provisioning

---

## Implementation Plan

### Step 1: Create Restore Point (Pre-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4E_START.md`

---

### Step 2: Database Migration (Two Migrations)

**Migration 1:** Extend app_role enum

```sql
-- Add ministerial_advisor to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ministerial_advisor';
```

**Migration 2:** RLS policies and trigger update

#### 2.1 Update is_national_role() function

```sql
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role IN (
      'system_admin', 'minister', 'project_leader', 'audit',
      'director', 'ministerial_advisor'  -- Add ministerial_advisor
    )
  )
$$;
```

#### 2.2 Updated Transition Matrix

| From Status | To Status (NEW) |
|-------------|-----------------|
| `director_approved` | `in_ministerial_advice`, `rejected` |
| `in_ministerial_advice` | `ministerial_advice_complete`, `returned_to_director`, `rejected` |
| `returned_to_director` | `awaiting_director_approval`, `rejected` |
| `ministerial_advice_complete` | `approved_for_council`, `rejected` |
| `approved_for_council` | `council_doc_generated`, `rejected` (unchanged) |

#### 2.3 RLS Policies for Ministerial Advisor

| Policy Name | Table | Operation | Scope |
|-------------|-------|-----------|-------|
| `ministerial_advisor_select_subsidy_case` | subsidy_case | SELECT | National |
| `ministerial_advisor_update_subsidy_case` | subsidy_case | UPDATE | National |
| `ministerial_advisor_select_person` | person | SELECT | National |
| `ministerial_advisor_select_household` | household | SELECT | National |
| `ministerial_advisor_insert_audit_event` | audit_event | INSERT | Authenticated |
| `ministerial_advisor_select_status_history` | subsidy_case_status_history | SELECT | National |
| `ministerial_advisor_insert_status_history` | subsidy_case_status_history | INSERT | National |
| `ministerial_advisor_select_admin_notification` | admin_notification | SELECT | National |
| `ministerial_advisor_update_admin_notification` | admin_notification | UPDATE | National |
| `ministerial_advisor_insert_admin_notification` | admin_notification | INSERT | National |

**Ministerial Advisor Scope Justification:**
Per V1.2 Roles & Authority Matrix and Phase 3 documentation, Ministerial Advisor is a national-level advisory role with read access to all Bouwsubsidie dossiers and status update authority for advisory workflow.

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
  | 'director'
  | 'ministerial_advisor'  // NEW

// Update isNationalRole check:
const isNationalRole = roles.some(role => 
  ['system_admin', 'minister', 'project_leader', 'audit', 'director', 'ministerial_advisor'].includes(role)
)
```

---

### Step 4: Audit Action Updates

**File:** `src/hooks/useAuditLog.ts`

Add new audit actions:
- `MINISTERIAL_ADVICE_STARTED`
- `MINISTERIAL_ADVICE_COMPLETED`
- `MINISTERIAL_ADVICE_RETURNED`

---

### Step 5: Admin UI Updates

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

#### 5.1 Add STATUS_BADGES

```typescript
in_ministerial_advice: { bg: 'info', label: 'In Ministerial Advice' },
ministerial_advice_complete: { bg: 'success', label: 'Advice Complete' },
returned_to_director: { bg: 'warning', label: 'Returned to Director' },
```

#### 5.2 Update STATUS_TRANSITIONS

```typescript
director_approved: ['in_ministerial_advice', 'rejected'],
in_ministerial_advice: ['ministerial_advice_complete', 'returned_to_director', 'rejected'],
returned_to_director: ['awaiting_director_approval', 'rejected'],
ministerial_advice_complete: ['approved_for_council', 'rejected'],
```

---

### Step 6: Menu Visibility Update

**File:** `src/assets/data/menu-items.ts`

Add `ministerial_advisor` to allowedRoles for:
- Dashboard
- Persons
- Households
- Subsidy Cases
- Audit Log

---

### Step 7: Create Restore Point (Post-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4E_COMPLETE.md`

---

### Step 8: Documentation

**File:** `phases/DVH-IMS-V1.3/PHASE-4E/PHASE-4E-ACTIVATION-REPORT.md`

---

## Workflow Diagram (Post-Phase 4E)

```text
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
[NEW Phase 4E Ministerial Advisor Chain]
    in_ministerial_advice
           ↓                    ↓
    ministerial_advice_complete  returned_to_director → awaiting_director_approval
           ↓
    approved_for_council → council_doc_generated → finalized

[Any non-terminal state] → rejected (terminal)
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4E_START.md` | CREATE |
| `supabase/migrations/[timestamp]_phase_4e_ministerial_advisor_enum.sql` | CREATE |
| `supabase/migrations/[timestamp]_phase_4e_ministerial_advisor_rls.sql` | CREATE |
| `src/hooks/useUserRole.ts` | MODIFY (add ministerial_advisor, update isNationalRole) |
| `src/hooks/useAuditLog.ts` | MODIFY (add audit actions) |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFY (add statuses) |
| `src/assets/data/menu-items.ts` | MODIFY (add ministerial_advisor to roles) |
| `phases/DVH-IMS-V1.3/PHASE-4E/PHASE-4E-ACTIVATION-REPORT.md` | CREATE |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4E_COMPLETE.md` | CREATE |

---

## Verification Checklist

| Check | Expected Result |
|-------|-----------------|
| `ministerial_advisor` appears in app_role enum | Required |
| `ministerial_advisor` included in is_national_role() | Required |
| RLS SELECT policy allows national access | Required |
| RLS UPDATE policy allows national access | Required |
| Transition from `director_approved` → `in_ministerial_advice` works | Required |
| Transition from `in_ministerial_advice` → `ministerial_advice_complete` works | Required |
| Return path to director works | Required |
| Audit events logged for all Ministerial Advisor actions | Required |
| UI badges render correctly | Required |
| Status transitions appear in Change Status dropdown | Required |
| Woningregistratie workflow unchanged | Required |
| No console errors | Required |

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

## Security Considerations

- Ministerial Advisor has national-level SELECT access to subsidy_case
- Ministerial Advisor has national-level UPDATE access for status changes only
- All Ministerial Advisor actions logged to audit_event
- RLS policies enforce authentication
- No anonymous access granted
- Role explicitly excluded from Woningregistratie tables

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Migration fails | Restore point allows rollback |
| RLS policy conflicts | National scope avoids district complexity |
| UI transition breaks | STATUS_TRANSITIONS follows established pattern |
| Audit gaps | All transitions log via existing pattern |

---

## Active Roles After Phase 4E (11 total)

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
| **ministerial_advisor** | **Bouwsubsidie** | **NEW - ACTIVE** |

---

## End-of-Task Report Format

After implementation:

```
IMPLEMENTED
- ministerial_advisor role added to app_role enum
- is_national_role() function updated
- 10 RLS policies for ministerial_advisor
- 3 new workflow states added
- TypeScript types updated
- Audit actions added
- Status badges and transitions updated
- Menu visibility updated

PARTIAL
- None

SKIPPED
- Minister final decision enforcement (deferred)
- Woningregistratie changes (out of scope)
- User account creation (operational, not implementation)

VERIFICATION
- Database enum verified
- RLS policies verified
- Workflow transitions verified
- UI rendering verified

RESTORE POINTS
- RESTORE_POINT_V1.3_PHASE4E_START.md
- RESTORE_POINT_V1.3_PHASE4E_COMPLETE.md

BLOCKERS / ERRORS
- NONE
```

---

## Stop Condition

After completing implementation:
- STOP and report
- Await explicit authorization for next phase

---

**Ready for implementation upon approval.**
