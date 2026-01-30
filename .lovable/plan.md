
# DVH-IMS V1.3 — Phase 1 Scope & Execution Plan

**Document Type:** Phase Scope & Execution Plan  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 1 — Backend Enforcement + Audit Hardening  
**Authorization Basis:** V1.3 Authorization Decision — OPTION B (APPROVED)

---

## 1. Authorization Confirmation

| Item | Status |
|------|--------|
| V1.3 Authorization Decision | OPTION B — APPROVED |
| Authorized Scope | D-01 + D-02 |
| Operational Baseline | DVH-IMS V1.1 |
| Documentation Baseline | DVH-IMS V1.2 (FROZEN) |
| Phase Status | OPEN — Awaiting Restore Point |

---

## 2. Phase 1 Scope Summary

### 2.1 Authorized Implementation (D-01 + D-02)

| ID | Item | Description |
|----|------|-------------|
| D-01 | Backend Transition Enforcement | Database triggers to enforce state machine at DB level |
| D-02 | Audit Hardening | Correlation IDs, cross-entity linkage, completeness verification |

### 2.2 Explicit Exclusions

| Item | Status |
|------|--------|
| Notifications (S-03) | NOT AUTHORIZED |
| Scale/Performance (SP-A/B/C) | NOT AUTHORIZED |
| Service refactors (S-01, S-02) | NOT AUTHORIZED |
| UI changes | NOT AUTHORIZED |
| Role changes | NOT AUTHORIZED |
| Enum changes | NOT AUTHORIZED |
| RLS policy changes | NOT AUTHORIZED |
| Public wizard changes | NOT AUTHORIZED |

---

## 3. Current State Analysis

### 3.1 Status Transition Enforcement (D-01 Gap)

**Current Implementation:**
- UI-level validation only in `STATUS_TRANSITIONS` constant
- `subsidy_case` uses status values: `received`, `screening`, `needs_more_docs`, `fieldwork`, `approved_for_council`, `council_doc_generated`, `finalized`, `rejected`
- `housing_registration` uses status values: `received`, `under_review`, `urgency_assessed`, `waiting_list`, `matched`, `allocated`, `finalized`, `rejected`
- No database-level enforcement — invalid transitions possible via direct SQL or API manipulation

**Risk:** Invalid transitions possible without audit trail, compromising legal traceability.

### 3.2 Audit Schema (D-02 Gap)

**Current `audit_event` Table Schema:**

| Column | Type | Status |
|--------|------|--------|
| id | uuid | EXISTS |
| actor_user_id | uuid | EXISTS |
| actor_role | text | EXISTS |
| action | text | EXISTS |
| entity_type | text | EXISTS |
| entity_id | uuid | EXISTS |
| occurred_at | timestamptz | EXISTS |
| reason | text | EXISTS |
| metadata_json | jsonb | EXISTS |
| correlation_id | uuid | **MISSING** |

**Gap:** No correlation ID for grouping related audit events. Cross-entity traceability relies on manual metadata inspection.

### 3.3 Current Status Values in Production

| Table | Records | Status Values |
|-------|---------|---------------|
| subsidy_case | 0 | N/A (empty) |
| housing_registration | 0 | N/A (empty) |

**Migration Risk:** LOW — No existing data to validate against new state machine.

---

## 4. Implementation Strategy

### 4.1 Enforcement Approach Decision

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Database Triggers | Bypass-proof, centralized, no code changes | Requires schema migration | **SELECTED** |
| Edge Function Layer | Application-level control | Can be bypassed, requires refactoring | Not selected |

**Decision:** Implement as PostgreSQL `BEFORE UPDATE` triggers per D-01 Technical Specification.

**Justification:**
- Database triggers cannot be bypassed regardless of access path
- Service role operations still trigger validation
- Aligned with D-01 Technical Specification already approved
- No changes to existing UI or Edge Functions required

### 4.2 Implementation Phases

| Phase | Step | Description |
|-------|------|-------------|
| 1A | Restore Point | Create mandatory restore point |
| 1B | Audit Schema Enhancement | Add correlation_id column to audit_event |
| 1C | Transition Matrix Definition | Define canonical status values and transitions |
| 1D | Trigger Functions | Create validation trigger functions |
| 1E | Trigger Attachment | Attach triggers to tables |
| 1F | Audit Integration | Ensure triggers log to audit_event with correlation |
| 1G | Verification | Test valid and invalid transitions |
| 1H | Closure | Phase closure report |

---

## 5. D-01: Backend Transition Enforcement

### 5.1 Status Value Mapping

Current V1.1 status values must be mapped to the canonical state machine:

**Subsidy Case (Bouwsubsidie):**

| V1.1 Status | Canonical State | Valid Transitions To |
|-------------|-----------------|---------------------|
| `received` | Initial | `screening`, `rejected` |
| `screening` | Review | `needs_more_docs`, `fieldwork`, `rejected` |
| `needs_more_docs` | Revision | `screening`, `rejected` |
| `fieldwork` | Assessment | `approved_for_council`, `rejected` |
| `approved_for_council` | Pre-Approval | `council_doc_generated`, `rejected` |
| `council_doc_generated` | Approved | `finalized`, `rejected` |
| `finalized` | Terminal | *(none)* |
| `rejected` | Terminal | *(none)* |

**Housing Registration (Woning Registratie):**

| V1.1 Status | Canonical State | Valid Transitions To |
|-------------|-----------------|---------------------|
| `received` | Initial | `under_review`, `rejected` |
| `under_review` | Review | `urgency_assessed`, `rejected` |
| `urgency_assessed` | Assessed | `waiting_list`, `rejected` |
| `waiting_list` | Queued | `matched`, `rejected` |
| `matched` | Pre-Allocation | `allocated`, `rejected` |
| `allocated` | Allocated | `finalized`, `rejected` |
| `finalized` | Terminal | *(none)* |
| `rejected` | Terminal | *(none)* |

### 5.2 Trigger Function Design

```text
+--------------------------------------------+
|       BEFORE UPDATE Trigger Function        |
+--------------------------------------------+
| 1. Check if status column changed           |
| 2. If unchanged: RETURN NEW (no validation) |
| 3. Get allowed transitions for OLD status   |
| 4. If NEW status in allowed list:           |
|    - Generate correlation_id                |
|    - RETURN NEW (proceed with update)       |
| 5. If NOT in allowed list:                  |
|    - Log INVALID_TRANSITION_BLOCKED audit   |
|    - RAISE EXCEPTION (check_violation)      |
+--------------------------------------------+
```

### 5.3 Required Database Changes

| Change | Type | Table/Function |
|--------|------|----------------|
| Create function | DDL | `validate_subsidy_case_transition()` |
| Create function | DDL | `validate_housing_registration_transition()` |
| Create trigger | DDL | `trg_validate_subsidy_case_transition` on `subsidy_case` |
| Create trigger | DDL | `trg_validate_housing_registration_transition` on `housing_registration` |

---

## 6. D-02: Audit Hardening

### 6.1 Correlation ID Implementation

**Schema Change:**

```sql
ALTER TABLE public.audit_event 
ADD COLUMN correlation_id uuid DEFAULT gen_random_uuid();
```

**Purpose:**
- Group related audit events from a single transaction
- Enable cross-entity traceability (dossier ↔ status history ↔ documents)
- Support legal reconstruction of decision chains

### 6.2 Correlation Strategy

| Scenario | Correlation Approach |
|----------|---------------------|
| Status transition | Same correlation_id for UPDATE audit + status_history INSERT |
| Blocked transition | Unique correlation_id for INVALID_TRANSITION_BLOCKED event |
| Multi-entity operation | Shared correlation_id across all affected entities |

### 6.3 Audit Completeness Verification

**Enforcement Rule:** Every status transition MUST generate an audit event.

**Implementation:**
- Trigger functions log all transitions (valid and invalid)
- UI-level audit logging remains as additional layer
- No silent state changes possible

### 6.4 Required Database Changes

| Change | Type | Table |
|--------|------|-------|
| Add column | DDL | `audit_event.correlation_id` |
| Add index | DDL | `idx_audit_event_correlation_id` |

---

## 7. Verification Matrix

### 7.1 D-01 Verification Tests

| Test ID | Scenario | Table | Expected Result |
|---------|----------|-------|-----------------|
| D01-T01 | `received` → `screening` | subsidy_case | ALLOWED |
| D01-T02 | `received` → `finalized` | subsidy_case | BLOCKED |
| D01-T03 | `finalized` → `received` | subsidy_case | BLOCKED |
| D01-T04 | `screening` → `rejected` | subsidy_case | ALLOWED |
| D01-T05 | `received` → `under_review` | housing_registration | ALLOWED |
| D01-T06 | `received` → `allocated` | housing_registration | BLOCKED |
| D01-T07 | `finalized` → `received` | housing_registration | BLOCKED |
| D01-T08 | `waiting_list` → `rejected` | housing_registration | ALLOWED |
| D01-T09 | Audit event created on block | both | audit_event record exists |
| D01-T10 | Error message includes allowed transitions | both | Message readable |

### 7.2 D-02 Verification Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| D02-T01 | correlation_id column exists | Column in audit_event |
| D02-T02 | Default value is UUID | Auto-generated on INSERT |
| D02-T03 | Index exists for correlation_id | Query performance verified |
| D02-T04 | Related events share correlation_id | Grouping works correctly |
| D02-T05 | Invalid transition audit has correlation_id | Not null |

---

## 8. Rollback Strategy

### 8.1 Emergency Rollback SQL

```sql
-- Step 1: Remove triggers
DROP TRIGGER IF EXISTS trg_validate_subsidy_case_transition 
  ON public.subsidy_case;
DROP TRIGGER IF EXISTS trg_validate_housing_registration_transition 
  ON public.housing_registration;

-- Step 2: Remove functions
DROP FUNCTION IF EXISTS public.validate_subsidy_case_transition();
DROP FUNCTION IF EXISTS public.validate_housing_registration_transition();

-- Step 3: Remove correlation_id (if needed)
-- ALTER TABLE public.audit_event DROP COLUMN IF EXISTS correlation_id;
```

### 8.2 Rollback Triggers

| Trigger | Action |
|---------|--------|
| Production error after deployment | Execute rollback SQL |
| Test failure | Fix before proceeding |
| Blocker discovered | STOP + REPORT |

---

## 9. Non-Goals (Explicit)

| Item | Reason | Status |
|------|--------|--------|
| Modify UI status transition logic | Not authorized | EXCLUDED |
| Add new status values | State machine unchanged | EXCLUDED |
| Change RLS policies | Not authorized | EXCLUDED |
| Modify Edge Functions | Only triggers, no app code | EXCLUDED |
| Implement notifications | Deferred (S-03) | EXCLUDED |
| Refactor services | Deferred (S-01, S-02) | EXCLUDED |

---

## 10. Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Restore Point: `RESTORE_POINT_V1.3_PHASE1_D01_D02_START` | PENDING |
| 2 | Database migration: correlation_id column | PENDING |
| 3 | Trigger function: `validate_subsidy_case_transition()` | PENDING |
| 4 | Trigger function: `validate_housing_registration_transition()` | PENDING |
| 5 | Trigger: `trg_validate_subsidy_case_transition` | PENDING |
| 6 | Trigger: `trg_validate_housing_registration_transition` | PENDING |
| 7 | Backend Enforcement Verification Report | PENDING |
| 8 | Audit Hardening Verification Report | PENDING |
| 9 | Updated Audit Event Matrix | PENDING |
| 10 | Phase 1 Closure Report | PENDING |
| 11 | Confirmation: V1.1 functional behavior preserved | PENDING |

---

## 11. Implementation Sequence

```text
Phase 1 Execution Flow:

┌──────────────────────────────────────────────────────┐
│  STEP 1: Create Restore Point                        │
│  RESTORE_POINT_V1.3_PHASE1_D01_D02_START             │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2: D-02 Audit Hardening (Schema)               │
│  - Add correlation_id column to audit_event          │
│  - Add index for correlation_id                      │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 3: D-01 Backend Enforcement                    │
│  - Create validate_subsidy_case_transition()         │
│  - Create validate_housing_registration_transition() │
│  - Attach BEFORE UPDATE triggers                     │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 4: Verification                                │
│  - Execute D01-T01 through D01-T10                   │
│  - Execute D02-T01 through D02-T05                   │
│  - Confirm V1.1 functional behavior preserved        │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 5: Documentation                               │
│  - Backend Enforcement Verification Report           │
│  - Audit Hardening Verification Report               │
│  - Updated Audit Event Matrix                        │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 6: Phase Closure                               │
│  - Phase 1 Closure Report                            │
│  - Confirm all exclusions respected                  │
└──────────────────────────────────────────────────────┘
```

---

## 12. Governance Compliance Statement

| Rule | Status |
|------|--------|
| Phase-gated execution | COMPLIANT |
| Restore point before implementation | PENDING |
| No scope expansion beyond D-01 + D-02 | ENFORCED |
| Every change traceable to D-01 or D-02 | ENFORCED |
| Status reports for each sub-step | REQUIRED |
| No UI, Role, Enum, RLS, or Public Wizard changes | ENFORCED |

---

## 13. Authorization Gate

This Phase 1 Scope & Execution Plan requires approval before implementation may begin.

**Mandatory First Step:** Create restore point before ANY code or schema changes.

**Document Status:** PENDING APPROVAL

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE1_D01_D02_START.md` | CREATE | Mandatory restore point |
| `restore-points/v1.3/README.md` | CREATE | V1.3 restore point index |
| Database migration | EXECUTE | Add correlation_id + triggers |
| `phases/DVH-IMS-V1.3/PHASE-1-Scope-and-Execution-Plan.md` | CREATE | This document |
| `phases/DVH-IMS-V1.3/README.md` | CREATE | Phase tracking index |

---

## 14. Final Statement

**V1.3 Phase 1 is limited to Backend Enforcement and Audit Hardening only.**

**No other V1.2 items are authorized.**

**Any deviation requires explicit written approval.**

---

**Awaiting approval to create Restore Point and begin implementation.**
