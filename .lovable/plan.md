
# DVH-IMS V1.2 — Phase 4 Planning Pack

## Operational Workflows & Data Integrity

**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** 4 — Operational Workflows & Data Integrity  
**Status:** PLANNING

---

## 1. Executive Summary

Phase 4 focuses on validating operational readiness of all DVH-IMS workflows with real data, ensuring all state transitions are properly enforced, audited, and role-gated.

**Key Objectives:**
- End-to-end workflow execution validation (no demo paths)
- State transition enforcement at UI + backend level
- Complete audit trail coverage
- Role-based action enforcement verification
- Darkone UI consistency for all workflow actions

---

## 2. Scope Definition

### 2.1 In Scope

| Item | Description | Deliverable |
|------|-------------|-------------|
| Workflow Execution Validation | Validate all status flows execute correctly | Workflow Test Report |
| Transition Enforcement | Verify UI + backend alignment | Enforcement Gap Analysis |
| Audit Completeness | Verify all actions logged with actor_role | Audit Coverage Matrix |
| RBAC Verification | Validate role-based access at all points | RBAC Verification Report |
| UI Consistency | Check Darkone compliance for workflows | UI Compliance Checklist |

### 2.2 Explicit Out of Scope

| Item | Reason |
|------|--------|
| Schema changes | Requires explicit authorization |
| New roles | Governance constraint |
| Demo data / routes | Explicit exclusion |
| Public Wizard changes | Implemented, frozen |
| /docs edits | Read-only |

---

## 3. Current State Analysis

### 3.1 Workflow Status Flows (From Phase 2)

**Bouwsubsidie (Construction Subsidy):**
```
received → screening → needs_more_docs → fieldwork → approved_for_council → council_doc_generated → finalized
                     ↘ rejected
```

**Woning Registratie (Housing Registration):**
```
received → under_review → urgency_assessed → waiting_list → matched → allocated → finalized
                                                                   ↘ rejected
```

### 3.2 Transition Enforcement Analysis

| Module | UI Enforcement | Backend Enforcement | Gap |
|--------|----------------|---------------------|-----|
| Bouwsubsidie | STATUS_TRANSITIONS constant | RLS allows UPDATE by role | UI-only validation |
| Housing Registration | STATUS_TRANSITIONS constant | RLS allows UPDATE by role | UI-only validation |
| Allocation Runs | N/A (Edge Function) | RBAC in Edge Function | Fully enforced |

### 3.3 Audit Coverage Analysis (From Database)

| Action | Entity Type | Actor Role | Count | Status |
|--------|-------------|------------|-------|--------|
| status_lookup | public_status_access | public | 8 | ✅ Logged |
| public_submission | subsidy_case | public | 7 | ✅ Logged |
| public_submission | housing_registration | public | 6 | ✅ Logged |
| CREATE | allocation_run | system_admin | 2 | ✅ Logged |
| CREATE | person | NULL (legacy) | 1 | ⚠️ Pre-fix |
| UPDATE | person | NULL (legacy) | 1 | ⚠️ Pre-fix |

### 3.4 Role-Based Access Control

**Current Roles (app_role enum):**
- system_admin
- minister
- project_leader
- frontdesk_bouwsubsidie
- frontdesk_housing
- admin_staff
- audit

**Role Verification Points:**
1. Route access (AdminLayout + page-level ALLOWED_ROLES)
2. RLS policies (database level)
3. Edge Function RBAC (explicit role check)
4. UI component visibility (useUserRole hook)

---

## 4. Phase 4 Verification Activities

### 4.1 End-to-End Workflow Validation

**Test Matrix for Bouwsubsidie:**

| Test Case | Start State | End State | Role | Expected Result |
|-----------|-------------|-----------|------|-----------------|
| T1.1 | received | screening | frontdesk_bouwsubsidie | Success + Audit |
| T1.2 | screening | fieldwork | frontdesk_bouwsubsidie | Success + Audit |
| T1.3 | fieldwork | approved_for_council | project_leader | Success + Audit |
| T1.4 | approved_for_council | council_doc_generated | (Edge Function) | Success + Audit |
| T1.5 | council_doc_generated | finalized | minister | Success + Audit |
| T1.6 | Any | rejected | Any authorized | Success + Audit |
| T1.7 | finalized | Any | Any | Blocked (terminal) |

**Test Matrix for Housing Registration:**

| Test Case | Start State | End State | Role | Expected Result |
|-----------|-------------|-----------|------|-----------------|
| T2.1 | received | under_review | frontdesk_housing | Success + Audit |
| T2.2 | under_review | urgency_assessed | frontdesk_housing | Success + Audit |
| T2.3 | urgency_assessed | waiting_list | admin_staff | Success + Audit |
| T2.4 | waiting_list | matched | (Edge Function) | Success + Audit |
| T2.5 | matched | allocated | frontdesk_housing | Success + Audit |
| T2.6 | allocated | finalized | frontdesk_housing | Success + Audit |
| T2.7 | Any | rejected | Any authorized | Success + Audit |

### 4.2 Backend Enforcement Gap Analysis

**Current Gap:** Status transitions are enforced only at UI level via `STATUS_TRANSITIONS` constant. The RLS policies allow any authorized role to UPDATE the status column without validating the transition path.

**Risk Assessment:**
- Direct API calls could bypass UI validation
- Risk: Invalid state transitions possible via direct Supabase client

**Mitigation Options (Documentation Only):**
1. Database trigger for transition validation (requires schema change)
2. Edge Function wrapper for status changes (requires new function)
3. Accept UI-only enforcement with audit monitoring

**Recommendation:** Document gap and defer to Phase 5/6 for implementation decision.

### 4.3 Audit Completeness Verification

**Capture Points to Verify:**

| Component | Entity | Action | Actor Role Capture |
|-----------|--------|--------|-------------------|
| PersonFormModal | person | CREATE/UPDATE | ✅ From user_roles (Phase 2 fix) |
| HouseholdFormModal | household | CREATE | ✅ From user_roles |
| CaseFormModal | subsidy_case | CREATE | ✅ From user_roles |
| RegistrationFormModal | housing_registration | CREATE | ✅ From user_roles |
| subsidy-cases/[id]/page | subsidy_case | STATUS_CHANGE | ✅ From user_roles |
| housing-registrations/[id]/page | housing_registration | STATUS_CHANGE | ✅ From user_roles |
| DecisionFormModal | allocation_decision | CREATE | ✅ From user_roles |
| AssignmentFormModal | assignment_record | CREATE | ✅ From user_roles |
| UrgencyAssessmentForm | housing_urgency | CREATE | ✅ From user_roles |
| QuotaTable | district_quota | CREATE/UPDATE | ✅ From user_roles |
| RunExecutorModal | allocation_run | CREATE | ✅ From user_roles |
| Edge: execute-allocation-run | allocation_run | CREATE | ✅ Direct insert |
| Edge: generate-raadvoorstel | generated_document | document_generated | ✅ Direct insert |
| Edge: submit-bouwsubsidie | subsidy_case | public_submission | ✅ Direct insert |
| Edge: submit-housing-registration | housing_registration | public_submission | ✅ Direct insert |

### 4.4 Role-Based Action Enforcement

**Verification Checklist:**

| Action | Enforcement Layer | Roles Allowed | Verification Method |
|--------|-------------------|---------------|---------------------|
| View Dashboard | Route + RLS | All authenticated | Login as each role |
| View Subsidy Cases | Route + RLS | frontdesk_bouwsubsidie, admin_staff, national | Query test |
| Create Subsidy Case | RLS | frontdesk_bouwsubsidie, admin_staff (district), system_admin, project_leader | Insert test |
| Change Subsidy Status | RLS | frontdesk_bouwsubsidie, admin_staff (district), national | Update test |
| View Housing Registrations | Route + RLS | frontdesk_housing, admin_staff, national | Query test |
| Execute Allocation Run | Edge + RLS | system_admin, project_leader | Edge Function call |
| View Audit Log | Route + RLS | audit, system_admin, minister, project_leader | Query test |
| Generate Raadvoorstel | Edge + RLS | frontdesk_bouwsubsidie, admin_staff (district) | Edge Function call |

### 4.5 UI Consistency Check (Darkone)

**Components to Verify:**

| Component | Location | Darkone Compliance |
|-----------|----------|-------------------|
| Status Badge | Case/Registration detail | ✅ Bootstrap badges |
| Transition Buttons | Change Status card | ✅ Bootstrap buttons |
| Form Modal | All create/edit modals | ✅ Bootstrap modal |
| Tables | List pages | ✅ Bootstrap table |
| Tabs | Detail pages | ✅ Bootstrap tabs |
| Alerts/Toasts | Notifications | ✅ react-toastify |

---

## 5. Execution Plan

### Step 1: Create Restore Point
- Create `RESTORE_POINT_V1.2_PHASE4_WORKFLOWS_START.md`
- Record current state baseline

### Step 2: Database Verification
- Query audit_event for coverage
- Verify RLS policies active
- Check transition data exists

### Step 3: Workflow Path Validation
- Document all valid transition paths
- Verify terminal states block further changes
- Confirm audit events generated

### Step 4: RBAC Verification
- Test each role's access boundaries
- Verify district isolation
- Confirm audit role read-only

### Step 5: Gap Documentation
- Document backend enforcement gap
- Document any missing audit points
- Propose remediation for future phases

### Step 6: Final Report
- Generate Phase 4 Verification Report
- Create closure statement
- Update README

---

## 6. Deliverables

| Document | Location | Status |
|----------|----------|--------|
| RESTORE_POINT_V1.2_PHASE4_WORKFLOWS_START.md | `/restore-points/v1.2/` | Pending |
| Phase 4 Planning Pack | `/phases/DVH-IMS-V1.2/` | This document |
| Workflow Validation Report | `/phases/DVH-IMS-V1.2/` | Pending |
| RBAC Verification Report | `/phases/DVH-IMS-V1.2/` | Pending |
| Phase 4 Closure Statement | `/phases/DVH-IMS-V1.2/` | Pending |

---

## 7. Governance Compliance

| Rule | Status |
|------|--------|
| No schema changes | ✅ Compliant (verification only) |
| No new roles | ✅ Compliant |
| No demo data | ✅ Compliant (real data only) |
| No /docs edits | ✅ Compliant (read-only) |
| Darkone compliance | ✅ Verification only |

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend enforcement gap | Known | Medium | Document + defer |
| Missing audit coverage | Low | Medium | Verification will identify |
| RBAC bypass found | Low | High | STOP + REPORT |
| UI inconsistency | Low | Low | Document for future |

---

## 9. Technical Scope

### Files to Read (Verification Only)

| File | Purpose |
|------|---------|
| `subsidy-cases/[id]/page.tsx` | Workflow transitions |
| `housing-registrations/[id]/page.tsx` | Workflow transitions |
| `useAuditLog.ts` | Audit capture |
| `useUserRole.ts` | RBAC implementation |
| All form modals | Audit event calls |
| All Edge Functions | Backend enforcement |

### Database Queries (Read Only)

```sql
-- Audit coverage by action
SELECT action, entity_type, actor_role, COUNT(*) 
FROM audit_event 
GROUP BY action, entity_type, actor_role;

-- Status distribution (if data exists)
SELECT status, COUNT(*) FROM subsidy_case GROUP BY status;
SELECT current_status, COUNT(*) FROM housing_registration GROUP BY current_status;
```

---

## 10. Authorization Request

This Planning Pack defines Phase 4 scope, objectives, and verification approach.

**Awaiting explicit approval to:**
1. Create Phase 4 START restore point
2. Execute verification activities (database queries + code review)
3. Generate Phase 4 completion documentation

**No implementation or code changes will occur unless explicitly authorized.**

---

## 11. End-of-Task Report Format

At completion, report will include:

```
IMPLEMENTED:
- Items fully verified and documented

PARTIAL:
- Items with gaps requiring future work

SKIPPED:
- Items not applicable or blocked

VERIFICATION:
- All verification activities performed

RESTORE POINT:
- Reference to created restore point

BLOCKERS / ERRORS:
- NONE (if clean) or explicit description
```

---

*Document Author: DVH-IMS System*  
*Planning Date: 2026-01-30*  
*Authority: Awaiting Client Approval*
