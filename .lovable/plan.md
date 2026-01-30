

# DVH-IMS V1.3 — Phase 4A Execution Plan

## Document Type: Phase Scope & Execution Plan
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4A — Social Field Worker Activation (Bouwsubsidie Only)
## Authorization: OPTION 2 → OPTION 1 Path (First Controlled Activation)

---

## 1. Authorization Context

| Item | Status |
|------|--------|
| DVH-IMS V1.1 | OPERATIONAL (LIVE) |
| DVH-IMS V1.2 | CLOSED (Documentation Only) |
| V1.3 Phase 1 (D-01 + D-02) | CLOSED & LOCKED |
| V1.3 Phase 2 (S-03) | CLOSED & LOCKED |
| V1.3 Phase 3 (Preparation) | CLOSED & LOCKED |
| V1.3 Phase 4A | OPEN — First Role Activation |

**Scope Constraint:** Bouwsubsidie ONLY — Woningregistratie remains UNCHANGED

---

## 2. Phase 4A Objective

Activate the **Social Field Worker** role for Bouwsubsidie service ONLY, with:
- RBAC enforcement at database level
- Dossier state transition constraints
- Full audit logging
- Traceability via correlation_id

---

## 3. Current State Analysis

### 3.1 Existing Infrastructure (from Phase 1-3)

| Component | Current State |
|-----------|---------------|
| app_role enum | 7 active values |
| Backend triggers | V1.1 transition matrix enforced |
| Audit logging | correlation_id enabled |
| Admin notifications | Operational (S-03) |
| TypeScript definitions | V1.2 roles prepared in v12-roles.ts (NOT imported) |
| RLS policy templates | Documented in Phase 3 |

### 3.2 Current Bouwsubsidie Workflow

```text
Current V1.1 State Machine (subsidy_case):

received → screening → needs_more_docs/fieldwork → 
           approved_for_council → council_doc_generated → finalized
           (any non-terminal) → rejected
```

### 3.3 Target Workflow (Phase 4A — Social Field Worker Integration)

```text
Target State Machine (Bouwsubsidie with Social Step):

received → IN_SOCIAL_REVIEW → SOCIAL_COMPLETED → screening → 
           needs_more_docs/fieldwork → approved_for_council → 
           council_doc_generated → finalized
           (any non-terminal) → rejected
           IN_SOCIAL_REVIEW → RETURNED_TO_INTAKE
```

---

## 4. Implementation Scope

### 4.1 What Gets Activated

| Item | Action |
|------|--------|
| `social_field_worker` enum value | ADD to app_role |
| Social Field Worker RLS policies | CREATE (Bouwsubsidie only) |
| Status transitions | EXTEND for social review step |
| Audit events | ENABLE for social_field_worker |
| Backend trigger | UPDATE to allow new transitions |
| TypeScript AppRole | UPDATE to include new role |

### 4.2 What Remains UNCHANGED

| Item | Status |
|------|--------|
| Woningregistratie workflow | NO CHANGES |
| Housing registration trigger | NO CHANGES |
| UI menus/dropdowns | NO CHANGES |
| Existing 7 roles | UNCHANGED permissions |
| Technical Inspector role | NOT ACTIVATED |
| Director role | NOT ACTIVATED |
| Ministerial Advisor role | NOT ACTIVATED |

---

## 5. Database Changes

### 5.1 Enum Extension

```sql
-- Add social_field_worker to app_role enum
ALTER TYPE public.app_role ADD VALUE 'social_field_worker';
```

### 5.2 Status Extension (Bouwsubsidie Only)

The current subsidy_case.status is a text field, so no enum extension needed. The backend trigger will be updated to recognize the new statuses.

### 5.3 Backend Trigger Update

The `validate_subsidy_case_transition()` function will be updated to include:

| From Status | Allowed Transitions |
|-------------|---------------------|
| received | IN_SOCIAL_REVIEW, rejected |
| IN_SOCIAL_REVIEW | SOCIAL_COMPLETED, RETURNED_TO_INTAKE, rejected |
| SOCIAL_COMPLETED | screening, rejected |
| (remaining transitions unchanged) | ... |

### 5.4 RLS Policy Creation

Policies for social_field_worker role (Bouwsubsidie only):

| Table | Operation | Scope |
|-------|-----------|-------|
| subsidy_case | SELECT | District + status filter |
| subsidy_case | UPDATE | District + IN_SOCIAL_REVIEW status only |
| person | SELECT | Via case access |
| household | SELECT | Via case access |
| social_report | SELECT, INSERT, UPDATE | Via case access |
| audit_event | INSERT | Own actions only |
| admin_notification | SELECT, UPDATE | Own notifications |

### 5.5 Security Function Update

Update `is_national_role()` if needed — but `social_field_worker` is DISTRICT-SCOPED, so no change required.

---

## 6. Application Changes

### 6.1 TypeScript Updates

| File | Change |
|------|--------|
| src/hooks/useUserRole.ts | Add 'social_field_worker' to AppRole type |
| src/integrations/supabase/types.ts | Will auto-regenerate after migration |

### 6.2 Audit Hook Updates

| File | Change |
|------|--------|
| src/hooks/useAuditLog.ts | Add 'social_report' to EntityType |

### 6.3 Status Change Handler Updates

| File | Change |
|------|--------|
| src/app/(admin)/subsidy-cases/[id]/page.tsx | Add new status transitions, audit events |

---

## 7. Implementation Steps

### Step 4A-1: Create Restore Point

Create `RESTORE_POINT_V1.3_PHASE4A_START.md` before any implementation.

### Step 4A-2: Database Migration

Execute migration to:
1. Add `social_field_worker` to `app_role` enum
2. Update `validate_subsidy_case_transition()` function
3. Create RLS policies for social_field_worker

### Step 4A-3: TypeScript Updates

1. Update `AppRole` type in `useUserRole.ts`
2. Update `EntityType` in `useAuditLog.ts`

### Step 4A-4: Status Handler Updates

1. Add new status transitions to `STATUS_TRANSITIONS` constant
2. Add new status badges to `STATUS_BADGES` constant
3. Add audit logging for social assessment actions

### Step 4A-5: Verification Testing

Execute verification tests (see Section 9).

### Step 4A-6: Documentation

Create Phase 4A artifacts under `phases/DVH-IMS-V1.3/PHASE-4A/`.

### Step 4A-7: Create Completion Restore Point

Create `RESTORE_POINT_V1.3_PHASE4A_COMPLETE.md`.

---

## 8. Transition Matrix Update (Bouwsubsidie)

### 8.1 Updated State Machine

| From Status | Allowed Transitions |
|-------------|---------------------|
| received | IN_SOCIAL_REVIEW, rejected |
| IN_SOCIAL_REVIEW | SOCIAL_COMPLETED, RETURNED_TO_INTAKE, rejected |
| RETURNED_TO_INTAKE | IN_SOCIAL_REVIEW, rejected |
| SOCIAL_COMPLETED | screening, rejected |
| screening | needs_more_docs, fieldwork, rejected |
| needs_more_docs | screening, rejected |
| fieldwork | approved_for_council, rejected |
| approved_for_council | council_doc_generated, rejected |
| council_doc_generated | finalized, rejected |
| finalized | (terminal) |
| rejected | (terminal) |

### 8.2 Backward Compatibility

**CRITICAL:** Existing cases in states `received`, `screening`, `fieldwork`, etc. will continue to work because:
- The trigger update adds NEW transitions without removing existing ones
- Cases already past the social review step are unaffected
- Only NEW cases or cases in `received` status will require the social step

---

## 9. Verification Matrix

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P4A-T01 | app_role enum extended | 8 values (includes social_field_worker) |
| P4A-T02 | RLS policies created | 6+ new policies for social_field_worker |
| P4A-T03 | Social field worker can SELECT subsidy_case in district | Access granted |
| P4A-T04 | Social field worker can UPDATE case in IN_SOCIAL_REVIEW | Update succeeds |
| P4A-T05 | Social field worker cannot UPDATE case in other status | Update blocked by RLS |
| P4A-T06 | Transition received → IN_SOCIAL_REVIEW allowed | Trigger permits |
| P4A-T07 | Transition IN_SOCIAL_REVIEW → SOCIAL_COMPLETED allowed | Trigger permits |
| P4A-T08 | Transition received → screening blocked | Trigger rejects |
| P4A-T09 | Audit event logged for social assessment | audit_event created |
| P4A-T10 | Woningregistratie workflow unchanged | Housing transitions work as before |
| P4A-T11 | Existing Bouwsubsidie roles unaffected | frontdesk_bouwsubsidie works |
| P4A-T12 | Admin notification created on status change | Notification appears |

---

## 10. Audit Event Definitions (Activated)

| Action | Entity Type | Triggered By |
|--------|-------------|--------------|
| SOCIAL_ASSESSMENT_STARTED | subsidy_case | Status → IN_SOCIAL_REVIEW |
| SOCIAL_ASSESSMENT_COMPLETED | subsidy_case | Status → SOCIAL_COMPLETED |
| SOCIAL_ASSESSMENT_RETURNED | subsidy_case | Status → RETURNED_TO_INTAKE |
| SOCIAL_REPORT_CREATED | social_report | Report created |
| SOCIAL_REPORT_UPDATED | social_report | Report updated |

---

## 11. Explicit Constraints

### 11.1 Allowed Actions

| Action | Authorized |
|--------|------------|
| Add social_field_worker to enum | ✅ |
| Update Bouwsubsidie trigger | ✅ |
| Create RLS policies for social_field_worker | ✅ |
| Update TypeScript types | ✅ |
| Add status transitions to UI | ✅ |
| Create audit events | ✅ |

### 11.2 Forbidden Actions

| Action | Status |
|--------|--------|
| Modify Woningregistratie workflow | ❌ FORBIDDEN |
| Activate Technical Inspector | ❌ FORBIDDEN |
| Activate Director | ❌ FORBIDDEN |
| Activate Ministerial Advisor | ❌ FORBIDDEN |
| Modify UI menus/navigation | ❌ FORBIDDEN |
| Create user accounts | ❌ FORBIDDEN |
| Assign roles to users | ❌ FORBIDDEN |

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Enum extension failure | Test in migration, rollback plan ready |
| Trigger update breaks existing cases | Backward-compatible transitions only |
| RLS policy conflicts | Test all role combinations |
| TypeScript type mismatch | Regenerate Supabase types |

---

## 13. Rollback Plan

### 13.1 Database Rollback

```sql
-- Drop RLS policies (if created)
DROP POLICY IF EXISTS "social_field_worker_select_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "social_field_worker_update_subsidy_case" ON public.subsidy_case;
-- ... additional policy drops

-- Revert trigger to V1.1 transition matrix
-- (Re-run original Phase 1 trigger creation)

-- Note: Enum value cannot be removed, but will be inert
```

### 13.2 Application Rollback

1. Revert TypeScript changes (git)
2. Revert status handler changes (git)
3. Redeploy previous version

---

## 14. Deliverables

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | RESTORE_POINT_V1.3_PHASE4A_START.md | Pre-phase restore point |
| 2 | Database migration (enum + trigger + RLS) | Database activation |
| 3 | Updated useUserRole.ts | TypeScript type |
| 4 | Updated useAuditLog.ts | Audit entity type |
| 5 | Updated subsidy-cases/[id]/page.tsx | Status transitions |
| 6 | PHASE-4A-ACTIVATION-REPORT.md | Implementation report |
| 7 | PHASE-4A-VERIFICATION-CHECKLIST.md | Test results |
| 8 | PHASE-4A-RISK-OBSERVATIONS.md | Risk notes |
| 9 | RESTORE_POINT_V1.3_PHASE4A_COMPLETE.md | Post-phase restore point |

---

## 15. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4A_START.md | CREATE | Pre-phase restore point |
| phases/DVH-IMS-V1.3/PHASE-4A/ | CREATE | Phase 4A directory |
| Database migration | EXECUTE | Enum + trigger + RLS |
| src/hooks/useUserRole.ts | MODIFY | Add social_field_worker |
| src/hooks/useAuditLog.ts | MODIFY | Add social_report entity |
| src/app/(admin)/subsidy-cases/[id]/page.tsx | MODIFY | Add new transitions |
| phases/DVH-IMS-V1.3/PHASE-4A/PHASE-4A-ACTIVATION-REPORT.md | CREATE | Documentation |
| phases/DVH-IMS-V1.3/PHASE-4A/PHASE-4A-VERIFICATION-CHECKLIST.md | CREATE | Test results |
| phases/DVH-IMS-V1.3/PHASE-4A/PHASE-4A-RISK-OBSERVATIONS.md | CREATE | Risk notes |
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4A_COMPLETE.md | CREATE | Post-phase restore point |
| phases/DVH-IMS-V1.3/README.md | MODIFY | Add Phase 4A status |

---

## 16. End-of-Phase Checklist

### Implemented

- [ ] Restore Point (Start) created
- [ ] app_role enum extended with social_field_worker
- [ ] Backend trigger updated for new transitions
- [ ] RLS policies created for social_field_worker
- [ ] TypeScript AppRole updated
- [ ] Status transitions added to UI
- [ ] Audit logging enabled

### Explicitly NOT Activated

- [ ] Technical Inspector (NOT activated)
- [ ] Director (NOT activated)
- [ ] Ministerial Advisor (NOT activated)
- [ ] Woningregistratie workflow (NOT changed)
- [ ] UI navigation/menus (NOT changed)

### System Behavior Verification

- [ ] Existing 7 roles functional
- [ ] Woningregistratie workflow unchanged
- [ ] Existing Bouwsubsidie cases processable
- [ ] Audit trail complete

### Activation Ready Statement

- [ ] Phase 4A is COMPLETE
- [ ] Social Field Worker role is ACTIVE for Bouwsubsidie
- [ ] System ready for Phase 4B (next role activation)

---

## 17. Governance Statement

**V1.3 Phase 4A activates ONLY the Social Field Worker role.**

**Scope is strictly limited to Bouwsubsidie service.**

**Woningregistratie remains completely unchanged.**

**No additional roles are activated in this phase.**

**STOP after Phase 4A completion and await authorization for next role.**

---

## 18. Technical Details

### 18.1 Migration SQL Summary

```sql
-- 1. Extend app_role enum
ALTER TYPE public.app_role ADD VALUE 'social_field_worker';

-- 2. Update subsidy_case transition trigger
CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
-- (Updated transition matrix including social review states)

-- 3. Create RLS policies for social_field_worker
CREATE POLICY "social_field_worker_select_subsidy_case" ON public.subsidy_case
FOR SELECT USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('received', 'IN_SOCIAL_REVIEW')
);

-- (Additional policies for UPDATE, related tables, audit, notifications)
```

### 18.2 TypeScript Changes Summary

```typescript
// useUserRole.ts - Add to AppRole type
export type AppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit'
  | 'social_field_worker'  // NEW

// useAuditLog.ts - Add to EntityType
type EntityType = 
  | 'person' 
  | 'household' 
  | ... 
  | 'social_report'  // NEW (if not already present)
```

---

**PHASE 4A — SOCIAL FIELD WORKER ACTIVATION — BOUWSUBSIDIE ONLY**

**Awaiting approval to create Restore Point and begin implementation.**

