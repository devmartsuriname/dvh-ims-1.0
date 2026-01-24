# VolksHuisvesting IMS — Security, RLS & Roles Status Report

**Version:** v1.1  
**Status:** COMPLETE  
**Last Updated:** 2026-01-24  
**Audit Type:** Evidence-Based Documentation

---

## 1. Role System

### 1.1 Role Enum Definition

**Source:** Migration `20260109002014_add_rbac_and_district_scoping.sql`

```sql
CREATE TYPE public.app_role AS ENUM (
  'system_admin',
  'minister',
  'project_leader',
  'frontdesk_bouwsubsidie',
  'frontdesk_housing',
  'admin_staff',
  'audit'
);
```

### 1.2 Role Descriptions

| Role | Scope | Description | Evidence |
|------|-------|-------------|----------|
| `system_admin` | National | Full system access, user/role management | RLS policies use `has_role(auth.uid(), 'system_admin')` |
| `minister` | National | Approval authority, read access, decision-making | RLS allows INSERT on `allocation_decision` |
| `project_leader` | National | Full operational access, allocation execution | Can execute allocation runs |
| `frontdesk_bouwsubsidie` | District | Construction subsidy intake and processing | District-scoped via `get_user_district()` |
| `frontdesk_housing` | District | Housing registration intake and processing | District-scoped via `get_user_district()` |
| `admin_staff` | District | Cross-module administrative support | District-scoped, both module access |
| `audit` | National | Read-only governance access | SELECT only on `audit_event` |

### 1.3 Role Assignment Mechanism

**Table:** `user_roles`  
**Source:** Migration `20260109002014_add_rbac_and_district_scoping.sql`

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

**User Profile Table:** `app_user_profile`
- Links `user_id` to `district_code`
- Used by `get_user_district()` function

---

## 2. Security Functions (SECURITY DEFINER)

All role-checking functions use `SECURITY DEFINER` to bypass RLS and prevent recursion.

| Function | Purpose | Source |
|----------|---------|--------|
| `has_role(_user_id UUID, _role app_role)` | Check if user has specific role | Migration `20260109002014` |
| `has_any_role(_user_id UUID, _roles app_role[])` | Check if user has any of specified roles | Migration `20260109002014` |
| `get_user_district(_user_id UUID)` | Get user's assigned district code | Migration `20260109002014` |
| `is_national_role(_user_id UUID)` | Check if user has national-level role | Migration `20260109002014` |

### Function Definitions

```sql
-- has_role: Single role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- is_national_role: National scope check
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('system_admin', 'minister', 'project_leader', 'audit')
  )
$$;

-- get_user_district: District lookup
CREATE OR REPLACE FUNCTION public.get_user_district(_user_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_code FROM public.app_user_profile
  WHERE user_id = _user_id
$$;
```

---

## 3. RLS Status Per Table

### 3.1 Summary

| Category | Tables | RLS Enabled | DELETE Policies |
|----------|--------|-------------|-----------------|
| Shared Core | 5 | 5/5 (100%) | 0 (by design) |
| Bouwsubsidie | 6 | 6/6 (100%) | 0 (by design) |
| Housing | 5 | 5/5 (100%) | 0 (by design) |
| Allocation | 5 | 5/5 (100%) | 0 (by design) |
| System | 3 | 3/3 (100%) | 1 (user_roles only) |
| **TOTAL** | **24** | **24/24 (100%)** | **1** |

### 3.2 Detailed RLS Matrix

#### Shared Core Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `person` | ✅ | `role_select_person`, `anon_can_select_person_for_status` | `role_insert_person`, `anon_can_insert_person` | `role_update_person` | ❌ None |
| `household` | ✅ | `role_select_household` | `role_insert_household`, `anon_can_insert_household` | `role_update_household` | ❌ None |
| `household_member` | ✅ | `role_select_household_member` | `role_insert_household_member`, `anon_can_insert_household_member` | `role_update_household_member` | ❌ None |
| `address` | ✅ | `role_select_address` | `role_insert_address`, `anon_can_insert_address` | `role_update_address` | ❌ None |
| `contact_point` | ✅ | `role_select_contact_point` | `role_insert_contact_point`, `anon_can_insert_contact_point` | `role_update_contact_point` | ❌ None |

#### Bouwsubsidie Module Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `subsidy_case` | ✅ | `role_select_subsidy_case`, `anon_can_select_subsidy_case_status` | `role_insert_subsidy_case`, `anon_can_insert_subsidy_case` | `role_update_subsidy_case` | ❌ None |
| `subsidy_case_status_history` | ✅ | `role_select_subsidy_case_status_history`, `anon_can_select_subsidy_status_history` | `role_insert_subsidy_case_status_history`, `anon_can_insert_subsidy_status_history` | ❌ None (immutable) | ❌ None |
| `subsidy_document_requirement` | ✅ | `role_select_subsidy_document_requirement` | `role_insert_subsidy_document_requirement` | `role_update_subsidy_document_requirement` | ❌ None |
| `subsidy_document_upload` | ✅ | `role_select_subsidy_document_upload` | `role_insert_subsidy_document_upload` | `role_update_subsidy_document_upload` | ❌ None |
| `social_report` | ✅ | `role_select_social_report` | `role_insert_social_report` | `role_update_social_report` | ❌ None |
| `technical_report` | ✅ | `role_select_technical_report` | `role_insert_technical_report` | `role_update_technical_report` | ❌ None |
| `generated_document` | ✅ | `role_select_generated_document` | `role_insert_generated_document` | ❌ None (immutable) | ❌ None |

#### Housing Module Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `housing_registration` | ✅ | `role_select_housing_registration`, `anon_can_select_housing_registration_status` | `role_insert_housing_registration`, `anon_can_insert_housing_registration` | `role_update_housing_registration` | ❌ None |
| `housing_registration_status_history` | ✅ | `role_select_housing_registration_status_history`, `anon_can_select_housing_status_history` | `role_insert_housing_registration_status_history`, `anon_can_insert_housing_status_history` | ❌ None (immutable) | ❌ None |
| `housing_urgency` | ✅ | `role_select_housing_urgency` | `role_insert_housing_urgency` | ❌ None (immutable) | ❌ None |
| `district_quota` | ✅ | `role_select_district_quota` | `role_insert_district_quota` | `role_update_district_quota` | ❌ None |

#### Allocation Engine Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `allocation_run` | ✅ | `role_select_allocation_run` | `role_insert_allocation_run` | `role_update_allocation_run` | ❌ None |
| `allocation_candidate` | ✅ | `role_select_allocation_candidate` | `role_insert_allocation_candidate` | ❌ None (immutable) | ❌ None |
| `allocation_decision` | ✅ | `role_select_allocation_decision` | `role_insert_allocation_decision` | ❌ None (immutable) | ❌ None |
| `assignment_record` | ✅ | `role_select_assignment_record` | `role_insert_assignment_record` | ❌ None (immutable) | ❌ None |

#### System Tables

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `public_status_access` | ✅ | `role_select_public_status_access`, `anon_can_select_public_status_access` | `role_insert_public_status_access`, `anon_can_insert_public_status_access` | `role_update_public_status_access` | ❌ None |
| `audit_event` | ✅ | `role_select_audit_event` | `role_insert_audit_event`, `anon_can_insert_audit_event` | ❌ None (immutable) | ❌ None (immutable) |
| `app_user_profile` | ✅ | `Users can read own profile`, `role_select_all_app_user_profile` | `role_insert_app_user_profile` | `Users can update own profile`, `role_update_all_app_user_profile` | ❌ None |
| `user_roles` | ✅ | `system_admin_select_user_roles`, `users_read_own_roles` | `system_admin_insert_user_roles` | `system_admin_update_user_roles` | `system_admin_delete_user_roles` |

---

## 4. Route Protection

### 4.1 Authentication Requirement

**Source:** `src/routes/router.tsx`

| Route Pattern | Protection | Evidence |
|---------------|------------|----------|
| `/dashboards` | `isAuthenticated` | router.tsx line 44 |
| `/persons/*` | `isAuthenticated` | router.tsx line 44 |
| `/households/*` | `isAuthenticated` | router.tsx line 44 |
| `/subsidy-cases/*` | `isAuthenticated` | router.tsx line 44 |
| `/housing-registrations/*` | `isAuthenticated` | router.tsx line 44 |
| `/housing-waiting-list` | `isAuthenticated` | router.tsx line 44 |
| `/allocation-*` | `isAuthenticated` | router.tsx line 44 |
| `/audit-log` | `isAuthenticated` | router.tsx line 44 |
| `/`, `/bouwsubsidie/*`, `/housing/*`, `/status` | Public (no auth) | router.tsx lines 33-42 |

### 4.2 Role-Based Menu Filtering

**Source:** `src/assets/data/menu-items.ts`

| Menu Item | Allowed Roles | Evidence |
|-----------|---------------|----------|
| Subsidy Cases | Excludes `frontdesk_housing` | menu-items.ts line 51 |
| Housing Registrations | Excludes `frontdesk_bouwsubsidie` | menu-items.ts line 63 |
| Waiting List | Excludes `frontdesk_bouwsubsidie` | menu-items.ts line 70 |
| Allocation Engine (all) | Excludes `frontdesk_bouwsubsidie` | menu-items.ts line 82 |
| Allocation Runs | `system_admin`, `project_leader` only | menu-items.ts line 89 |
| Audit Log | `system_admin`, `minister`, `project_leader`, `audit` | menu-items.ts line 115 |

### 4.3 Role Hook

**Source:** `src/hooks/useUserRole.ts`

```typescript
export const useUserRole = () => {
  // Fetches roles from user_roles table
  // Returns: { roles, hasRole, hasAnyRole, isNationalRole, loading }
};
```

---

## 5. Edge Functions & Service Role Usage

### 5.1 Edge Function Inventory

| Function | Auth Required | Service Role | Internal RBAC Check | Risk Assessment |
|----------|---------------|--------------|---------------------|-----------------|
| `submit-bouwsubsidie-application` | ❌ No (public) | ✅ Yes | ❌ N/A (public intake) | ACCEPTED: Rate-limited, validated input |
| `submit-housing-registration` | ❌ No (public) | ✅ Yes | ❌ N/A (public intake) | ACCEPTED: Rate-limited, validated input |
| `lookup-public-status` | ❌ No (public) | ✅ Yes | ❌ N/A (token-validated) | ACCEPTED: Token hash validation, rate-limited |
| `execute-allocation-run` | ✅ Yes | ✅ Yes | ✅ `system_admin`, `project_leader` | ACCEPTED: Strict RBAC |
| `generate-raadvoorstel` | ✅ Yes | ✅ Yes | ✅ Role-checked | ACCEPTED: District-scoped |
| `get-document-download-url` | ✅ Yes | ✅ Yes | ✅ `ALLOWED_ROLES` array | ACCEPTED: Signed URL, time-limited |

### 5.2 Service Role Justification

**Why Service Role is Used:**
1. **Public intake functions:** Must bypass RLS to create initial records (anonymous users have no `auth.uid()`)
2. **Allocation engine:** Batch operations require cross-district reads
3. **Document functions:** Storage operations require admin-level access

**Mitigations in Place:**
- All public functions implement IP-based rate limiting (5/hour)
- All authenticated functions verify roles via `ALLOWED_ROLES` array before any DB operation
- Token hashing prevents enumeration attacks on status lookup
- Audit events logged for all operations

### 5.3 Service Role Check Pattern

**Source:** `supabase/functions/execute-allocation-run/index.ts`

```typescript
const ALLOWED_ROLES = ['system_admin', 'project_leader'];

// Verify user has allowed role
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

const hasAllowedRole = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
if (!hasAllowedRole) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
}
```

---

## 6. Immutable Records (Audit Compliance)

The following tables have NO UPDATE or DELETE policies by design:

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

## 7. Security Conclusion

### 7.1 Checklist

| Criterion | Status | Evidence |
|-----------|--------|----------|
| RLS enabled on all tables | ✅ PASS | 24/24 tables |
| SECURITY DEFINER functions prevent recursion | ✅ PASS | `has_role`, `is_national_role`, `get_user_district` |
| District scoping enforced | ✅ PASS | RLS policies use `get_user_district()` |
| No hardcoded role checks in UI | ✅ PASS | All via `useUserRole` hook |
| Audit log immutable | ✅ PASS | No UPDATE/DELETE policies |
| Status history immutable | ✅ PASS | No UPDATE/DELETE policies |
| Service role justified | ✅ PASS | All Edge Functions have internal RBAC or are public with rate limits |
| Roles stored in separate table | ✅ PASS | `user_roles` table, not in profile |
| No client-side role storage | ✅ PASS | Roles fetched from DB via hook |

### 7.2 Final Status

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   SECURITY MODEL STATUS: COMPLETE                          ║
║                                                            ║
║   • 24/24 tables have RLS enabled                          ║
║   • Role system properly implemented                        ║
║   • District scoping enforced                              ║
║   • Audit compliance maintained                            ║
║   • No critical vulnerabilities identified                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**End of Security, RLS & Roles Status Report**
