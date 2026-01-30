
# DVH-IMS V1.2 — Phase 5 Planning Pack

## Services Module Decomposition

**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** 5 — Services Module Decomposition  
**Status:** PLANNING

---

## 1. Executive Summary

Phase 5 focuses on validating alignment between the implemented service logic and the V1.2 Services Module Decomposition document. This phase verifies that existing Edge Functions, client-side service calls, and workflow handlers correctly implement the service architecture defined in the planning documents.

**Key Objectives:**
- Map existing implementations to documented service definitions
- Validate Bouwsubsidie-specific services (including Raadvoorstel Generation)
- Validate Woning Registratie-specific services
- Verify service boundaries and exclusions are respected
- Document any gaps between specification and implementation

---

## 2. Scope Definition

### 2.1 In Scope

| Item | Description | Deliverable |
|------|-------------|-------------|
| Service Inventory | Map all existing service implementations | Service Implementation Matrix |
| Service-Workflow Alignment | Verify services follow documented workflows | Alignment Report |
| Bouwsubsidie Services | Validate Financial Assessment, Raadvoorstel, Allocation | Module Verification Report |
| Woning Registratie Services | Validate Registration, Urgency, Allocation | Module Verification Report |
| Cross-Cutting Services | Verify Audit, RBAC enforcement | Cross-Cut Verification |
| Service Boundaries | Confirm exclusions are respected | Boundary Validation |

### 2.2 Explicit Out of Scope

| Item | Reason |
|------|--------|
| Schema changes | Requires explicit authorization |
| New Edge Functions | Beyond verification scope |
| New roles | Governance constraint |
| Notification implementation | Documented as planning-only |
| External integrations | Explicitly excluded in V1.2 |

---

## 3. Current Service Implementation Analysis

### 3.1 Edge Functions (Backend Services)

| Function | V1.2 Service Mapping | Status |
|----------|----------------------|--------|
| `execute-allocation-run` | Subsidy Allocation Service (Housing) | ✅ Implemented |
| `generate-raadvoorstel` | Raadvoorstel Generation Service | ✅ Implemented |
| `get-document-download-url` | Document Access (supporting) | ✅ Implemented |
| `submit-bouwsubsidie-application` | Intake Service (Bouwsubsidie) | ✅ Implemented |
| `submit-housing-registration` | Intake Service (Housing) | ✅ Implemented |
| `lookup-public-status` | Status Lookup (supporting) | ✅ Implemented |

### 3.2 Client-Side Service Implementations

| Component | V1.2 Service Mapping | Implementation |
|-----------|----------------------|----------------|
| CaseFormModal | Dossier Management Service | Direct Supabase insert |
| RegistrationFormModal | Dossier Management Service | Direct Supabase insert |
| PersonFormModal | Shared Core (Person management) | Direct Supabase upsert |
| HouseholdFormModal | Shared Core (Household management) | Direct Supabase insert |
| UrgencyAssessmentForm | Registration Validation Service | Direct Supabase insert |
| DecisionFormModal | Decision Service | Direct Supabase insert |
| AssignmentFormModal | Registry Recording Service | Direct Supabase insert |
| Status Change Handlers | Review & Assessment Service | Direct Supabase update |

### 3.3 V1.2 Services vs Implementation Matrix

#### Shared Core Services

| Service | Documented | Implemented | Method |
|---------|------------|-------------|--------|
| Intake Service | ✅ | ✅ | Edge Functions (public) + Modals (admin) |
| Dossier Management Service | ✅ | ✅ | Client-side modals + RLS |
| Review & Assessment Service | ✅ | ✅ | Status change handlers |
| Decision Service | ✅ | ✅ | DecisionFormModal + status handlers |
| Audit & Traceability Service | ✅ | ✅ | useAuditLog hook + Edge direct inserts |

#### Bouwsubsidie-Specific Services

| Service | Documented | Implemented | Method |
|---------|------------|-------------|--------|
| Financial Assessment Service | ✅ | ⚠️ Partial | Fields exist, no formal assessment logic |
| Raadvoorstel Generation Service | ✅ | ✅ | Edge Function (generate-raadvoorstel) |
| Subsidy Allocation Service | ✅ | ⚠️ Partial | approved_amount field, no formal allocation flow |

#### Woning Registratie-Specific Services

| Service | Documented | Implemented | Method |
|---------|------------|-------------|--------|
| Registration Validation Service | ✅ | ✅ | UrgencyAssessmentForm + status flow |
| Registry Recording Service | ✅ | ✅ | execute-allocation-run Edge Function |

#### Cross-Cutting Services

| Service | Documented | Implemented | Status |
|---------|------------|-------------|--------|
| Notification Orchestration Service | ✅ | ❌ | Documented as planning-only |
| Reporting & Statistics Service | ✅ | ⚠️ Partial | Dashboard exists, aggregations manual |
| Role & Authority Enforcement | ✅ | ✅ | RLS + useUserRole + Edge RBAC |

---

## 4. Service-to-Workflow Mapping Verification

### 4.1 Documented Mapping (from V1.2 Services Decomposition)

| Workflow Phase | Primary Service | Implementation |
|----------------|-----------------|----------------|
| Submission | Intake Service | Edge Functions (public) / Modals (admin) |
| Dossier Creation | Dossier Management Service | CaseFormModal / RegistrationFormModal |
| Review | Review & Assessment Service | Status change handlers |
| Decision | Decision Service | DecisionFormModal + status handlers |
| Raadvoorstel | Raadvoorstel Generation Service | generate-raadvoorstel Edge Function |
| Finalization | Subsidy Allocation / Registry Recording | Status finalization + allocation runs |

### 4.2 Bouwsubsidie Workflow Coverage

| Phase | Service | Edge Function | Client Component | Status |
|-------|---------|---------------|------------------|--------|
| Public Submission | Intake | submit-bouwsubsidie-application | (none) | ✅ |
| Admin Creation | Dossier Mgmt | (none) | CaseFormModal | ✅ |
| Screening | Review | (none) | Status handler | ✅ |
| Fieldwork | Review | (none) | Status handler | ✅ |
| Council Approval | Decision | (none) | Status handler | ✅ |
| Raadvoorstel | Raadvoorstel Gen | generate-raadvoorstel | Generate button | ✅ |
| Finalization | Subsidy Allocation | (none) | Status handler | ✅ |

### 4.3 Woning Registratie Workflow Coverage

| Phase | Service | Edge Function | Client Component | Status |
|-------|---------|---------------|------------------|--------|
| Public Submission | Intake | submit-housing-registration | (none) | ✅ |
| Admin Creation | Dossier Mgmt | (none) | RegistrationFormModal | ✅ |
| Review | Review | (none) | Status handler | ✅ |
| Urgency Assessment | Registration Validation | (none) | UrgencyAssessmentForm | ✅ |
| Waiting List | Registry Recording | (none) | Status handler | ✅ |
| Matching | Registry Recording | execute-allocation-run | RunExecutorModal | ✅ |
| Allocation | Registry Recording | (none) | Status handler | ✅ |
| Finalization | Registry Recording | (none) | Status handler | ✅ |

---

## 5. Raadvoorstel Service Verification

### 5.1 Service Alignment

**Documented Specification (V1.2 Backend Design Overview):**

| Aspect | Specification | Implementation |
|--------|---------------|----------------|
| Purpose | Generate Raadvoorstel after approval | ✅ Generates DOCX after approved_for_council |
| Input | Approved Bouwsubsidie dossier | ✅ Validates status is eligible |
| Output | Raadvoorstel document | ✅ Produces DOCX via docx library |
| Authority | System (triggered post-approval) | ⚠️ User-triggered, not automatic |
| Audit | Generation event logged | ✅ Logs document_generated event |

### 5.2 Implementation Details

**Edge Function:** `generate-raadvoorstel`
- **RBAC:** system_admin, project_leader, frontdesk_bouwsubsidie, admin_staff
- **Status Validation:** Must be approved_for_council, council_doc_generated, or finalized
- **Output:** DOCX document with structured sections
- **Audit:** Logs to audit_event with actor_role

### 5.3 Module Exclusion Verification

**V1.2 Requirement:** Raadvoorstel applies ONLY to Bouwsubsidie. Woning Registratie explicitly excludes this service.

**Verification:**
- generate-raadvoorstel queries `subsidy_case` table only
- No Raadvoorstel UI in housing-registrations detail page
- No generate-raadvoorstel references in housing module

**Status:** ✅ COMPLIANT

---

## 6. Service Boundary Verification

### 6.1 Documented Exclusions (from V1.2 Services Decomposition)

| Exclusion | Requirement | Status |
|-----------|-------------|--------|
| No external payment services | Not implemented | ✅ COMPLIANT |
| No automated decision engines | All decisions manual | ✅ COMPLIANT |
| No public notification channels | Notifications not active | ✅ COMPLIANT |
| No cross-dossier automation | Each dossier independent | ✅ COMPLIANT |

### 6.2 Notification Service Status

**V1.2 Note:** Notification services are documented but not implemented in V1.2.

**Current State:**
- No notification Edge Functions exist
- No notification triggers in workflows
- Notification documented in planning only

**Status:** ✅ COMPLIANT (correctly not implemented)

---

## 7. Audit-First Design Verification

### 7.1 Service-Level Audit Compliance

| Service Implementation | Audit Event | actor_role | Status |
|------------------------|-------------|------------|--------|
| submit-bouwsubsidie-application | public_submission | 'public' | ✅ |
| submit-housing-registration | public_submission | 'public' | ✅ |
| generate-raadvoorstel | document_generated | From user_roles | ✅ |
| execute-allocation-run | CREATE | From user_roles | ✅ |
| get-document-download-url | document_downloaded | From user_roles | ✅ |
| lookup-public-status | status_lookup | 'public' | ✅ |
| Client: CaseFormModal | CREATE | Via useAuditLog | ✅ |
| Client: Status handlers | STATUS_CHANGE | Via useAuditLog | ✅ |

### 7.2 Immutability Verification

**V1.2 Requirement:** Audit & Traceability Service must produce immutable logs.

**Verification (from Phase 3):**
- No UPDATE RLS policy on audit_event
- No DELETE RLS policy on audit_event
- UI has no edit/delete paths

**Status:** ✅ VERIFIED (Phase 3 closure)

---

## 8. Gap Analysis

### 8.1 Documented Gaps

| ID | Service | Gap | Impact | Recommendation |
|----|---------|-----|--------|----------------|
| S-01 | Financial Assessment | No formal assessment logic | LOW | Fields exist, workflow supports manual assessment |
| S-02 | Subsidy Allocation | No formal allocation workflow | LOW | approved_amount + finalized status sufficient |
| S-03 | Notification Orchestration | Not implemented | EXPECTED | Documented as planning-only |
| S-04 | Reporting & Statistics | Manual aggregations | LOW | Dashboard functional, optimization deferred |

### 8.2 Design Deviations

| Deviation | Documented | Implemented | Justification |
|-----------|------------|-------------|---------------|
| Raadvoorstel trigger | System (auto) | User (button) | User control preferred |
| Service layer | Dedicated services | RLS + Edge + Client | Supabase architecture |

---

## 9. Phase 5 Verification Activities

### 9.1 Pre-Verification Checklist

| # | Item | Status |
|---|------|--------|
| 1 | Restore point created | ⏳ PENDING |
| 2 | Edge Functions inventory | ✅ Section 3 |
| 3 | Client service mapping | ✅ Section 3 |
| 4 | Workflow alignment | ✅ Section 4 |
| 5 | Raadvoorstel verification | ✅ Section 5 |
| 6 | Boundary compliance | ✅ Section 6 |
| 7 | Audit compliance | ✅ Section 7 |

### 9.2 Verification Activities

| Activity | Method | Deliverable |
|----------|--------|-------------|
| Edge Function code review | Read function implementations | Code alignment notes |
| Service boundary check | Search for exclusion violations | Boundary report |
| Workflow-to-service trace | Map each workflow step to service | Trace matrix |
| Audit capture validation | Query audit_event by service | Coverage report |

---

## 10. Execution Plan

### Step 1: Create Restore Point
Create `RESTORE_POINT_V1.2_PHASE5_SERVICES_START.md` in `/restore-points/v1.2/`

### Step 2: Service Implementation Verification
- Review all 6 Edge Functions for service alignment
- Verify RBAC implementation per function
- Confirm audit logging per function

### Step 3: Workflow-Service Mapping Validation
- Trace each workflow phase to implementing service
- Document any missing service implementations
- Verify service boundaries respected

### Step 4: Module-Specific Verification
- Bouwsubsidie: Validate Raadvoorstel flow end-to-end
- Housing: Validate allocation run flow end-to-end

### Step 5: Documentation
- Generate Phase 5 Verification Report
- Document gaps and deferred items
- Create closure statement

---

## 11. Deliverables

| Document | Location | Status |
|----------|----------|--------|
| RESTORE_POINT_V1.2_PHASE5_SERVICES_START.md | `/restore-points/v1.2/` | Pending |
| Phase 5 Planning Pack | `/phases/DVH-IMS-V1.2/` | This document |
| Service Implementation Matrix | Section 3 | ✅ COMPLETE |
| Workflow-Service Trace | Section 4 | ✅ COMPLETE |
| Phase 5 Verification Report | `/phases/DVH-IMS-V1.2/` | Pending |
| Phase 5 Closure Statement | `/phases/DVH-IMS-V1.2/` | Pending |

---

## 12. Governance Compliance

| Rule | Status |
|------|--------|
| No schema changes | ✅ Compliant (verification only) |
| No new Edge Functions | ✅ Compliant |
| No new roles | ✅ Compliant |
| No /docs edits | ✅ Compliant (read-only) |
| Darkone compliance | N/A (no UI changes) |

---

## 13. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Missing service implementation | Low | Medium | Document and defer |
| Service boundary violation | Low | High | STOP + REPORT |
| Raadvoorstel in wrong module | Low | High | Already verified negative |
| Audit gap in service | Low | Medium | Phase 3 verified |

---

## 14. Technical Summary

### Current Architecture

```text
+----------------------------------+
|        PUBLIC LAYER              |
+----------------------------------+
| Edge Functions:                  |
| - submit-bouwsubsidie-application|
| - submit-housing-registration    |
| - lookup-public-status           |
+----------------------------------+
             |
             v
+----------------------------------+
|      AUTHENTICATED LAYER         |
+----------------------------------+
| Edge Functions:                  |
| - generate-raadvoorstel          |
| - execute-allocation-run         |
| - get-document-download-url      |
|                                  |
| Client Services:                 |
| - Form Modals (CRUD)             |
| - Status Handlers (Transitions)  |
| - useAuditLog (Audit capture)    |
+----------------------------------+
             |
             v
+----------------------------------+
|         RLS LAYER                |
+----------------------------------+
| - Role-based access              |
| - District isolation             |
| - Audit immutability             |
+----------------------------------+
             |
             v
+----------------------------------+
|      PERSISTENCE LAYER           |
+----------------------------------+
| - Dossier tables                 |
| - Status history tables          |
| - Audit event table              |
| - Generated documents            |
+----------------------------------+
```

---

## 15. Authorization Request

This Planning Pack defines Phase 5 scope, objectives, and verification approach.

**Awaiting explicit approval to:**
1. Create Phase 5 START restore point
2. Execute verification activities
3. Generate Phase 5 completion documentation

**No implementation or code changes will occur.**

---

*Document Author: DVH-IMS System*  
*Planning Date: 2026-01-30*  
*Authority: Awaiting Client Approval*
