# Restore Point: V1.3 Phase 4A Complete

## Restore Point ID: RESTORE_POINT_V1.3_PHASE4A_COMPLETE
## Created: 2026-01-30
## Phase: V1.3 Phase 4A — Social Field Worker Activation (Bouwsubsidie Only)

---

## 1. Purpose

This restore point is created AFTER successful completion of Phase 4A, which activated the Social Field Worker role for Bouwsubsidie service only.

---

## 2. Post-Phase State

### 2.1 Database State

| Component | Current State |
|-----------|---------------|
| app_role enum | 8 values (system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit, **social_field_worker**) |
| subsidy_case transition trigger | V1.3 Phase 4A state machine (includes social review states) |
| housing_registration trigger | V1.1 state machine (UNCHANGED) |
| RLS policies | 12 new policies for social_field_worker |
| audit_event table | correlation_id column present |
| admin_notification table | Operational (S-03) |

### 2.2 Application State

| Component | Current State |
|-----------|---------------|
| AppRole type (useUserRole.ts) | 8 roles defined (includes social_field_worker) |
| AuditAction type (useAuditLog.ts) | Includes social assessment actions |
| Subsidy case status transitions | V1.3 Phase 4A transitions |
| v12-roles.ts | Prepared roles (NOT imported) |

---

## 3. Changes Made in Phase 4A

### 3.1 Database Changes

| Change | Details |
|--------|---------|
| Enum extension | Added `social_field_worker` to `app_role` |
| Trigger update | Updated `validate_subsidy_case_transition()` with 4 new states |
| RLS policies | Created 12 policies for social_field_worker |

### 3.2 New Status Values

| Status | Description |
|--------|-------------|
| `in_social_review` | Case is being reviewed by Social Field Worker |
| `social_completed` | Social assessment completed |
| `returned_to_intake` | Returned to intake for additional information |

### 3.3 TypeScript Changes

| File | Change |
|------|--------|
| `src/hooks/useUserRole.ts` | Added `social_field_worker` to AppRole |
| `src/hooks/useAuditLog.ts` | Added social assessment audit actions |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Added new status transitions and badges |

---

## 4. Unchanged Components

| Component | Status |
|-----------|--------|
| Woningregistratie workflow | NO CHANGES |
| `validate_housing_registration_transition()` trigger | NO CHANGES |
| UI navigation/menus | NO CHANGES |
| Existing 7 roles | UNCHANGED permissions |

---

## 5. Verification Status

| Test Category | Result |
|---------------|--------|
| Database | ✅ PASS |
| Trigger | ✅ PASS |
| Backward Compatibility | ✅ PASS |
| TypeScript | ✅ PASS |
| UI | ✅ PASS |
| Audit | ✅ PASS |
| Security | ✅ PASS |

---

## 6. Rollback Instructions

### 6.1 To Rollback to Phase 4A Start

```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "social_field_worker_select_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "social_field_worker_update_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "social_field_worker_select_person" ON public.person;
DROP POLICY IF EXISTS "social_field_worker_select_household" ON public.household;
DROP POLICY IF EXISTS "social_field_worker_select_social_report" ON public.social_report;
DROP POLICY IF EXISTS "social_field_worker_insert_social_report" ON public.social_report;
DROP POLICY IF EXISTS "social_field_worker_update_social_report" ON public.social_report;
DROP POLICY IF EXISTS "social_field_worker_insert_audit_event" ON public.audit_event;
DROP POLICY IF EXISTS "social_field_worker_select_admin_notification" ON public.admin_notification;
DROP POLICY IF EXISTS "social_field_worker_update_admin_notification" ON public.admin_notification;
DROP POLICY IF EXISTS "social_field_worker_insert_subsidy_status_history" ON public.subsidy_case_status_history;
DROP POLICY IF EXISTS "social_field_worker_select_subsidy_status_history" ON public.subsidy_case_status_history;

-- Revert trigger to V1.1 state machine
-- (Re-run Phase 1 trigger creation SQL)

-- Note: Enum value cannot be removed, but will be inert without policies
```

---

## 7. Next Phase Authorization

**Phase 4B: Technical Inspector Activation (Bouwsubsidie Only)**

Prerequisites:
- Explicit authorization from Delroy
- Database enum extension (if not already added)
- RLS policy creation
- TypeScript updates

**Status:** AWAITING AUTHORIZATION

---

**RESTORE POINT CREATED — PHASE 4A COMPLETE**
