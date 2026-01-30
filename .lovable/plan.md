

# DVH-IMS V1.3 — Phase 4B Execution Plan

## Document Type: Phase Scope & Execution Plan
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4B — Technical Inspector Activation (Bouwsubsidie Only)
## Authorization: Controlled Sequential Activation Path

---

## 1. Authorization Context

| Item | Status |
|------|--------|
| DVH-IMS V1.1 | OPERATIONAL (LIVE) |
| DVH-IMS V1.2 | CLOSED (Documentation Only) |
| V1.3 Phase 1 (D-01 + D-02) | CLOSED & LOCKED |
| V1.3 Phase 2 (S-03) | CLOSED & LOCKED |
| V1.3 Phase 3 (Preparation) | CLOSED & LOCKED |
| V1.3 Phase 4A (Social Field Worker) | CLOSED & LOCKED |
| V1.3 Phase 4B | OPEN — Technical Inspector Activation |

**Scope Constraint:** Bouwsubsidie ONLY — Woningregistratie remains UNCHANGED

---

## 2. Current State Analysis

### 2.1 Current app_role Enum (8 Values)

| Enum Value | Status |
|------------|--------|
| system_admin | ACTIVE |
| minister | ACTIVE |
| project_leader | ACTIVE |
| frontdesk_bouwsubsidie | ACTIVE |
| frontdesk_housing | ACTIVE |
| admin_staff | ACTIVE |
| audit | ACTIVE |
| social_field_worker | ACTIVE (Phase 4A) |

### 2.2 Current Bouwsubsidie Workflow (Post Phase 4A)

```text
received → in_social_review → social_completed → screening → 
           needs_more_docs/fieldwork → approved_for_council → 
           council_doc_generated → finalized
           (any non-terminal) → rejected
```

### 2.3 Target Workflow (Phase 4B — Technical Inspector Integration)

```text
received → in_social_review → social_completed → in_technical_review → 
           technical_approved → screening → needs_more_docs/fieldwork → 
           approved_for_council → council_doc_generated → finalized
           (any non-terminal) → rejected
           in_technical_review → returned_to_social
```

---

## 3. Phase 4B Objective

Activate the **Technical Inspector** role for Bouwsubsidie service ONLY, with:
- RBAC enforcement at database level
- Dossier state transition constraints (mandatory technical inspection after social completion)
- Full audit logging for technical inspection actions
- Traceability via correlation_id

---

## 4. Implementation Scope

### 4.1 What Gets Activated

| Item | Action |
|------|--------|
| `technical_inspector` enum value | ADD to app_role |
| Technical Inspector RLS policies | CREATE (Bouwsubsidie only, 10+ policies) |
| New status values | `in_technical_review`, `technical_approved`, `returned_to_social` |
| Backend trigger | UPDATE to enforce technical step |
| TypeScript AppRole | UPDATE to include new role |
| Audit events | ENABLE for technical_inspector actions |

### 4.2 What Remains UNCHANGED

| Item | Status |
|------|--------|
| Woningregistratie workflow | NO CHANGES |
| Housing registration trigger | NO CHANGES |
| UI menus/dropdowns | NO CHANGES |
| Existing 8 roles | UNCHANGED permissions |
| Director role | NOT ACTIVATED |
| Ministerial Advisor role | NOT ACTIVATED |
| Social Field Worker logic | PRESERVED |

---

## 5. Database Changes

### 5.1 Enum Extension

```sql
-- Add technical_inspector to app_role enum
ALTER TYPE public.app_role ADD VALUE 'technical_inspector';
```

### 5.2 Backend Trigger Update

The `validate_subsidy_case_transition()` function will be updated to:

| From Status | Allowed Transitions |
|-------------|---------------------|
| social_completed | in_technical_review, rejected |
| in_technical_review | technical_approved, returned_to_social, rejected |
| returned_to_social | in_social_review, rejected |
| technical_approved | screening, rejected |

**Note:** The transition `social_completed → screening` will be REMOVED to enforce mandatory technical inspection.

### 5.3 RLS Policy Creation (10 Policies)

| # | Policy Name | Table | Operation |
|---|-------------|-------|-----------|
| 1 | technical_inspector_select_subsidy_case | subsidy_case | SELECT |
| 2 | technical_inspector_update_subsidy_case | subsidy_case | UPDATE |
| 3 | technical_inspector_select_person | person | SELECT |
| 4 | technical_inspector_select_household | household | SELECT |
| 5 | technical_inspector_select_technical_report | technical_report | SELECT |
| 6 | technical_inspector_insert_technical_report | technical_report | INSERT |
| 7 | technical_inspector_update_technical_report | technical_report | UPDATE |
| 8 | technical_inspector_insert_audit_event | audit_event | INSERT |
| 9 | technical_inspector_select_admin_notification | admin_notification | SELECT |
| 10 | technical_inspector_update_admin_notification | admin_notification | UPDATE |
| 11 | technical_inspector_insert_subsidy_status_history | subsidy_case_status_history | INSERT |
| 12 | technical_inspector_select_subsidy_status_history | subsidy_case_status_history | SELECT |

---

## 6. Application Changes

### 6.1 TypeScript Updates

| File | Change |
|------|--------|
| src/hooks/useUserRole.ts | Add 'technical_inspector' to AppRole type |
| src/hooks/useAuditLog.ts | Add technical inspection audit actions |

### 6.2 UI Updates (Subsidy Case Detail Page)

| Component | Change |
|-----------|--------|
| STATUS_BADGES | Add in_technical_review, technical_approved, returned_to_social |
| STATUS_TRANSITIONS | Update to include new technical review states |

---

## 7. Implementation Steps

### Step 4B-1: Create Restore Point
Create `RESTORE_POINT_V1.3_PHASE4B_START.md` before any implementation.

### Step 4B-2: Database Migration
Execute migration to:
1. Add `technical_inspector` to `app_role` enum
2. Update `validate_subsidy_case_transition()` function with new states
3. Create 12 RLS policies for technical_inspector

### Step 4B-3: TypeScript Updates
1. Update `AppRole` type in `useUserRole.ts`
2. Update `AuditAction` type in `useAuditLog.ts` (add TECHNICAL_INSPECTION_STARTED, etc.)

### Step 4B-4: Status Handler Updates
1. Add new status badges to `STATUS_BADGES` constant
2. Update `STATUS_TRANSITIONS` to include technical review paths
3. Modify `social_completed → screening` to `social_completed → in_technical_review`

### Step 4B-5: Verification Testing
Execute verification tests (see Section 9).

### Step 4B-6: Documentation
Create Phase 4B artifacts under `phases/DVH-IMS-V1.3/PHASE-4B/`.

### Step 4B-7: Create Completion Restore Point
Create `RESTORE_POINT_V1.3_PHASE4B_COMPLETE.md`.

---

## 8. Transition Matrix Update (Bouwsubsidie)

### 8.1 Updated State Machine (Post Phase 4B)

| From Status | Allowed Transitions |
|-------------|---------------------|
| received | in_social_review, screening, rejected |
| in_social_review | social_completed, returned_to_intake, rejected |
| returned_to_intake | in_social_review, rejected |
| social_completed | in_technical_review, rejected |
| **in_technical_review** | technical_approved, returned_to_social, rejected |
| **returned_to_social** | in_social_review, rejected |
| **technical_approved** | screening, rejected |
| screening | needs_more_docs, fieldwork, rejected |
| needs_more_docs | screening, rejected |
| fieldwork | approved_for_council, rejected |
| approved_for_council | council_doc_generated, rejected |
| council_doc_generated | finalized, rejected |
| finalized | (terminal) |
| rejected | (terminal) |

### 8.2 Backward Compatibility

Cases in `social_completed` status will require technical review before proceeding.
Cases already in `screening` or later statuses are unaffected.

---

## 9. Verification Matrix

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P4B-T01 | app_role enum extended | 9 values (includes technical_inspector) |
| P4B-T02 | RLS policies created | 12 new policies for technical_inspector |
| P4B-T03 | Technical inspector can SELECT subsidy_case in district | Access granted |
| P4B-T04 | Technical inspector can UPDATE case in in_technical_review | Update succeeds |
| P4B-T05 | Technical inspector cannot UPDATE case in other status | Update blocked by RLS |
| P4B-T06 | Transition social_completed → in_technical_review allowed | Trigger permits |
| P4B-T07 | Transition in_technical_review → technical_approved allowed | Trigger permits |
| P4B-T08 | Transition social_completed → screening blocked | Trigger rejects |
| P4B-T09 | Audit event logged for technical inspection | audit_event created |
| P4B-T10 | Woningregistratie workflow unchanged | Housing transitions work as before |
| P4B-T11 | Social Field Worker role unaffected | Phase 4A transitions still work |
| P4B-T12 | Admin notification created on status change | Notification appears |

---

## 10. Audit Event Definitions (Activated)

| Action | Entity Type | Triggered By |
|--------|-------------|--------------|
| TECHNICAL_INSPECTION_STARTED | subsidy_case | Status → in_technical_review |
| TECHNICAL_INSPECTION_COMPLETED | subsidy_case | Status → technical_approved |
| TECHNICAL_INSPECTION_RETURNED | subsidy_case | Status → returned_to_social |
| TECHNICAL_REPORT_CREATED | technical_report | Report created |
| TECHNICAL_REPORT_UPDATED | technical_report | Report updated |

---

## 11. Explicit Constraints

### 11.1 Allowed Actions

| Action | Authorized |
|--------|------------|
| Add technical_inspector to enum | ALLOWED |
| Update Bouwsubsidie trigger | ALLOWED |
| Create RLS policies for technical_inspector | ALLOWED |
| Update TypeScript types | ALLOWED |
| Add status transitions to UI | ALLOWED |
| Create audit events | ALLOWED |

### 11.2 Forbidden Actions

| Action | Status |
|--------|--------|
| Modify Woningregistratie workflow | FORBIDDEN |
| Activate Director | FORBIDDEN |
| Activate Ministerial Advisor | FORBIDDEN |
| Modify UI menus/navigation | FORBIDDEN |
| Create user accounts | FORBIDDEN |
| Assign roles to users | FORBIDDEN |
| Modify Social Field Worker logic | FORBIDDEN |

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Enum extension failure | Test in migration, rollback plan ready |
| Trigger update breaks existing cases | Backward-compatible transitions only |
| Cases stuck in social_completed | UI will show path to in_technical_review |
| RLS policy conflicts | Test all role combinations |

---

## 13. Rollback Plan

### 13.1 Database Rollback

```sql
-- Drop RLS policies (if created)
DROP POLICY IF EXISTS "technical_inspector_select_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "technical_inspector_update_subsidy_case" ON public.subsidy_case;
-- ... additional policy drops

-- Revert trigger to Phase 4A transition matrix
-- (Re-run Phase 4A trigger creation)

-- Note: Enum value cannot be removed, but will be inert
```

---

## 14. Deliverables

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | RESTORE_POINT_V1.3_PHASE4B_START.md | Pre-phase restore point |
| 2 | Database migration (enum + trigger + RLS) | Database activation |
| 3 | Updated useUserRole.ts | TypeScript type |
| 4 | Updated useAuditLog.ts | Audit actions |
| 5 | Updated subsidy-cases/[id]/page.tsx | Status transitions |
| 6 | PHASE-4B-ACTIVATION-REPORT.md | Implementation report |
| 7 | PHASE-4B-VERIFICATION-CHECKLIST.md | Test results |
| 8 | PHASE-4B-RISK-OBSERVATIONS.md | Risk notes |
| 9 | RESTORE_POINT_V1.3_PHASE4B_COMPLETE.md | Post-phase restore point |

---

## 15. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4B_START.md | CREATE | Pre-phase restore point |
| phases/DVH-IMS-V1.3/PHASE-4B/ | CREATE | Phase 4B directory |
| Database migration | EXECUTE | Enum + trigger + RLS |
| src/hooks/useUserRole.ts | MODIFY | Add technical_inspector |
| src/hooks/useAuditLog.ts | MODIFY | Add technical audit actions |
| src/app/(admin)/subsidy-cases/[id]/page.tsx | MODIFY | Add new transitions |
| phases/DVH-IMS-V1.3/PHASE-4B/PHASE-4B-ACTIVATION-REPORT.md | CREATE | Documentation |
| phases/DVH-IMS-V1.3/PHASE-4B/PHASE-4B-VERIFICATION-CHECKLIST.md | CREATE | Test results |
| phases/DVH-IMS-V1.3/PHASE-4B/PHASE-4B-RISK-OBSERVATIONS.md | CREATE | Risk notes |
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4B_COMPLETE.md | CREATE | Post-phase restore point |
| phases/DVH-IMS-V1.3/README.md | MODIFY | Add Phase 4B status |

---

## 16. End-of-Phase Checklist

### Implemented

- [ ] Restore Point (Start) created
- [ ] app_role enum extended with technical_inspector
- [ ] Backend trigger updated for new transitions
- [ ] RLS policies created for technical_inspector (12 policies)
- [ ] TypeScript AppRole updated
- [ ] AuditAction types updated
- [ ] Status transitions added to UI
- [ ] Audit logging enabled

### Explicitly NOT Activated

- [ ] Director (NOT activated)
- [ ] Ministerial Advisor (NOT activated)
- [ ] Woningregistratie workflow (NOT changed)
- [ ] UI navigation/menus (NOT changed)

### System Behavior Verification

- [ ] All 8 existing roles functional
- [ ] Social Field Worker role preserved
- [ ] Woningregistratie workflow unchanged
- [ ] Existing Bouwsubsidie cases processable
- [ ] Audit trail complete

### Activation Ready Statement

- [ ] Phase 4B is COMPLETE
- [ ] Technical Inspector role is ACTIVE for Bouwsubsidie
- [ ] System ready for Phase 4C (Director activation, if authorized)

---

## 17. Governance Statement

**V1.3 Phase 4B activates ONLY the Technical Inspector role.**

**Scope is strictly limited to Bouwsubsidie service.**

**Woningregistratie remains completely unchanged.**

**Social Field Worker activation (Phase 4A) is preserved.**

**No additional roles are activated in this phase.**

**STOP after Phase 4B completion and await authorization for next role.**

---

## 18. Technical Summary

### 18.1 Key Database Changes

1. **Enum Extension:** Add `technical_inspector` (9th enum value)
2. **Trigger Update:** Enforce mandatory technical step after social completion
3. **RLS Policies:** 12 district-scoped policies for Bouwsubsidie access

### 18.2 Key Application Changes

1. **TypeScript:** Add `technical_inspector` to `AppRole` type
2. **Audit Actions:** Add `TECHNICAL_INSPECTION_STARTED`, `TECHNICAL_INSPECTION_COMPLETED`, `TECHNICAL_INSPECTION_RETURNED`
3. **UI Status Badges:** Add `in_technical_review`, `technical_approved`, `returned_to_social`
4. **UI Transitions:** Update `social_completed` to transition to `in_technical_review`

---

**PHASE 4B — TECHNICAL INSPECTOR ACTIVATION — BOUWSUBSIDIE ONLY**

**Awaiting approval to create Restore Point and begin implementation.**

