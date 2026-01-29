
# DVH-IMS V1.2 — Phase 2 Planning: Workflow & Decision Integrity

## Executive Summary

Phase 2 focuses on verifying and documenting workflow correctness, decision traceability, and audit-grade integrity across all IMS processes. This is a **verification and gap analysis phase** — not a redesign phase.

---

## 1. Current State Analysis

### 1.1 Existing Workflow Implementations

| Module | Status Model | Transition Logic | Location |
|--------|--------------|------------------|----------|
| **Construction Subsidy** | 8 statuses | UI-defined in `STATUS_TRANSITIONS` constant | `src/app/(admin)/subsidy-cases/[id]/page.tsx` |
| **Housing Registration** | 8 statuses | UI-defined in `STATUS_TRANSITIONS` constant | `src/app/(admin)/housing-registrations/[id]/page.tsx` |
| **Allocation Runs** | 4 statuses (pending, running, completed, failed) | Edge Function controlled | `supabase/functions/execute-allocation-run/index.ts` |
| **Allocation Decisions** | 3 decision types (approved, rejected, deferred) | Modal form controlled | `src/app/(admin)/allocation-decisions/components/DecisionFormModal.tsx` |
| **Assignments** | Auto-finalization on assignment | Modal form controlled | `src/app/(admin)/allocation-assignments/components/AssignmentFormModal.tsx` |

### 1.2 Current Status Values (V1.1 Implementation)

**Subsidy Case Statuses:**
```
received → screening → needs_more_docs → fieldwork → approved_for_council → council_doc_generated → finalized
                                                   ↘ rejected
```

**Housing Registration Statuses:**
```
received → under_review → urgency_assessed → waiting_list → matched → allocated → finalized
                                                                    ↘ rejected
```

### 1.3 V1.2 Documented State Model (Target Reference)

The V1.2 Dossier State Model defines 10 canonical states:
```
DRAFT → SUBMITTED → REVIEW_APPROVED → APPROVED → CLOSED_APPROVED
                  ↘ REVISION_REQUESTED
                  ↘ ESCALATED → RESOLVED
                  ↘ REJECTED → CLOSED_REJECTED
```

---

## 2. Gap Identification: Implementation vs Documentation

### 2.1 State Model Discrepancy

| Aspect | V1.1 Implementation | V1.2 Documentation | Gap Type |
|--------|---------------------|--------------------|-----------| 
| Subsidy states | 8 operational statuses | 10 canonical states | **NOMENCLATURE** |
| Housing states | 8 operational statuses | 10 canonical states | **NOMENCLATURE** |
| Escalation path | Not implemented | ESCALATED → RESOLVED | **MISSING** |
| Revision loop | Not implemented | REVISION_REQUESTED → SUBMITTED | **MISSING** |
| Draft state | Not used (intake starts at "received") | DRAFT as initial state | **DESIGN** |

### 2.2 Role-Gated Transitions

| V1.2 Requirement | Current Implementation | Status |
|------------------|------------------------|--------|
| DVH Operator triggers DRAFT → SUBMITTED | Frontdesk roles can change status | PARTIAL |
| DVH Reviewer triggers SUBMITTED → REVIEW_APPROVED | Any authorized user can change | PARTIAL |
| DVH Decision Officer triggers approval/rejection | Minister role has approval authority | PARTIAL |
| DVH Supervisor handles escalations | Not implemented | MISSING |

**Finding:** The V1.2 documentation uses deprecated role names (DVH Operator, DVH Reviewer, DVH Decision Officer, DVH Supervisor) that do not exist in the current role enum. The current 7-role model must be mapped to these workflow responsibilities.

### 2.3 Transition Validation

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Transitions defined in code | Yes — `STATUS_TRANSITIONS` constants | ✅ IMPLEMENTED |
| Transitions validated on UI | Yes — buttons only show allowed transitions | ✅ IMPLEMENTED |
| Transitions validated on backend | **NO** — RLS allows UPDATE, not transition-specific | ⚠️ GAP |
| Invalid transitions logged as security events | **NO** | ⚠️ GAP |

---

## 3. Audit Logging Coverage Analysis

### 3.1 Current Audit Event Types in Database

| Entity Type | Actions Logged | Count |
|-------------|----------------|-------|
| `subsidy_case` | CREATE, public_submission | 8 |
| `housing_registration` | public_submission | 6 |
| `allocation_run` | CREATE | 2 |
| `person` | CREATE, UPDATE | 2 |
| `public_status_access` | status_lookup, status_lookup_failed | 10 |
| `user_roles` | role_assigned | 1 |

### 3.2 Audit Coverage Checklist

| Action | Logged? | Entity | Evidence |
|--------|---------|--------|----------|
| Dossier creation (admin) | ✅ YES | subsidy_case, housing_registration | Via `logAuditEvent()` |
| Status change | ✅ YES | subsidy_case, housing_registration | Via detail pages `handleStatusChange()` |
| Person create/update | ✅ YES | person | Via `PersonFormModal` |
| Household create | ✅ YES | household | Via `HouseholdFormModal` |
| Allocation run execution | ✅ YES | allocation_run | Via Edge Function |
| Allocation decision | ✅ YES | allocation_decision | Via `DecisionFormModal` |
| Assignment recording | ✅ YES | assignment_record | Via `AssignmentFormModal` |
| Urgency assessment | ✅ YES | housing_urgency | Via `UrgencyAssessmentForm` |
| Raadvoorstel generation | ✅ YES | generated_document | Via Edge Function |
| Public wizard submission | ✅ YES | subsidy_case, housing_registration | Via Edge Functions |
| Document upload | ❌ NO | subsidy_document_upload | MISSING |
| Report finalization | ❌ NO | social_report, technical_report | MISSING |
| Document verification | ❌ NO | subsidy_document_upload | MISSING |

### 3.3 V1.2 Audit Requirements vs Current

| V1.2 Requirement | Current Status |
|------------------|----------------|
| Event ID (unique identifier) | ✅ `id` UUID column |
| Timestamp (UTC) | ✅ `occurred_at` column |
| Actor (User ID) | ✅ `actor_user_id` column |
| Actor Role | ⚠️ PARTIAL — `actor_role` column exists but not consistently populated |
| Action Type | ✅ `action` column |
| Target Entity | ✅ `entity_type` + `entity_id` columns |
| Previous State | ❌ NOT in audit_event (stored in status_history tables) |
| New State | ❌ NOT in audit_event (stored in status_history tables) |
| Rationale | ✅ `reason` column |
| Correlation ID | ❌ MISSING |

---

## 4. UI-to-Workflow Alignment Analysis

### 4.1 Status Change Flow

```
UI Button Click
    ↓
handleStatusChange() called
    ↓
1. Validate reason is provided ✅
2. Update entity status (UPDATE query) ✅
3. Insert status_history entry ✅
4. Log audit event ✅
5. Show success notification ✅
```

**Finding:** The flow is correct but lacks backend transition validation.

### 4.2 Raadvoorstel Generation Flow

```
Generate Button Click (Subsidy Case Detail)
    ↓
Edge Function: generate-raadvoorstel
    ↓
1. Validate user authorization (RBAC) ✅
2. Validate case status (eligibility check) ✅
3. Generate DOCX document ✅
4. Store in Supabase Storage ✅
5. Insert generated_document record ✅
6. Log audit event ✅
7. Update case status to council_doc_generated ✅
```

**Finding:** Flow is complete and audit-grade.

### 4.3 Allocation Flow

```
Create Allocation Run (Run Executor Modal)
    ↓
Insert allocation_run record (pending)
    ↓
Edge Function: execute-allocation-run
    ↓
1. RBAC validation ✅
2. Update status to 'running' ✅
3. Check district quota ✅
4. Fetch eligible candidates ✅
5. Calculate composite ranks ✅
6. Insert allocation_candidate records ✅
7. Update run status to 'completed' ✅
8. Log audit event ✅
```

**Finding:** Flow is complete.

---

## 5. Phase 2 Verification Checklist

### A) Workflow Validation

| Module | Lifecycle Documented | Transitions Role-Gated | State-Valid | Status |
|--------|---------------------|------------------------|-------------|--------|
| Construction Subsidy | YES | PARTIAL (UI only) | YES (UI) | ⚠️ VERIFY |
| Housing Registration | YES | PARTIAL (UI only) | YES (UI) | ⚠️ VERIFY |
| Waiting List | YES | N/A (read-only view) | N/A | ✅ VERIFIED |
| Allocation Runs | YES | YES (Edge + RBAC) | YES | ✅ VERIFIED |
| Decisions | YES | YES (RLS + RBAC) | YES | ✅ VERIFIED |
| Assignments | YES | YES (RLS) | YES | ✅ VERIFIED |

### B) Decision Chain Integrity

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Decisions explicitly recorded | ✅ | `allocation_decision`, `status_history` tables |
| Clear initiator role | ⚠️ PARTIAL | `changed_by` / `decided_by` captures user, not role |
| Immutable audit log | ✅ | RLS denies UPDATE/DELETE on `audit_event` |

### C) Audit Log Completeness

| Action | Logged | Timestamp | Actor | Entity Link |
|--------|--------|-----------|-------|-------------|
| Creation | ✅ | ✅ | ✅ | ✅ |
| Review | ⚠️ N/A (no formal review phase in V1.1) | - | - | - |
| Approval/Rejection | ✅ | ✅ | ✅ | ✅ |
| Allocation execution | ✅ | ✅ | ✅ | ✅ |
| Assignment recording | ✅ | ✅ | ✅ | ✅ |

---

## 6. Identified Risks and Gaps

### Critical Gaps (Require Resolution)

1. **No backend transition validation** — Status changes are validated only in UI; a direct API call could bypass transition rules
2. **Actor role not consistently captured** — `actor_role` in audit_event is often NULL or 'unknown'
3. **No correlation ID** — Cannot link related events in a transaction

### Medium Gaps (Document for Future Phase)

4. **State nomenclature mismatch** — V1.1 uses operational names (received, screening, fieldwork); V1.2 docs use canonical names (SUBMITTED, REVIEW_APPROVED)
5. **Missing escalation workflow** — No ESCALATED state or supervisor override path
6. **Document operations not audited** — Upload, verification not logged

### Out of Scope (Per Phase 2 Instruction)

- Role additions or changes
- UI redesign
- Performance optimization

---

## 7. Recommended Verification Actions for Phase 2

### Tier 1: Verification Only (No Code Changes)

| Action | Deliverable |
|--------|-------------|
| Map V1.1 statuses to V1.2 canonical states | Status Mapping Table |
| Map current roles to V1.2 workflow actors | Role-Actor Mapping Table |
| Verify all status transitions are logged | Audit Coverage Report |
| Verify decision chain completeness | Decision Chain Diagram |
| Document UI-to-backend alignment | Workflow Sequence Diagrams |

### Tier 2: Potential Fixes (Require Explicit Authorization)

| Gap | Proposed Fix | Scope Impact |
|-----|--------------|--------------|
| Actor role not captured | Populate `actor_role` in `logAuditEvent()` | Minimal — hook change only |
| Document operations not audited | Add `logAuditEvent()` calls to upload/verify flows | Minimal — UI component changes |

---

## 8. Phase 2 Deliverables

1. **Workflow Verification Report**
   - Per module: Verified / Partial / Gap Identified

2. **Decision Chain Mapping Summary**
   - Visual diagram of decision flow per module
   - Role-to-action mapping

3. **Audit Log Coverage Checklist**
   - All auditable actions with coverage status
   - Gap list with severity

4. **Status Mapping Document**
   - V1.1 operational status → V1.2 canonical state

5. **Phase 2 Completion Statement**
   - Formal declaration of phase completion
   - List of deferred items

---

## 9. Authorization Gate

**This plan requires explicit approval before any verification or implementation activities commence.**

Phase 2 scope is strictly limited to:
- Verification and documentation
- No role changes
- No enum modifications
- No UI redesign
- No workflow logic changes (unless explicitly authorized)

---

## 10. Technical Details

### Files Containing Workflow Logic

| File | Purpose |
|------|---------|
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Subsidy status transitions |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | Housing status transitions |
| `src/app/(admin)/allocation-decisions/components/DecisionFormModal.tsx` | Allocation decisions |
| `src/app/(admin)/allocation-assignments/components/AssignmentFormModal.tsx` | Assignment recording |
| `src/hooks/useAuditLog.ts` | Audit logging utility |
| `supabase/functions/execute-allocation-run/index.ts` | Allocation execution |
| `supabase/functions/generate-raadvoorstel/index.ts` | Document generation |

### Audit Logging Integration Points

| Component | Uses Audit Logging | Method |
|-----------|-------------------|--------|
| PersonFormModal | ✅ | `logAuditEvent()` |
| HouseholdFormModal | ✅ | `logAuditEvent()` |
| CaseFormModal | ✅ | `useAuditLog().logEvent()` |
| RegistrationFormModal | ✅ | `useAuditLog().logEvent()` |
| DecisionFormModal | ✅ | `logAuditEvent()` |
| AssignmentFormModal | ✅ | `logAuditEvent()` |
| UrgencyAssessmentForm | ✅ | `useAuditLog().logEvent()` |
| SubsidyCaseDetail (status change) | ✅ | `useAuditLog().logEvent()` |
| HousingRegistrationDetail (status change) | ✅ | `useAuditLog().logEvent()` |
| execute-allocation-run | ✅ | Direct insert |
| generate-raadvoorstel | ✅ | Direct insert |

---

**Awaiting explicit approval to proceed with Phase 2 verification activities.**
