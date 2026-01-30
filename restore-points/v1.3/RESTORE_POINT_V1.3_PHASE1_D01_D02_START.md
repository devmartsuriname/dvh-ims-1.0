# RESTORE POINT: V1.3 Phase 1 — D-01 + D-02 Start

**Restore Point ID:** RESTORE_POINT_V1.3_PHASE1_D01_D02_START  
**Created:** 2026-01-30  
**Type:** PHASE START  
**Version:** V1.3  
**Phase:** Phase 1 — Backend Enforcement + Audit Hardening

---

## 1. Authorization Reference

| Item | Value |
|------|-------|
| Authorization Document | V1.3 Authorization Decision |
| Selected Option | OPTION B — Enforcement + Audit Hardening |
| Authorized Items | D-01, D-02 |
| Operational Baseline | DVH-IMS V1.1 |
| Documentation Baseline | DVH-IMS V1.2 (FROZEN) |

---

## 2. Pre-Implementation State

### 2.1 Database Schema — audit_event

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
| correlation_id | uuid | **NOT EXISTS** (to be added) |

### 2.2 Database Triggers — subsidy_case

| Trigger | Status |
|---------|--------|
| Transition enforcement trigger | NOT EXISTS (to be added) |

### 2.3 Database Triggers — housing_registration

| Trigger | Status |
|---------|--------|
| Transition enforcement trigger | NOT EXISTS (to be added) |

### 2.4 Current Data State

| Table | Record Count |
|-------|--------------|
| subsidy_case | 0 |
| housing_registration | 0 |
| audit_event | ~29+ (preserved from V1.1) |

---

## 3. Authorized Changes

### 3.1 D-02: Audit Hardening

| Change | Type | Target |
|--------|------|--------|
| Add correlation_id column | DDL | audit_event |
| Add correlation_id index | DDL | audit_event |

### 3.2 D-01: Backend Transition Enforcement

| Change | Type | Target |
|--------|------|--------|
| Create validate_subsidy_case_transition() | DDL | Function |
| Create validate_housing_registration_transition() | DDL | Function |
| Attach trg_validate_subsidy_case_transition | DDL | subsidy_case |
| Attach trg_validate_housing_registration_transition | DDL | housing_registration |

---

## 4. Explicit Exclusions

The following are NOT authorized and must NOT be changed:

- UI components
- RLS policies
- Role definitions (app_role enum)
- Edge Functions
- Public wizard components
- Any tables other than those listed above

---

## 5. Rollback Procedure

If rollback is required, execute the following SQL:

```sql
-- Step 1: Remove triggers
DROP TRIGGER IF EXISTS trg_validate_subsidy_case_transition 
  ON public.subsidy_case;
DROP TRIGGER IF EXISTS trg_validate_housing_registration_transition 
  ON public.housing_registration;

-- Step 2: Remove functions
DROP FUNCTION IF EXISTS public.validate_subsidy_case_transition();
DROP FUNCTION IF EXISTS public.validate_housing_registration_transition();

-- Step 3: Remove correlation_id column (optional, only if needed)
-- ALTER TABLE public.audit_event DROP COLUMN IF EXISTS correlation_id;
```

---

## 6. Verification Checkpoints

| Checkpoint | Expected After Implementation |
|------------|-------------------------------|
| correlation_id column exists | YES |
| subsidy_case trigger exists | YES |
| housing_registration trigger exists | YES |
| Invalid transitions blocked | YES |
| Audit events logged for blocks | YES |
| V1.1 functional behavior preserved | YES |

---

## 7. Governance Compliance

| Rule | Status |
|------|--------|
| Restore point created before implementation | ✓ COMPLIANT |
| Scope limited to D-01 + D-02 | ✓ ENFORCED |
| Rollback procedure documented | ✓ DOCUMENTED |
| Authorization basis referenced | ✓ REFERENCED |

---

## 8. Sign-Off

**Restore Point Created By:** DVH-IMS System  
**Date:** 2026-01-30  
**Authorization:** V1.3 Authorization Decision — OPTION B

---

**IMPLEMENTATION MAY NOW PROCEED**

---

**END OF RESTORE POINT**
