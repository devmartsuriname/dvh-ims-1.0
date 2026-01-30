
# DVH-IMS V1.2 — Phase 3 Planning Pack

## Audit Logging & Evidence Integrity

**Version:** 1.0  
**Date:** 2026-01-29  
**Phase:** 3 — Audit Logging & Evidence Integrity  
**Status:** PLANNING

---

## 1. Executive Summary

Phase 3 focuses on strengthening the audit logging layer to ensure tamper-evident, legally traceable records of all actor actions, document state changes, and decision events.

**Current State Assessment:**
- Audit infrastructure EXISTS and is operational
- `audit_event` table has 9 columns (append-only enforced via RLS)
- 6 Edge Functions already log to `audit_event`
- Client-side `logAuditEvent()` hook now populates `actor_role` (Phase 2 fix)
- UI components exist: Table, Filters, Detail Drawer, Export

**Phase 3 Focus:**
- Verify and document complete audit coverage
- Validate evidence integrity rules
- Ensure UI read-only compliance
- Document gaps for future phases

---

## 2. Scope Definition

### 2.1 In Scope

| Item | Description | Deliverable |
|------|-------------|-------------|
| Audit Event Model | Document canonical structure vs current schema | Audit Schema Alignment Report |
| Capture Point Mapping | Map all audit logging calls | Capture Point Matrix |
| Evidence Integrity | Validate append-only enforcement | Integrity Verification Report |
| Read-Only Access | Validate UI mutation prevention | Access Verification Checklist |
| Documentation | Phase 3 artifacts in `/phases/DVH-IMS-V1.2/` | Planning Pack |

### 2.2 Explicit Out of Scope

| Item | Reason |
|------|--------|
| New roles | Phase 1 frozen |
| Permission refactor | Out of scope |
| Workflow redesign | Out of scope |
| UI redesign | Beyond audit views |
| Analytics/dashboards | Planning-only if needed |
| Correlation ID implementation | Schema change required (document only) |

---

## 3. Current State Analysis

### 3.1 Audit Event Table Schema

| Column | Type | Nullable | V1.2 Requirement | Status |
|--------|------|----------|------------------|--------|
| id | uuid | NO | Event ID | ✅ ALIGNED |
| occurred_at | timestamptz | NO | Timestamp | ✅ ALIGNED |
| actor_user_id | uuid | YES | Actor | ✅ ALIGNED |
| actor_role | text | YES | Actor Role | ✅ ALIGNED |
| action | text | NO | Action Type | ✅ ALIGNED |
| entity_type | text | NO | Target Entity | ✅ ALIGNED |
| entity_id | uuid | YES | Target Entity ID | ✅ ALIGNED |
| reason | text | YES | Rationale | ✅ ALIGNED |
| metadata_json | jsonb | YES | Extended Data | ✅ ALIGNED |
| — | — | — | Previous State | ❌ NOT IN SCHEMA |
| — | — | — | New State | ❌ NOT IN SCHEMA |
| — | — | — | Correlation ID | ❌ NOT IN SCHEMA |

**Gap Analysis:**
- Previous/New State: Available indirectly via `*_status_history` tables
- Correlation ID: Not implemented (documented gap)

### 3.2 Current Audit Capture Points

| Source | Entity Types | Actions | Actor Role Capture |
|--------|--------------|---------|-------------------|
| Edge: execute-allocation-run | allocation_run | CREATE | ✅ From user_roles |
| Edge: generate-raadvoorstel | generated_document | document_generated | ✅ From roles |
| Edge: get-document-download-url | generated_document | document_downloaded | ✅ From user_roles |
| Edge: lookup-public-status | public_status_access | status_lookup, status_lookup_failed | ✅ 'public' |
| Edge: submit-bouwsubsidie | subsidy_case | public_submission | ✅ 'public' |
| Edge: submit-housing-registration | housing_registration | public_submission | ✅ 'public' |
| Client: logAuditEvent() | Multiple (16 types) | CREATE, UPDATE, STATUS_CHANGE | ✅ From user_roles |

### 3.3 RLS Policy Verification

| Policy | Command | Effect | Status |
|--------|---------|--------|--------|
| anon_can_insert_audit_event | INSERT | Public submissions | ✅ Active |
| role_insert_audit_event | INSERT | Authenticated users | ✅ Active |
| role_select_audit_event | SELECT | audit, system_admin, minister, project_leader | ✅ Active |
| (none) | UPDATE | Denied | ✅ IMMUTABLE |
| (none) | DELETE | Denied | ✅ IMMUTABLE |

---

## 4. Audit Event Matrix

### 4.1 Dossier Lifecycle Events

| Event | Current Implementation | Logged? | Action Value |
|-------|------------------------|---------|--------------|
| Dossier created (admin) | `CaseFormModal.tsx`, `RegistrationFormModal.tsx` | ✅ | CREATE |
| Dossier created (public) | Edge Functions | ✅ | public_submission |
| State transition executed | Detail page `handleStatusChange()` | ✅ | STATUS_CHANGE |
| State transition requested | Not implemented | ❌ N/A | (V1.2 future) |
| State transition approved | Not implemented | ❌ N/A | (V1.2 future) |

### 4.2 Decision Events

| Event | Current Implementation | Logged? | Action Value |
|-------|------------------------|---------|--------------|
| Allocation decision | `DecisionFormModal.tsx` | ✅ | CREATE |
| Assignment recorded | `AssignmentFormModal.tsx` | ✅ | CREATE |
| Urgency assessment | `UrgencyAssessmentForm.tsx` | ✅ | CREATE |

### 4.3 Governance Artifacts

| Event | Current Implementation | Logged? | Action Value |
|-------|------------------------|---------|--------------|
| Raadvoorstel generated | Edge: generate-raadvoorstel | ✅ | document_generated |
| Document downloaded | Edge: get-document-download-url | ✅ | document_downloaded |

### 4.4 Exception & Control Events

| Event | Current Implementation | Logged? | Notes |
|-------|------------------------|---------|-------|
| Escalation invoked | Not implemented | ❌ | V1.2 future workflow |
| Deadline breach | Not implemented | ❌ | V1.2 future |
| Manual override | Not implemented | ❌ | V1.2 future |

---

## 5. Capture Point Mapping

### 5.1 Client-Side Capture Points

| File | Entity Type | Actions | Evidence |
|------|-------------|---------|----------|
| `PersonFormModal.tsx` | person | CREATE, UPDATE | logAuditEvent() call |
| `HouseholdFormModal.tsx` | household | CREATE | logAuditEvent() call |
| `CaseFormModal.tsx` | subsidy_case | CREATE | logAuditEvent() call |
| `RegistrationFormModal.tsx` | housing_registration | CREATE | logAuditEvent() call |
| `DecisionFormModal.tsx` | allocation_decision | CREATE | logAuditEvent() call |
| `AssignmentFormModal.tsx` | assignment_record | CREATE | logAuditEvent() call |
| `UrgencyAssessmentForm.tsx` | housing_urgency | CREATE | logAuditEvent() call |
| `QuotaTable.tsx` | district_quota | CREATE, UPDATE | logAuditEvent() call |
| `RunExecutorModal.tsx` | allocation_run | CREATE | logAuditEvent() call |
| `subsidy-cases/[id]/page.tsx` | subsidy_case | STATUS_CHANGE | logAuditEvent() call |
| `housing-registrations/[id]/page.tsx` | housing_registration | STATUS_CHANGE | logAuditEvent() call |

### 5.2 Edge Function Capture Points

| Function | Entity Type | Actions | Service Role |
|----------|-------------|---------|--------------|
| execute-allocation-run | allocation_run | CREATE | User auth |
| generate-raadvoorstel | generated_document | document_generated | Admin client |
| get-document-download-url | generated_document | document_downloaded | Admin client |
| lookup-public-status | public_status_access | status_lookup, status_lookup_failed | Anon |
| submit-bouwsubsidie-application | subsidy_case | public_submission | Anon |
| submit-housing-registration | housing_registration | public_submission | Anon |

---

## 6. Evidence Integrity Rules

### 6.1 Append-Only Verification

| Rule | Implementation | Status |
|------|----------------|--------|
| No UPDATE allowed | No UPDATE RLS policy exists | ✅ ENFORCED |
| No DELETE allowed | No DELETE RLS policy exists | ✅ ENFORCED |
| INSERT restricted | Allowlist policies (anon + role) | ✅ ENFORCED |

### 6.2 Client-Side Mutation Prevention

| Protection | Implementation | Status |
|------------|----------------|--------|
| No edit UI | AuditLogTable is read-only | ✅ VERIFIED |
| No delete UI | No delete buttons/actions | ✅ VERIFIED |
| Detail view read-only | AuditDetailDrawer shows data only | ✅ VERIFIED |

### 6.3 API-Level Protection

| Protection | Implementation | Status |
|------------|----------------|--------|
| RLS blocks UPDATE | No UPDATE policy | ✅ ENFORCED |
| RLS blocks DELETE | No DELETE policy | ✅ ENFORCED |
| Service role required | Admin client for specific ops | ✅ ENFORCED |

---

## 7. Read-Only Audit Access Verification

### 7.1 UI Components

| Component | Purpose | Mutation Paths | Status |
|-----------|---------|----------------|--------|
| AuditLogPage | Container | None | ✅ READ-ONLY |
| AuditLogTable | List view | None | ✅ READ-ONLY |
| AuditLogFilters | Search/filter | None (client-side only) | ✅ READ-ONLY |
| AuditDetailDrawer | Detail view | None | ✅ READ-ONLY |
| AuditExportButton | CSV export | None (generates local file) | ✅ READ-ONLY |

### 7.2 Role-Based Visibility

| Role | Can View Audit Log | Evidence |
|------|-------------------|----------|
| audit | ✅ | RLS policy `role_select_audit_event` |
| system_admin | ✅ | RLS policy + page access |
| minister | ✅ | RLS policy + page access |
| project_leader | ✅ | RLS policy + page access |
| frontdesk_* | ❌ | No RLS SELECT grant |
| admin_staff | ❌ | No RLS SELECT grant |

### 7.3 Page Access Control

```typescript
// src/app/(admin)/audit-log/page.tsx
const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'audit'] as const
```

**Status:** ✅ ALIGNED with RLS policy

---

## 8. Verification Checklist

### 8.1 Phase 3 Pre-Implementation Checklist

| # | Item | Status |
|---|------|--------|
| 1 | Restore point created | ⏳ PENDING |
| 2 | Audit schema documented | ✅ Section 3 |
| 3 | Capture points mapped | ✅ Section 5 |
| 4 | Event matrix complete | ✅ Section 4 |
| 5 | Evidence integrity validated | ✅ Section 6 |
| 6 | Read-only access verified | ✅ Section 7 |

### 8.2 Implementation Verification Checklist

| # | Item | Verification Method |
|---|------|---------------------|
| 1 | All CREATE actions logged | Query audit_event + test |
| 2 | All STATUS_CHANGE actions logged | Query audit_event + test |
| 3 | actor_role populated | Query audit_event for non-null |
| 4 | No UPDATE/DELETE possible | Attempt via SQL + verify denied |
| 5 | UI mutation paths blocked | Manual UI inspection |
| 6 | Export functionality works | Manual test |

---

## 9. Gap Summary

### 9.1 Documented Gaps (Not Addressed in Phase 3)

| ID | Gap | Impact | Target |
|----|-----|--------|--------|
| G-03 | No correlation ID | Cannot link related events | Future schema change |
| G-07 | No ESCALATED workflow | V1.2 event not loggable | Future workflow |
| G-08 | No DRAFT initial state | V1.2 state not present | Future workflow |
| G-09 | Previous/New state in audit | Must join status_history | Schema decision |

### 9.2 Gaps Addressed in Phase 2

| ID | Gap | Resolution |
|----|-----|------------|
| G-02 | Actor role not populated | ✅ Fixed in Tier 2 |
| G-04 | Entity type expansion | ✅ Added subsidy_document_upload |

---

## 10. Phase 3 Deliverables

### 10.1 Required Documentation

| Document | Location | Status |
|----------|----------|--------|
| RESTORE_POINT_V1.2_PHASE3_AUDIT_START.md | `/restore-points/v1.2/` | ⏳ PENDING |
| Phase 3 Scope & Objectives | `/phases/DVH-IMS-V1.2/` | This document |
| Audit Event Matrix | Section 4 of this document | ✅ COMPLETE |
| Capture Point Mapping | Section 5 of this document | ✅ COMPLETE |
| Verification Checklist | Section 8 of this document | ✅ COMPLETE |

### 10.2 Implementation Work (If Approved)

| Task | Description | Complexity |
|------|-------------|------------|
| Verify live audit events | Query database to confirm coverage | LOW |
| Test evidence integrity | Attempt prohibited operations | LOW |
| Document any gaps found | Update verification report | LOW |

---

## 11. Governance Compliance

| Rule | Status |
|------|--------|
| No new roles | ✅ Compliant |
| No enum modifications | ✅ Compliant |
| No schema changes | ✅ Compliant (verification only) |
| No workflow redesign | ✅ Compliant |
| No UI redesign | ✅ Compliant |
| Darkone 1:1 compliance | ✅ Audit UI already Darkone-aligned |

---

## 12. Execution Plan

### Step 1: Create Restore Point
Create `RESTORE_POINT_V1.2_PHASE3_AUDIT_START.md` in `/restore-points/v1.2/`

### Step 2: Save Planning Documentation
Create comprehensive planning document in `/phases/DVH-IMS-V1.2/`

### Step 3: Verification Activities
- Query audit_event table to validate coverage
- Test evidence integrity (UPDATE/DELETE denial)
- Verify UI read-only behavior

### Step 4: Final Report
Generate Phase 3 Verification Report documenting findings

### Step 5: Closure
Upon completion, create closure statement and await Phase 4 authorization

---

## 13. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Missing audit capture points discovered | Medium | Low | Document and defer to future phase |
| RLS policy gap found | Low | High | STOP + REPORT immediately |
| UI mutation path discovered | Low | High | STOP + REPORT immediately |

---

## 14. Authorization Request

This Planning Pack defines the scope, objectives, and verification approach for Phase 3.

**Awaiting explicit approval to:**
1. Create Phase 3 START restore point
2. Execute verification activities
3. Generate Phase 3 completion documentation

**No implementation work will occur without explicit authorization.**

---

*Document Author: DVH-IMS System*  
*Planning Date: 2026-01-29*  
*Authority: Awaiting Client Approval*
