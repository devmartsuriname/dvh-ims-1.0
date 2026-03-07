# VolksHuisvesting IMS — Security, RLS & Roles Status Report

**Version:** v2.0
**Status:** COMPLETE
**Last Updated:** 2026-03-07
**Audit Type:** Evidence-Based Documentation
**Phase:** Post Phase 7 Security Hardening (v1.8)

---

## 1. Role System

### 1.1 Role Enum Definition

**Source:** Migration `20260109002014_add_rbac_and_district_scoping.sql` + subsequent extensions

```sql
CREATE TYPE public.app_role AS ENUM (
  'system_admin',
  'minister',
  'project_leader',
  'frontdesk_bouwsubsidie',
  'frontdesk_housing',
  'admin_staff',
  'audit',
  'social_field_worker',
  'technical_inspector',
  'director',
  'ministerial_advisor'
);
```

### 1.2 Role Descriptions

| Role | Scope | Description |
|------|-------|-------------|
| `system_admin` | National | Full system access, user/role management |
| `minister` | National | Approval authority, read access, decision-making |
| `project_leader` | National | Full operational access, allocation execution |
| `frontdesk_bouwsubsidie` | District | Construction subsidy intake and processing |
| `frontdesk_housing` | District | Housing registration intake and processing |
| `admin_staff` | District | Cross-module administrative support |
| `audit` | National | Read-only governance access |
| `social_field_worker` | District | Social report authoring |
| `technical_inspector` | District | Technical inspection reports |
| `director` | National | Oversight and read access |
| `ministerial_advisor` | National | Advisory read access |

### 1.3 Role Assignment

**Table:** `user_roles` (separate from `app_user_profile`)

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);
```

---

## 2. Security Functions (SECURITY DEFINER)

| Function | Purpose |
|----------|---------|
| `has_role(_user_id, _role)` | Check if user has specific role |
| `has_any_role(_user_id, _roles[])` | Check if user has any of specified roles |
| `get_user_district(_user_id)` | Get user's assigned district code |
| `is_national_role(_user_id)` | Check if user has national-level role |

All use `SECURITY DEFINER` + `SET search_path = public` to prevent RLS recursion.

---

## 3. Phase 7 Security Hardening (v1.8)

### 3.1 Migrations Applied

| # | Migration | Severity | Status |
|---|-----------|----------|--------|
| A | Drop `anon_can_select_public_status_access` on `public_status_access` | HIGH | ✅ APPLIED |
| B | Replace `Users can update own profile` on `app_user_profile` (restrict `district_code` + `is_active`) | MEDIUM | ✅ APPLIED |
| C | Add `role_insert_housing_document_upload` on `housing_document_upload` | MEDIUM | ✅ APPLIED |

### 3.2 Leaked Password Protection

**Status:** ✅ ENABLED
**Location:** Supabase Dashboard → Auth → Security
**Tier:** Supabase Pro

### 3.3 Anonymous Policy Removal History

| Version | Removed | Remaining |
|---------|---------|-----------|
| v1.5 | 12 anon INSERT policies | Anon SELECT + storage |
| v1.7 | 6 anon SELECT/INSERT policies | `anon_can_select_public_status_access` + storage |
| v1.8 | `anon_can_select_public_status_access` | Storage bucket policies only |

**Current state:** Zero `anon_` policies on application tables. Only storage bucket anon policies remain (design-intentional for public wizard uploads).

---

## 4. RLS Status Summary

| Category | Tables | RLS Enabled | DELETE Policies |
|----------|--------|-------------|-----------------|
| Shared Core | 5 | 5/5 (100%) | 0 (by design) |
| Bouwsubsidie | 7 | 7/7 (100%) | 0 (by design) |
| Housing | 5 | 5/5 (100%) | 0 (by design) |
| Allocation | 5 | 5/5 (100%) | 0 (by design) |
| System | 4 | 4/4 (100%) | 1 (`user_roles` only) |
| Additional | 3 | 3/3 (100%) | 0 (by design) |
| **TOTAL** | **29** | **29/29 (100%)** | **1** |

---

## 5. Edge Functions & Service Role Usage

| Function | Auth | Service Role | Internal RBAC | Risk |
|----------|------|--------------|---------------|------|
| `submit-bouwsubsidie-application` | ❌ Public | ✅ | ❌ N/A | ACCEPTED: Rate-limited, Zod validated |
| `submit-housing-registration` | ❌ Public | ✅ | ❌ N/A | ACCEPTED: Rate-limited, Zod validated |
| `lookup-public-status` | ❌ Public | ✅ | ❌ Token-validated | ACCEPTED: SHA-256 hash, rate-limited |
| `execute-allocation-run` | ✅ JWT | ✅ | ✅ `system_admin`, `project_leader` | ACCEPTED: Strict RBAC |
| `generate-raadvoorstel` | ✅ JWT | ✅ | ✅ Role-checked | ACCEPTED: District-scoped |
| `get-document-download-url` | ✅ JWT | ✅ | ✅ `ALLOWED_ROLES` array | ACCEPTED: Signed URL, time-limited |

---

## 6. Route Protection

| Route Pattern | Protection |
|---------------|------------|
| `/dashboards`, `/persons/*`, `/subsidy-cases/*`, `/housing-registrations/*`, `/allocation-*`, `/audit-log` | `isAuthenticated` + role-based menu filtering |
| `/`, `/bouwsubsidie/*`, `/housing/*`, `/status` | Public (no auth) |

---

## 7. Immutable Records (Audit Compliance)

| Table | Reason |
|-------|--------|
| `subsidy_case_status_history` | Audit trail integrity |
| `housing_registration_status_history` | Audit trail integrity |
| `housing_urgency` | Assessment record immutability |
| `allocation_candidate` | Run results immutability |
| `allocation_decision` | Decision record immutability |
| `assignment_record` | Assignment record immutability |
| `generated_document` | Document generation immutability |
| `audit_event` | Core audit log immutability |

---

## 8. Security Conclusion

### 8.1 Checklist

| Criterion | Status |
|-----------|--------|
| RLS enabled on all 29 tables | ✅ PASS |
| SECURITY DEFINER functions prevent recursion | ✅ PASS |
| District scoping enforced | ✅ PASS |
| No hardcoded role checks in UI | ✅ PASS |
| Audit log immutable | ✅ PASS |
| Status history immutable | ✅ PASS |
| Service role justified | ✅ PASS |
| Roles stored in separate table | ✅ PASS |
| No client-side role storage | ✅ PASS |
| No anonymous SELECT on application tables | ✅ PASS |
| `app_user_profile` self-update restricted | ✅ PASS |
| Leaked password protection enabled | ✅ PASS |

### 8.2 Final Status

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   SECURITY MODEL STATUS: HARDENED (v1.8)                   ║
║                                                            ║
║   • 29/29 tables have RLS enabled                          ║
║   • 11-role RBAC system implemented                        ║
║   • District scoping enforced                              ║
║   • Zero anonymous policies on application tables          ║
║   • Leaked password protection enabled                     ║
║   • Audit compliance maintained                            ║
║   • Phase 7 hardening: 3 migrations applied                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Change History

| Date | Version | Change |
|------|---------|--------|
| 2026-01-24 | v1.1 | Initial security status report |
| 2026-03-07 | v2.0 | Phase 7 hardening, updated role count (11), updated table count (29), anon policy removal complete |

---

**End of Security, RLS & Roles Status Report**
