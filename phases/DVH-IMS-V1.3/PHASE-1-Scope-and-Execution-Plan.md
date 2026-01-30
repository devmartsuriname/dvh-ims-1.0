# DVH-IMS V1.3 — Phase 1 Scope & Execution Plan

**Document Type:** Phase Scope & Execution Plan  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 1 — Backend Enforcement + Audit Hardening  
**Authorization Basis:** V1.3 Authorization Decision — OPTION B (APPROVED)  
**Status:** APPROVED

---

## 1. Authorization Confirmation

| Item | Status |
|------|--------|
| V1.3 Authorization Decision | OPTION B — APPROVED |
| Authorized Scope | D-01 + D-02 |
| Operational Baseline | DVH-IMS V1.1 |
| Documentation Baseline | DVH-IMS V1.2 (FROZEN) |
| Phase Status | IN PROGRESS |
| Restore Point | RESTORE_POINT_V1.3_PHASE1_D01_D02_START ✓ |

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

## 3. Implementation Strategy

### 3.1 Enforcement Approach

**Decision:** Implement as PostgreSQL `BEFORE UPDATE` triggers.

**Justification:**
- Database triggers cannot be bypassed regardless of access path
- Service role operations still trigger validation
- No changes to existing UI or Edge Functions required

### 3.2 Implementation Sequence

| Step | Description | Status |
|------|-------------|--------|
| 1A | Create Restore Point | ✓ COMPLETE |
| 1B | D-02: Add correlation_id column | ✓ COMPLETE |
| 1C | D-01: Create trigger functions | ✓ COMPLETE |
| 1D | D-01: Attach triggers to tables | ✓ COMPLETE |
| 1E | Verification testing | IN PROGRESS |
| 1F | Phase closure report | PENDING |

---

## 4. D-01: Backend Transition Enforcement

### 4.1 Subsidy Case Transition Matrix

| Current Status | Allowed Transitions |
|----------------|---------------------|
| `received` | `screening`, `rejected` |
| `screening` | `needs_more_docs`, `fieldwork`, `rejected` |
| `needs_more_docs` | `screening`, `rejected` |
| `fieldwork` | `approved_for_council`, `rejected` |
| `approved_for_council` | `council_doc_generated`, `rejected` |
| `council_doc_generated` | `finalized`, `rejected` |
| `finalized` | *(terminal — no transitions)* |
| `rejected` | *(terminal — no transitions)* |

### 4.2 Housing Registration Transition Matrix

| Current Status | Allowed Transitions |
|----------------|---------------------|
| `received` | `under_review`, `rejected` |
| `under_review` | `urgency_assessed`, `rejected` |
| `urgency_assessed` | `waiting_list`, `rejected` |
| `waiting_list` | `matched`, `rejected` |
| `matched` | `allocated`, `rejected` |
| `allocated` | `finalized`, `rejected` |
| `finalized` | *(terminal — no transitions)* |
| `rejected` | *(terminal — no transitions)* |

---

## 5. D-02: Audit Hardening

### 5.1 Schema Changes

| Change | Target | Purpose |
|--------|--------|---------|
| Add `correlation_id` column | audit_event | Group related audit events |
| Add index on `correlation_id` | audit_event | Query performance |

### 5.2 Correlation Strategy

- Every status transition generates a correlation_id
- Blocked transitions also get a unique correlation_id
- Enables legal reconstruction of decision chains

---

## 6. Verification Matrix

### 6.1 D-01 Tests

| Test ID | Scenario | Table | Expected |
|---------|----------|-------|----------|
| D01-T01 | `received` → `screening` | subsidy_case | ALLOWED |
| D01-T02 | `received` → `finalized` | subsidy_case | BLOCKED |
| D01-T03 | `finalized` → `received` | subsidy_case | BLOCKED |
| D01-T04 | `screening` → `rejected` | subsidy_case | ALLOWED |
| D01-T05 | `received` → `under_review` | housing_registration | ALLOWED |
| D01-T06 | `received` → `allocated` | housing_registration | BLOCKED |
| D01-T07 | `finalized` → `received` | housing_registration | BLOCKED |
| D01-T08 | `waiting_list` → `rejected` | housing_registration | ALLOWED |
| D01-T09 | Audit event on block | both | EXISTS |
| D01-T10 | Error shows allowed transitions | both | READABLE |

### 6.2 D-02 Tests

| Test ID | Scenario | Expected |
|---------|----------|----------|
| D02-T01 | correlation_id column exists | YES |
| D02-T02 | Default is UUID | YES |
| D02-T03 | Index exists | YES |
| D02-T04 | Related events share correlation_id | YES |
| D02-T05 | Block events have correlation_id | YES |

---

## 7. Rollback Strategy

```sql
-- Emergency Rollback SQL
DROP TRIGGER IF EXISTS trg_validate_subsidy_case_transition ON public.subsidy_case;
DROP TRIGGER IF EXISTS trg_validate_housing_registration_transition ON public.housing_registration;
DROP FUNCTION IF EXISTS public.validate_subsidy_case_transition();
DROP FUNCTION IF EXISTS public.validate_housing_registration_transition();
```

---

## 8. Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Restore Point | ✓ COMPLETE |
| 2 | correlation_id column | ✓ COMPLETE |
| 3 | Trigger functions | ✓ COMPLETE |
| 4 | Triggers attached | ✓ COMPLETE |
| 5 | Verification Report | IN PROGRESS |
| 6 | Phase Closure Report | PENDING |

---

## 9. Final Statement

**V1.3 Phase 1 is limited to Backend Enforcement and Audit Hardening only.**

**No other V1.2 items are authorized.**

**Any deviation requires explicit written approval.**

---

**END OF DOCUMENT**
