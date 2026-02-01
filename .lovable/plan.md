

# DVH-IMS V1.3 — Phase 4C Execution Plan

## Document Type: Phase Scope & Execution Plan
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4C — Administrative Officer Workflow Activation (Bouwsubsidie Only)
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
| V1.3 Phase 4B (Technical Inspector) | CLOSED & LOCKED |
| V1.3 Phase 4C | OPEN — Admin Review Workflow Activation |

**Scope Constraint:** Bouwsubsidie ONLY — Woningregistratie remains UNCHANGED

---

## 2. Critical Clarification

### 2.1 Role Status

The `admin_staff` role **already exists** in the database enum (9 current values) and has active RLS policies. This phase does NOT add a new enum value.

### 2.2 What This Phase Activates

This phase activates the **workflow enforcement** for the Administrative Officer completeness check step by:
1. Adding new status values to the workflow
2. Updating the transition trigger to enforce the admin review step
3. Adding UI status badges and transitions

---

## 3. Current State Analysis

### 3.1 Current app_role Enum (9 Values)

| # | Enum Value | Status |
|---|------------|--------|
| 1 | system_admin | ACTIVE |
| 2 | minister | ACTIVE |
| 3 | project_leader | ACTIVE |
| 4 | frontdesk_bouwsubsidie | ACTIVE |
| 5 | frontdesk_housing | ACTIVE |
| 6 | admin_staff | ACTIVE |
| 7 | audit | ACTIVE |
| 8 | social_field_worker | ACTIVE (Phase 4A) |
| 9 | technical_inspector | ACTIVE (Phase 4B) |

### 3.2 Current Bouwsubsidie Workflow (Post Phase 4B)

```text
received → in_social_review → social_completed → in_technical_review → 
           technical_approved → screening → needs_more_docs/fieldwork → 
           approved_for_council → council_doc_generated → finalized
           (any non-terminal) → rejected
```

### 3.3 Target Workflow (Phase 4C — Admin Review Integration)

```text
received → in_social_review → social_completed → in_technical_review → 
           technical_approved → in_admin_review → admin_complete → 
           screening → needs_more_docs/fieldwork → approved_for_council → 
           council_doc_generated → finalized
           (any non-terminal) → rejected
           in_admin_review → returned_to_technical
```

---

## 4. Phase 4C Objective

Activate the **Administrative Officer completeness check workflow step** for Bouwsubsidie service ONLY, with:
- New status values: `in_admin_review`, `admin_complete`, `returned_to_technical`
- Mandatory completeness check between technical approval and screening
- Full audit logging for admin review actions
- Traceability via correlation_id

---

## 5. Implementation Scope

### 5.1 What Gets Activated

| Item | Action |
|------|--------|
| New status values | `in_admin_review`, `admin_complete`, `returned_to_technical` |
| Backend trigger | UPDATE to enforce admin review step |
| UI status badges | ADD for new statuses |
| UI transitions | UPDATE for admin review workflow |
| Audit events | ENABLE for admin review actions |

### 5.2 What Remains UNCHANGED

| Item | Status |
|------|--------|
| app_role enum | NO CHANGES (admin_staff already exists) |
| Existing admin_staff RLS policies | NO CHANGES (already have access) |
| Woningregistratie workflow | NO CHANGES |
| Housing registration trigger | NO CHANGES |
| UI menus/dropdowns | NO CHANGES |
| Director role | NOT ACTIVATED |
| Ministerial Advisor role | NOT ACTIVATED |
| Social Field Worker logic | PRESERVED |
| Technical Inspector logic | PRESERVED |

---

## 6. Database Changes

### 6.1 No Enum Extension Required

The `admin_staff` role already exists in the `app_role` enum. No enum change needed.

### 6.2 Backend Trigger Update

The `validate_subsidy_case_transition()` function will be updated to:

| From Status | New Allowed Transitions |
|-------------|-------------------------|
| technical_approved | in_admin_review, rejected |
| **in_admin_review** | admin_complete, returned_to_technical, rejected |
| **returned_to_technical** | in_technical_review, rejected |
| **admin_complete** | screening, rejected |

**Key Change:** `technical_approved → screening` is NO LONGER ALLOWED. Cases must go through `in_admin_review`.

### 6.3 No New RLS Policies Required

The existing `admin_staff` role policies already provide:
- SELECT access to `subsidy_case` (district-scoped)
- UPDATE access to `subsidy_case` (district-scoped)
- Access to related tables (person, household, documents)

The new statuses (`in_admin_review`, `admin_complete`) will be accessible through existing policies.

---

## 7. Application Changes

### 7.1 TypeScript Updates

| File | Change |
|------|--------|
| src/hooks/useAuditLog.ts | Add `ADMIN_REVIEW_STARTED`, `ADMIN_REVIEW_COMPLETED`, `ADMIN_REVIEW_RETURNED` actions |

### 7.2 UI Updates (Subsidy Case Detail Page)

| Component | Change |
|-----------|--------|
| STATUS_BADGES | Add `in_admin_review`, `admin_complete`, `returned_to_technical` |
| STATUS_TRANSITIONS | Update to include admin review states |

---

## 8. Implementation Steps

### Step 4C-1: Create Restore Point
Create `RESTORE_POINT_V1.3_PHASE4C_START.md` before any implementation.

### Step 4C-2: Database Migration
Execute migration to:
1. Update `validate_subsidy_case_transition()` function with admin review states
2. No RLS policy changes needed

### Step 4C-3: TypeScript Updates
1. Update `AuditAction` type in `useAuditLog.ts` (add admin review actions)

### Step 4C-4: Status Handler Updates
1. Add new status badges to `STATUS_BADGES` constant
2. Update `STATUS_TRANSITIONS` to include admin review paths
3. Modify `technical_approved → screening` to `technical_approved → in_admin_review`

### Step 4C-5: Verification Testing
Execute verification tests (see Section 10).

### Step 4C-6: Documentation
Create Phase 4C artifacts under `phases/DVH-IMS-V1.3/PHASE-4C/`.

### Step 4C-7: Create Completion Restore Point
Create `RESTORE_POINT_V1.3_PHASE4C_COMPLETE.md`.

---

## 9. Transition Matrix Update (Bouwsubsidie)

### 9.1 Updated State Machine (Post Phase 4C)

| From Status | Allowed Transitions |
|-------------|---------------------|
| received | in_social_review, screening, rejected |
| in_social_review | social_completed, returned_to_intake, rejected |
| returned_to_intake | in_social_review, rejected |
| social_completed | in_technical_review, rejected |
| in_technical_review | technical_approved, returned_to_social, rejected |
| returned_to_social | in_social_review, rejected |
| technical_approved | **in_admin_review**, rejected |
| **in_admin_review** | admin_complete, returned_to_technical, rejected |
| **returned_to_technical** | in_technical_review, rejected |
| **admin_complete** | screening, rejected |
| screening | needs_more_docs, fieldwork, rejected |
| needs_more_docs | screening, rejected |
| fieldwork | approved_for_council, rejected |
| approved_for_council | council_doc_generated, rejected |
| council_doc_generated | finalized, rejected |
| finalized | (terminal) |
| rejected | (terminal) |

### 9.2 Backward Compatibility

- Cases already in `screening` or later: **Unaffected**
- Cases in `technical_approved`: **Must proceed to in_admin_review**
- Existing admin_staff permissions: **Already sufficient for new workflow**

---

## 10. Verification Matrix

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P4C-T01 | app_role enum unchanged | 9 values (same as Phase 4B) |
| P4C-T02 | Transition technical_approved → in_admin_review allowed | Trigger permits |
| P4C-T03 | Transition in_admin_review → admin_complete allowed | Trigger permits |
| P4C-T04 | Transition technical_approved → screening blocked | Trigger rejects |
| P4C-T05 | admin_staff can SELECT case in in_admin_review | Access granted |
| P4C-T06 | admin_staff can UPDATE case in in_admin_review | Update succeeds |
| P4C-T07 | Audit event logged for admin review | audit_event created |
| P4C-T08 | Woningregistratie workflow unchanged | Housing transitions work as before |
| P4C-T09 | Technical Inspector role unaffected | Phase 4B transitions still work |
| P4C-T10 | Social Field Worker role unaffected | Phase 4A transitions still work |
| P4C-T11 | Admin notification created on status change | Notification appears |
| P4C-T12 | Return path in_admin_review → returned_to_technical works | Trigger permits |

---

## 11. Audit Event Definitions (Activated)

| Action | Entity Type | Triggered By |
|--------|-------------|--------------|
| ADMIN_REVIEW_STARTED | subsidy_case | Status → in_admin_review |
| ADMIN_REVIEW_COMPLETED | subsidy_case | Status → admin_complete |
| ADMIN_REVIEW_RETURNED | subsidy_case | Status → returned_to_technical |

---

## 12. Explicit Constraints

### 12.1 Allowed Actions

| Action | Authorized |
|--------|------------|
| Update Bouwsubsidie trigger | ALLOWED |
| Add new status values to workflow | ALLOWED |
| Update TypeScript audit types | ALLOWED |
| Add status transitions to UI | ALLOWED |
| Create audit events | ALLOWED |

### 12.2 Forbidden Actions

| Action | Status |
|--------|--------|
| Modify app_role enum | FORBIDDEN (not needed) |
| Add RLS policies | FORBIDDEN (existing policies sufficient) |
| Modify Woningregistratie workflow | FORBIDDEN |
| Activate Director | FORBIDDEN |
| Activate Ministerial Advisor | FORBIDDEN |
| Modify UI menus/navigation | FORBIDDEN |
| Create user accounts | FORBIDDEN |
| Assign roles to users | FORBIDDEN |
| Modify Social Field Worker logic | FORBIDDEN |
| Modify Technical Inspector logic | FORBIDDEN |

---

## 13. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Trigger update breaks existing cases | Backward-compatible transitions only |
| Cases stuck in technical_approved | UI will show path to in_admin_review |
| Existing RLS policies don't cover new statuses | Policies are status-agnostic for admin_staff |

---

## 14. Rollback Plan

### 14.1 Database Rollback

```sql
-- Revert trigger to Phase 4B transition matrix
-- (Re-run Phase 4B trigger creation)
```

### 14.2 Application Rollback

1. Revert TypeScript changes (git)
2. Revert status handler changes (git)
3. Redeploy previous version

---

## 15. Deliverables

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | RESTORE_POINT_V1.3_PHASE4C_START.md | Pre-phase restore point |
| 2 | Database migration (trigger only) | Workflow activation |
| 3 | Updated useAuditLog.ts | Audit actions |
| 4 | Updated subsidy-cases/[id]/page.tsx | Status transitions |
| 5 | PHASE-4C-ACTIVATION-REPORT.md | Implementation report |
| 6 | PHASE-4C-VERIFICATION-CHECKLIST.md | Test results |
| 7 | PHASE-4C-RISK-OBSERVATIONS.md | Risk notes |
| 8 | RESTORE_POINT_V1.3_PHASE4C_COMPLETE.md | Post-phase restore point |

---

## 16. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4C_START.md | CREATE | Pre-phase restore point |
| phases/DVH-IMS-V1.3/PHASE-4C/ | CREATE | Phase 4C directory |
| Database migration | EXECUTE | Trigger update only |
| src/hooks/useAuditLog.ts | MODIFY | Add admin review audit actions |
| src/app/(admin)/subsidy-cases/[id]/page.tsx | MODIFY | Add new transitions |
| phases/DVH-IMS-V1.3/PHASE-4C/PHASE-4C-ACTIVATION-REPORT.md | CREATE | Documentation |
| phases/DVH-IMS-V1.3/PHASE-4C/PHASE-4C-VERIFICATION-CHECKLIST.md | CREATE | Test results |
| phases/DVH-IMS-V1.3/PHASE-4C/PHASE-4C-RISK-OBSERVATIONS.md | CREATE | Risk notes |
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4C_COMPLETE.md | CREATE | Post-phase restore point |
| phases/DVH-IMS-V1.3/README.md | MODIFY | Add Phase 4C status |

---

## 17. End-of-Phase Checklist

### Implemented

- [ ] Restore Point (Start) created
- [ ] Backend trigger updated for admin review states
- [ ] AuditAction types updated
- [ ] Status transitions added to UI
- [ ] Status badges added to UI
- [ ] Audit logging enabled

### Explicitly NOT Activated

- [ ] app_role enum (NOT changed - admin_staff already exists)
- [ ] RLS policies (NOT added - existing policies sufficient)
- [ ] Director (NOT activated)
- [ ] Ministerial Advisor (NOT activated)
- [ ] Woningregistratie workflow (NOT changed)
- [ ] UI navigation/menus (NOT changed)

### System Behavior Verification

- [ ] All 9 existing roles functional
- [ ] Technical Inspector role preserved
- [ ] Social Field Worker role preserved
- [ ] Woningregistratie workflow unchanged
- [ ] Existing Bouwsubsidie cases processable
- [ ] Audit trail complete

### Activation Ready Statement

- [ ] Phase 4C is COMPLETE
- [ ] Administrative Officer workflow is ACTIVE for Bouwsubsidie
- [ ] System ready for Phase 4D (Director activation, if authorized)

---

## 18. Governance Statement

**V1.3 Phase 4C activates the Administrative Officer workflow step (NOT the role - it already exists).**

**Scope is strictly limited to Bouwsubsidie service.**

**Woningregistratie remains completely unchanged.**

**Technical Inspector activation (Phase 4B) is preserved.**

**Social Field Worker activation (Phase 4A) is preserved.**

**No additional roles are activated in this phase.**

**STOP after Phase 4C completion and await authorization for next role.**

---

## 19. Technical Summary

### 19.1 Key Database Changes

1. **No Enum Extension:** `admin_staff` already exists
2. **Trigger Update:** Enforce mandatory admin review step after technical approval
3. **No RLS Policies:** Existing admin_staff policies are sufficient

### 19.2 Key Application Changes

1. **Audit Actions:** Add `ADMIN_REVIEW_STARTED`, `ADMIN_REVIEW_COMPLETED`, `ADMIN_REVIEW_RETURNED`
2. **UI Status Badges:** Add `in_admin_review`, `admin_complete`, `returned_to_technical`
3. **UI Transitions:** Update `technical_approved` to transition to `in_admin_review`

### 19.3 Workflow Path Change

```text
BEFORE (Phase 4B):
  technical_approved → screening

AFTER (Phase 4C):
  technical_approved → in_admin_review → admin_complete → screening
```

---

**PHASE 4C — ADMINISTRATIVE OFFICER WORKFLOW ACTIVATION — BOUWSUBSIDIE ONLY**

**Awaiting approval to create Restore Point and begin implementation.**

