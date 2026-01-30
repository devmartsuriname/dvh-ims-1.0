# D-01 — Backend Transition Enforcement Technical Specification

**Document Type:** Technical Specification  
**Version:** 1.0  
**Date:** 2026-01-30  
**Status:** DRAFT — PRE-AUTHORIZATION  
**Authority:** Pending Delroy Approval  
**Target Version:** DVH-IMS V1.3

---

## 1. Executive Summary

This specification defines the database-level enforcement of dossier state transitions for both `subsidy_case` and `housing_registration` tables. The implementation uses PostgreSQL trigger functions to validate status changes before they are committed, ensuring the state machine cannot be bypassed regardless of access path.

**Current State:** Transitions enforced at UI layer only  
**Target State:** Transitions enforced at database layer via BEFORE UPDATE triggers

---

## 2. Objectives

| Objective | Description |
|-----------|-------------|
| **O-1** | Prevent invalid state transitions at database level |
| **O-2** | Log all transition attempts (valid and invalid) |
| **O-3** | Maintain backward compatibility with existing UI flows |
| **O-4** | Zero impact on read operations |
| **O-5** | Support audit trail requirements |

---

## 3. Scope

### 3.1 In Scope

| Item | Description |
|------|-------------|
| `subsidy_case.status` | Bouwsubsidie dossier status transitions |
| `housing_registration.current_status` | Woning Registratie status transitions |
| PostgreSQL trigger functions | Validation logic |
| Audit event logging | Invalid transition attempts |

### 3.2 Out of Scope

| Item | Reason |
|------|--------|
| RLS policy changes | Separate concern |
| UI modifications | Existing validation retained |
| New status values | State machine unchanged |
| Notification triggers | Deferred to S-03 |

---

## 4. State Machine Reference

### 4.1 Canonical States

Both modules use the same 10 canonical states:

| State | Code | Terminal |
|-------|------|----------|
| Draft | `draft` | No |
| Submitted | `submitted` | No |
| Review Approved | `review_approved` | No |
| Revision Requested | `revision_requested` | No |
| Approved | `approved` | No |
| Rejected | `rejected` | No |
| Escalated | `escalated` | No |
| Resolved | `resolved` | No |
| Closed Approved | `closed_approved` | Yes |
| Closed Rejected | `closed_rejected` | Yes |

**Note:** Current V1.1 uses `received` as initial status. This maps to `submitted` in the V1.2 state model.

### 4.2 Valid Transitions Matrix

| From State | Valid To States |
|------------|-----------------|
| `draft` | `submitted` |
| `submitted` | `review_approved`, `revision_requested` |
| `review_approved` | `approved`, `rejected`, `escalated` |
| `revision_requested` | `submitted` |
| `approved` | `closed_approved` |
| `rejected` | `closed_rejected` |
| `escalated` | `resolved` |
| `resolved` | `approved`, `rejected` |
| `closed_approved` | *(none — terminal)* |
| `closed_rejected` | *(none — terminal)* |

### 4.3 V1.1 Compatibility Mapping

Current V1.1 uses `received` status. The trigger must handle this:

| V1.1 Status | V1.2 Equivalent | Notes |
|-------------|-----------------|-------|
| `received` | `submitted` | Treat as equivalent for transitions |

---

## 5. Technical Design

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
│  (UI validation remains unchanged — first line of defense)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase/PostgREST                        │
│                     (RLS policies unchanged)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE UPDATE Trigger                         │
│         validate_subsidy_case_transition()                       │
│         validate_housing_registration_transition()               │
│                                                                  │
│  1. Check if status column is being modified                    │
│  2. Validate OLD.status → NEW.status against matrix             │
│  3. If invalid: RAISE EXCEPTION + log audit_event               │
│  4. If valid: RETURN NEW (proceed with update)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Tables                           │
│           subsidy_case | housing_registration                    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Trigger Function: subsidy_case

```sql
-- Function: validate_subsidy_case_transition
-- Purpose: Enforce valid status transitions for Bouwsubsidie dossiers
-- Trigger: BEFORE UPDATE on subsidy_case

CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  valid_transitions jsonb := '{
    "draft": ["submitted"],
    "received": ["review_approved", "revision_requested", "submitted"],
    "submitted": ["review_approved", "revision_requested"],
    "review_approved": ["approved", "rejected", "escalated"],
    "revision_requested": ["submitted"],
    "approved": ["closed_approved"],
    "rejected": ["closed_rejected"],
    "escalated": ["resolved"],
    "resolved": ["approved", "rejected"],
    "closed_approved": [],
    "closed_rejected": []
  }'::jsonb;
  
  allowed_states text[];
  old_status text;
  new_status text;
BEGIN
  -- Only validate if status is changing
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    old_status := LOWER(COALESCE(OLD.status, 'draft'));
    new_status := LOWER(NEW.status);
    
    -- Get allowed transitions for current state
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(valid_transitions -> old_status)
    ) INTO allowed_states;
    
    -- Check if transition is valid
    IF new_status = ANY(allowed_states) THEN
      -- Valid transition - proceed
      RETURN NEW;
    ELSE
      -- Invalid transition - log and reject
      INSERT INTO public.audit_event (
        entity_type,
        entity_id,
        action,
        actor_user_id,
        actor_role,
        reason,
        metadata_json
      ) VALUES (
        'subsidy_case',
        OLD.id,
        'INVALID_TRANSITION_BLOCKED',
        auth.uid(),
        'system',
        format('Blocked invalid transition: %s → %s', old_status, new_status),
        jsonb_build_object(
          'from_status', old_status,
          'to_status', new_status,
          'allowed_transitions', allowed_states,
          'case_number', OLD.case_number,
          'district_code', OLD.district_code
        )
      );
      
      RAISE EXCEPTION 'Invalid status transition: % → %. Allowed: %', 
        old_status, new_status, array_to_string(allowed_states, ', ')
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger definition
CREATE TRIGGER trg_validate_subsidy_case_transition
  BEFORE UPDATE ON public.subsidy_case
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subsidy_case_transition();
```

### 5.3 Trigger Function: housing_registration

```sql
-- Function: validate_housing_registration_transition
-- Purpose: Enforce valid status transitions for Woning Registratie dossiers
-- Trigger: BEFORE UPDATE on housing_registration

CREATE OR REPLACE FUNCTION public.validate_housing_registration_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  valid_transitions jsonb := '{
    "draft": ["submitted"],
    "received": ["review_approved", "revision_requested", "submitted"],
    "submitted": ["review_approved", "revision_requested"],
    "review_approved": ["approved", "rejected", "escalated"],
    "revision_requested": ["submitted"],
    "approved": ["closed_approved"],
    "rejected": ["closed_rejected"],
    "escalated": ["resolved"],
    "resolved": ["approved", "rejected"],
    "closed_approved": [],
    "closed_rejected": []
  }'::jsonb;
  
  allowed_states text[];
  old_status text;
  new_status text;
BEGIN
  -- Only validate if current_status is changing
  IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
    old_status := LOWER(COALESCE(OLD.current_status, 'draft'));
    new_status := LOWER(NEW.current_status);
    
    -- Get allowed transitions for current state
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(valid_transitions -> old_status)
    ) INTO allowed_states;
    
    -- Check if transition is valid
    IF new_status = ANY(allowed_states) THEN
      -- Valid transition - proceed
      RETURN NEW;
    ELSE
      -- Invalid transition - log and reject
      INSERT INTO public.audit_event (
        entity_type,
        entity_id,
        action,
        actor_user_id,
        actor_role,
        reason,
        metadata_json
      ) VALUES (
        'housing_registration',
        OLD.id,
        'INVALID_TRANSITION_BLOCKED',
        auth.uid(),
        'system',
        format('Blocked invalid transition: %s → %s', old_status, new_status),
        jsonb_build_object(
          'from_status', old_status,
          'to_status', new_status,
          'allowed_transitions', allowed_states,
          'reference_number', OLD.reference_number,
          'district_code', OLD.district_code
        )
      );
      
      RAISE EXCEPTION 'Invalid status transition: % → %. Allowed: %', 
        old_status, new_status, array_to_string(allowed_states, ', ')
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger definition
CREATE TRIGGER trg_validate_housing_registration_transition
  BEFORE UPDATE ON public.housing_registration
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_housing_registration_transition();
```

---

## 6. Error Handling

### 6.1 Exception Format

When an invalid transition is attempted:

```
ERROR: Invalid status transition: draft → approved. Allowed: submitted
SQLSTATE: 23514 (check_violation)
```

### 6.2 Client-Side Handling

The UI must catch these exceptions and display user-friendly messages:

| Error Pattern | User Message |
|---------------|--------------|
| `Invalid status transition` | "Deze statusovergang is niet toegestaan. Neem contact op met uw supervisor." |

### 6.3 Audit Trail

Every blocked transition creates an audit record with:

| Field | Value |
|-------|-------|
| `action` | `INVALID_TRANSITION_BLOCKED` |
| `entity_type` | `subsidy_case` or `housing_registration` |
| `entity_id` | Dossier UUID |
| `actor_role` | `system` |
| `metadata_json` | Full context including attempted transition |

---

## 7. Migration Strategy

### 7.1 Pre-Migration Checks

Before applying triggers:

```sql
-- Check for dossiers in inconsistent states
SELECT id, status, case_number 
FROM subsidy_case 
WHERE status NOT IN (
  'draft', 'received', 'submitted', 'review_approved', 
  'revision_requested', 'approved', 'rejected', 
  'escalated', 'resolved', 'closed_approved', 'closed_rejected'
);

SELECT id, current_status, reference_number 
FROM housing_registration 
WHERE current_status NOT IN (
  'draft', 'received', 'submitted', 'review_approved', 
  'revision_requested', 'approved', 'rejected', 
  'escalated', 'resolved', 'closed_approved', 'closed_rejected'
);
```

### 7.2 Rollback Procedure

If issues are detected post-deployment:

```sql
-- Disable triggers (emergency rollback)
DROP TRIGGER IF EXISTS trg_validate_subsidy_case_transition 
  ON public.subsidy_case;
DROP TRIGGER IF EXISTS trg_validate_housing_registration_transition 
  ON public.housing_registration;

-- Optionally drop functions
DROP FUNCTION IF EXISTS public.validate_subsidy_case_transition();
DROP FUNCTION IF EXISTS public.validate_housing_registration_transition();
```

### 7.3 Migration Sequence

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Create restore point | Confirm in `/restore-points/v1.3/` |
| 2 | Run pre-migration checks | Zero invalid states |
| 3 | Create trigger functions | Functions exist |
| 4 | Create triggers | Triggers active |
| 5 | Test valid transition | Success |
| 6 | Test invalid transition | Blocked with audit |
| 7 | Verify audit event logged | Record exists |

---

## 8. Testing Requirements

### 8.1 Unit Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| T-01 | `draft` → `submitted` | ✅ Allowed |
| T-02 | `draft` → `approved` | ❌ Blocked |
| T-03 | `submitted` → `review_approved` | ✅ Allowed |
| T-04 | `submitted` → `closed_approved` | ❌ Blocked |
| T-05 | `review_approved` → `approved` | ✅ Allowed |
| T-06 | `review_approved` → `submitted` | ❌ Blocked |
| T-07 | `closed_approved` → `draft` | ❌ Blocked |
| T-08 | `closed_rejected` → `approved` | ❌ Blocked |
| T-09 | `received` → `review_approved` | ✅ Allowed (V1.1 compat) |
| T-10 | `escalated` → `resolved` | ✅ Allowed |

### 8.2 Integration Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| I-01 | UI submits valid transition | Success, status updated |
| I-02 | UI submits invalid transition | Error displayed, no change |
| I-03 | Edge Function updates status | Trigger validates |
| I-04 | Direct SQL attempt (admin) | Trigger still enforces |
| I-05 | Audit event created on block | Record in `audit_event` |

### 8.3 Regression Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| R-01 | Existing UI workflows unchanged | All pass |
| R-02 | Public wizard submissions | Still work |
| R-03 | Status history recording | Still works |
| R-04 | Audit logging | Unaffected |

---

## 9. Performance Impact

### 9.1 Analysis

| Aspect | Impact | Notes |
|--------|--------|-------|
| Read operations | NONE | Trigger only on UPDATE |
| Valid transitions | MINIMAL | Single JSONB lookup |
| Invalid transitions | MINIMAL | Audit INSERT + RAISE |
| Concurrent updates | NONE | Row-level trigger |

### 9.2 Benchmarks Required

Before production deployment:

- [ ] Measure update latency with trigger (target: <5ms overhead)
- [ ] Verify no deadlocks under concurrent updates
- [ ] Confirm audit_event INSERT performance

---

## 10. Security Considerations

### 10.1 SECURITY DEFINER

Triggers use `SECURITY DEFINER` to ensure:
- Consistent enforcement regardless of calling user
- Ability to INSERT into `audit_event` (which has restricted access)

### 10.2 SQL Injection Prevention

- Status values compared against hardcoded JSONB structure
- No dynamic SQL construction from user input
- `format()` used only for error messages with sanitized values

### 10.3 Bypass Prevention

| Attack Vector | Mitigation |
|---------------|------------|
| Direct SQL UPDATE | Trigger fires regardless |
| PostgREST bypass | Trigger at DB level |
| RLS bypass (admin) | Trigger still enforces |
| Function replacement | Only `system_admin` can modify functions |

---

## 11. Dependencies

### 11.1 Required Before Implementation

| Dependency | Status | Notes |
|------------|--------|-------|
| V1.3 Authorization | PENDING | This specification requires approval |
| V1.1 Baseline Stable | ✅ | Confirmed operational |
| State model approved | ✅ | V1.2 documentation complete |

### 11.2 No Dependencies On

| Item | Reason |
|------|--------|
| S-01 Financial Assessment | Independent implementation |
| S-02 Allocation Workflow | Independent implementation |
| S-03 Notifications | Notifications can use triggers later |

---

## 12. Governance Compliance

### 12.1 Guardian Rules

| Rule | Compliance |
|------|------------|
| No custom UI systems | ✅ N/A — Backend only |
| Darkone Admin 1:1 | ✅ N/A — Backend only |
| Government-grade RLS | ✅ RLS unchanged |
| Full auditability | ✅ Enhanced by this spec |

### 12.2 Audit Requirements

This implementation enhances audit coverage by:
- Logging all invalid transition attempts
- Capturing full context in `metadata_json`
- Attributing to system actor for trigger-level blocks

---

## 13. Deliverables

| Deliverable | Type | Location |
|-------------|------|----------|
| Migration SQL | File | `supabase/migrations/YYYYMMDD_d01_transition_enforcement.sql` |
| Rollback SQL | File | `supabase/migrations/YYYYMMDD_d01_transition_enforcement_rollback.sql` |
| Test Suite | File | `supabase/functions/_tests/transition_enforcement.test.ts` |
| Restore Point | File | `/restore-points/v1.3/RESTORE_POINT_D01_PRE_IMPLEMENTATION.md` |

---

## 14. Implementation Checklist

```markdown
## D-01 Implementation Checklist

### Pre-Implementation
- [ ] V1.3 authorized by Project Owner
- [ ] Restore point created
- [ ] Pre-migration checks passed (zero invalid states)
- [ ] Test environment prepared

### Implementation
- [ ] Create validate_subsidy_case_transition function
- [ ] Create validate_housing_registration_transition function
- [ ] Create subsidy_case trigger
- [ ] Create housing_registration trigger

### Verification
- [ ] All unit tests pass (T-01 through T-10)
- [ ] All integration tests pass (I-01 through I-05)
- [ ] All regression tests pass (R-01 through R-04)
- [ ] Performance benchmarks acceptable
- [ ] Audit events logging correctly

### Post-Implementation
- [ ] Update V1.3 phase documentation
- [ ] Close D-01 in deferred items manifest
- [ ] Create completion restore point
```

---

## 15. Approval Gate

This specification requires explicit authorization before implementation.

**No database changes are authorized by this document.**

**Awaiting explicit authorization to implement D-01.**

---

*Document Author: DVH-IMS System*  
*Date: 2026-01-30*  
*Authority: Pending Delroy Approval*

---

**END OF DOCUMENT**
