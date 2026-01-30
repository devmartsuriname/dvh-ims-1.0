# Restore Point: V1.3 Phase 4A Start

## Restore Point ID: RESTORE_POINT_V1.3_PHASE4A_START
## Created: 2026-01-30
## Phase: V1.3 Phase 4A — Social Field Worker Activation (Bouwsubsidie Only)

---

## 1. Purpose

This restore point is created BEFORE implementing Phase 4A, which activates the Social Field Worker role for Bouwsubsidie service only.

---

## 2. Pre-Phase State

### 2.1 Database State

| Component | Current State |
|-----------|---------------|
| app_role enum | 7 values (system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit) |
| subsidy_case transition trigger | V1.1 state machine (received → screening → fieldwork → approved_for_council → council_doc_generated → finalized) |
| housing_registration trigger | V1.1 state machine (unchanged) |
| RLS policies | Standard role-based access |
| audit_event table | correlation_id column present |
| admin_notification table | Operational (S-03) |

### 2.2 Application State

| Component | Current State |
|-----------|---------------|
| AppRole type (useUserRole.ts) | 7 roles defined |
| EntityType (useAuditLog.ts) | Standard entity types |
| Subsidy case status transitions | V1.1 transitions |
| v12-roles.ts | Prepared roles (NOT imported) |

---

## 3. Phase 4A Scope

### 3.1 Authorized Changes

| Change | Scope |
|--------|-------|
| Add social_field_worker to app_role enum | Database |
| Update validate_subsidy_case_transition() | New social review states |
| Create RLS policies for social_field_worker | Bouwsubsidie only |
| Update AppRole type | TypeScript |
| Add status transitions for social review | UI |

### 3.2 Unchanged Components

| Component | Status |
|-----------|--------|
| housing_registration trigger | NO CHANGES |
| Woningregistratie workflow | NO CHANGES |
| Existing 7 roles | UNCHANGED |
| UI navigation/menus | NO CHANGES |

---

## 4. Recovery Instructions

### 4.1 If Migration Fails

```sql
-- Drop any created RLS policies
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

-- Note: Enum value cannot be removed once added, but will be inert without policies
```

### 4.2 Application Rollback

1. Revert TypeScript changes to useUserRole.ts
2. Revert status transition changes to subsidy-cases/[id]/page.tsx
3. Redeploy previous version

---

## 5. Verification Before Proceeding

- [x] Phase 3 closed and locked
- [x] V1.1 system operational
- [x] Backup documentation complete
- [x] Rollback plan documented

---

## 6. Authorization

| Item | Status |
|------|--------|
| Phase 4A Authorization | ✓ APPROVED |
| Scope Constraint | Bouwsubsidie ONLY |
| Role Activation | social_field_worker ONLY |

---

**RESTORE POINT CREATED — PHASE 4A IMPLEMENTATION MAY PROCEED**
