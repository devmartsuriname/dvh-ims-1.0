# RLS Policy Matrix — VolksHuisvesting IMS

**Version:** 2.0
**Last Updated:** 2026-03-07
**Security Model:** RBAC with district scoping
**Phase:** Post Phase 7 Security Hardening (v1.8)

---

## Security Model Overview

| Attribute | Value |
|-----------|-------|
| Security Model | RBAC (Role-Based Access Control) |
| Role System | `app_role` enum (11 roles) |
| Role Storage | `user_roles` table (separate from profile) |
| District Scoping | `get_user_district()` SECURITY DEFINER function |
| RLS Enforcement | Mandatory on all tables |
| Default Access | Deny all unless explicitly permitted |
| DELETE Policies | None (by design — immutable records) |

---

## RBAC Functions (SECURITY DEFINER)

| Function | Purpose |
|----------|---------|
| `has_role(_user_id, _role)` | Check if user has specific role |
| `has_any_role(_user_id, _roles[])` | Check if user has any of specified roles |
| `get_user_district(_user_id)` | Get user's assigned district code |
| `is_national_role(_user_id)` | Check if user has national-level role |

All functions use `SECURITY DEFINER` + `SET search_path = public` to bypass RLS and prevent recursion.

---

## Role Definitions

| Role | Scope | Module Access |
|------|-------|---------------|
| `system_admin` | National | All |
| `minister` | National | All (read + approval) |
| `project_leader` | National | All (read/write + allocation) |
| `frontdesk_bouwsubsidie` | District | Bouwsubsidie only |
| `frontdesk_housing` | District | Housing only |
| `admin_staff` | District | Both modules |
| `audit` | National | Read-only all |
| `social_field_worker` | District | Bouwsubsidie (reports) |
| `technical_inspector` | District | Bouwsubsidie (reports) |
| `director` | National | Read + oversight |
| `ministerial_advisor` | National | Read + advisory |

---

## RLS Policy Summary by Table

### Shared Core Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `person` | ✅ | `role_select_person` | `role_insert_person` | `role_update_person` | ❌ |
| `household` | ✅ | `role_select_household` | `role_insert_household` | `role_update_household` | ❌ |
| `household_member` | ✅ | `role_select_household_member` | `role_insert_household_member` | `role_update_household_member` | ❌ |
| `address` | ✅ | `role_select_address` | `role_insert_address` | `role_update_address` | ❌ |
| `contact_point` | ✅ | `role_select_contact_point` | `role_insert_contact_point` | `role_update_contact_point` | ❌ |

### Bouwsubsidie Module Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `subsidy_case` | ✅ | `role_select_subsidy_case` | `role_insert_subsidy_case` | `role_update_subsidy_case` | ❌ |
| `subsidy_case_status_history` | ✅ | `role_select_subsidy_case_status_history` | `role_insert_subsidy_case_status_history` | ❌ (immutable) | ❌ |
| `subsidy_document_requirement` | ✅ | `role_select_subsidy_document_requirement` | `role_insert_subsidy_document_requirement` | `role_update_subsidy_document_requirement` | ❌ |
| `subsidy_document_upload` | ✅ | `role_select_subsidy_document_upload` | `role_insert_subsidy_document_upload` | `role_update_subsidy_document_upload` | ❌ |
| `social_report` | ✅ | `role_select_social_report` | `role_insert_social_report` | `role_update_social_report` | ❌ |
| `technical_report` | ✅ | `role_select_technical_report` | `role_insert_technical_report` | `role_update_technical_report` | ❌ |
| `generated_document` | ✅ | `role_select_generated_document` | `role_insert_generated_document` | ❌ (immutable) | ❌ |

### Housing Module Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `housing_registration` | ✅ | `role_select_housing_registration` | `role_insert_housing_registration` | `role_update_housing_registration` | ❌ |
| `housing_registration_status_history` | ✅ | `role_select_housing_registration_status_history` | `role_insert_housing_registration_status_history` | ❌ (immutable) | ❌ |
| `housing_urgency` | ✅ | `role_select_housing_urgency` | `role_insert_housing_urgency` | ❌ (immutable) | ❌ |
| `housing_document_requirement` | ✅ | `role_select_housing_document_requirement` | `role_insert_housing_document_requirement` | `role_update_housing_document_requirement` | ❌ |
| `housing_document_upload` | ✅ | `role_select_housing_document_upload` | `role_insert_housing_document_upload` | `role_update_housing_document_upload` | ❌ |

### Allocation Engine Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `allocation_run` | ✅ | `role_select_allocation_run` | `role_insert_allocation_run` | `role_update_allocation_run` | ❌ |
| `allocation_candidate` | ✅ | `role_select_allocation_candidate` | `role_insert_allocation_candidate` | ❌ (immutable) | ❌ |
| `allocation_decision` | ✅ | `role_select_allocation_decision` | `role_insert_allocation_decision` | ❌ (immutable) | ❌ |
| `assignment_record` | ✅ | `role_select_assignment_record` | `role_insert_assignment_record` | ❌ (immutable) | ❌ |
| `district_quota` | ✅ | `role_select_district_quota` | `role_insert_district_quota` | `role_update_district_quota` | ❌ |

### System Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `public_status_access` | ✅ | `role_select_public_status_access` | `role_insert_public_status_access` | `role_update_public_status_access` | ❌ |
| `audit_event` | ✅ | `role_select_audit_event` | `role_insert_audit_event` | ❌ (immutable) | ❌ |
| `app_user_profile` | ✅ | `Users can read own profile`, `role_select_all_app_user_profile` | `role_insert_app_user_profile` | `Users can update own profile` (restricted), `role_update_all_app_user_profile` | ❌ |
| `user_roles` | ✅ | `system_admin_select_user_roles`, `users_read_own_roles` | `system_admin_insert_user_roles` | `system_admin_update_user_roles` | `system_admin_delete_user_roles` |
| `admin_notification` | ✅ | Role-based | Role-based | Role-based | ❌ |

### Additional Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `case_assignment` | ✅ | Role-based | Role-based | Role-based | ❌ |
| `inspection_visit` | ✅ | Role-based | Role-based | Role-based | ❌ |
| `subsidy_household_child` | ✅ | Role-based | Role-based | Role-based | ❌ |

### Storage Buckets

| Bucket | anon READ | anon UPLOAD | Notes |
|--------|-----------|-------------|-------|
| `citizen-documents` | ✅ `anon_can_read_citizen_documents` | ✅ `anon_can_upload_citizen_documents` | Design-intentional: public wizard uploads |

---

## Policy Pattern: RBAC with District Scoping

```sql
-- National roles: full access
has_role(auth.uid(), 'system_admin'::app_role)
OR has_role(auth.uid(), 'project_leader'::app_role)

-- District roles: scoped by district_code
OR (
  has_any_role(auth.uid(), ARRAY['frontdesk_bouwsubsidie', 'admin_staff']::app_role[])
  AND table.district_code = get_user_district(auth.uid())
)
```

---

## Phase 7 Security Hardening Changes (v1.8)

| Change | Severity | Migration |
|--------|----------|-----------|
| Dropped `anon_can_select_public_status_access` | HIGH | Migration A |
| Restricted `Users can update own profile` (prevent `district_code`/`is_active` self-modification) | MEDIUM | Migration B |
| Added `role_insert_housing_document_upload` | MEDIUM | Migration C |

---

## Removed Anonymous Policies (Cumulative)

| Version | Policies Removed | Reason |
|---------|-----------------|--------|
| v1.5 | 12 anonymous INSERT policies | Edge Functions use service role key |
| v1.7 | 6 anonymous SELECT/INSERT policies | Edge Functions bypass RLS |
| v1.8 | `anon_can_select_public_status_access` | Edge Function uses service role key |

**Remaining anon policies:** Storage bucket policies only (design-intentional for public wizard uploads).

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| No DELETE policies | Immutable records for audit compliance |
| No UPDATE on history tables | Append-only pattern for status tracking |
| SECURITY DEFINER functions | Prevent RLS recursion |
| District scoping via `get_user_district()` | Operational role isolation |
| Service role for Edge Functions | Public intake requires RLS bypass |

---

## Verification Checklist

- [x] All tables have RLS enabled
- [x] All policies use RBAC pattern (`has_role` / `has_any_role`)
- [x] No anonymous SELECT on application tables
- [x] Append-only tables have no UPDATE/DELETE
- [x] `app_user_profile` self-update restricted (no `district_code`/`is_active` modification)
- [x] Roles stored in separate `user_roles` table
- [x] No client-side role storage (roles fetched via `useUserRole` hook)
- [x] Leaked password protection enabled (Supabase Pro tier)

---

## Change History

| Date | Change | Version |
|------|--------|---------|
| 2026-01-07 | Initial RLS matrix (Allowlist model) | v1.0 |
| 2026-01-09 | RBAC migration — replaced allowlist with `has_role()` | v1.1 |
| 2026-02-27 | Removed 6 redundant anon policies | v1.7 |
| 2026-03-07 | Phase 7 Security Hardening — 3 migrations applied | v2.0 |

---

**End of RLS Policy Matrix**
