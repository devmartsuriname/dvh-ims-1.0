# RESTORE POINT: V1.3 Phase 4C START

## Document Type: Pre-Implementation Restore Point
## Version: 1.0
## Date: 2026-02-01
## Phase: Phase 4C — Administrative Officer Workflow Activation (Bouwsubsidie Only)

---

## 1. Restore Point ID

**ID:** `V1.3_PHASE4C_START`
**Created:** 2026-02-01
**Status:** ACTIVE

---

## 2. System State at Restore Point

### 2.1 Database State

| Component | Status | Details |
|-----------|--------|---------|
| app_role enum | 9 values | system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit, social_field_worker, technical_inspector |
| validate_subsidy_case_transition | Phase 4B version | Includes technical inspection states |
| validate_housing_registration_transition | Phase 1 version | Unchanged |
| RLS Policies | Phase 4B state | 12 technical_inspector policies active |

### 2.2 Application State

| File | State | Version |
|------|-------|---------|
| src/hooks/useUserRole.ts | Phase 4B | Includes technical_inspector |
| src/hooks/useAuditLog.ts | Phase 4B | Includes TECHNICAL_INSPECTION_* actions |
| src/app/(admin)/subsidy-cases/[id]/page.tsx | Phase 4B | Includes technical review statuses |

### 2.3 Bouwsubsidie Workflow (Pre-Phase 4C)

```text
received → in_social_review → social_completed → in_technical_review → 
           technical_approved → screening → needs_more_docs/fieldwork → 
           approved_for_council → council_doc_generated → finalized
           (any non-terminal) → rejected
```

---

## 3. Phase 4C Scope

### 3.1 Authorized Changes

| Item | Action |
|------|--------|
| Backend trigger | UPDATE to add admin review states |
| AuditAction type | ADD ADMIN_REVIEW_STARTED, ADMIN_REVIEW_COMPLETED, ADMIN_REVIEW_RETURNED |
| UI status badges | ADD in_admin_review, admin_complete, returned_to_technical |
| UI transitions | UPDATE to include admin review paths |

### 3.2 NOT Authorized

| Item | Status |
|------|--------|
| app_role enum | NO CHANGE (admin_staff already exists) |
| RLS policies | NO CHANGE (existing policies sufficient) |
| Woningregistratie | NO CHANGE |
| UI navigation | NO CHANGE |

---

## 4. Rollback Procedure

### 4.1 Database Rollback

```sql
-- Revert trigger to Phase 4B version
CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
-- Phase 4B trigger code here
$function$;
```

### 4.2 Application Rollback

1. Revert src/hooks/useAuditLog.ts to Phase 4B version
2. Revert src/app/(admin)/subsidy-cases/[id]/page.tsx to Phase 4B version

---

## 5. Verification at Restore Point

| Check | Status |
|-------|--------|
| All 9 roles functional | ✓ |
| Technical Inspector workflow active | ✓ |
| Social Field Worker workflow active | ✓ |
| Woningregistratie workflow unchanged | ✓ |
| Audit logging functional | ✓ |

---

## 6. Authorization

**Phase 4C implementation authorized by:** Delroy
**Restore point created by:** Lovable
**Date:** 2026-02-01

---

**END OF RESTORE POINT**
