# Phase 11 — RBAC and District Access

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** PENDING  
**Authority:** Delroy (Final)  
**Prerequisite:** Phase 10 Complete

---

## A. Phase Objective

Implement role-based access control (RBAC) and district-level scoping to replace the temporary allowlist security model:

- Create dedicated user_roles table (security best practice)
- Define 7 system roles with explicit permissions
- Replace all allowlist RLS policies with role-based policies
- Implement district filtering for operational roles
- Enable admin read access to audit_event (Audit role)
- Add role assignment UI in user management

This phase transitions the system from Phase 1 security (single allowlist) to production-ready role-based access control with proper separation of duties.

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `user_roles` table |
| Database | Create `app_role` enum type |
| Database | Create `has_role()` security definer function |
| Database | Add `district_code` column to `app_user_profile` |
| RLS | Replace all allowlist policies with role-based |
| RLS | Add district scoping to operational tables |
| RLS | Add SELECT policy for audit_event (Audit role) |
| UI | Add role assignment in user management |
| UI | Add district assignment in user management |
| UI | Add role-based navigation filtering |
| UI | Add district filtering in list views |
| Audit | Log role assignments |
| Audit | Log district assignments |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Roles | New roles beyond defined 7 |
| Features | Self-service role requests |
| Features | Cross-district access requests |
| Features | Role hierarchy or inheritance |
| Features | Temporary role assignments |
| UI | Layout changes beyond role/district fields |
| UI | Public-facing modifications |
| Security | Custom permission granularity beyond defined roles |

---

## D. Database Impact

### New Enum Type

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

### New Table: user_roles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | FK to auth.users |
| role | app_role | NO | - | Assigned role |
| assigned_at | timestamptz | NO | now() | Assignment timestamp |
| assigned_by | uuid | YES | - | Assigner user ID |

**Constraints:**
- UNIQUE (user_id, role) — One role per user per type
- FK to auth.users with ON DELETE CASCADE

### Alter Table: app_user_profile

```sql
ALTER TABLE app_user_profile 
ADD COLUMN district_code text;
```

### Security Definer Function

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### Role Definitions

| Role | Access Level | District Scope | Modules |
|------|--------------|----------------|---------|
| system_admin | Full | National | All |
| minister | Read + Approve | National | All |
| project_leader | Full operational | National | All |
| frontdesk_bouwsubsidie | CRUD | Assigned district | Bouwsubsidie only |
| frontdesk_housing | CRUD | Assigned district | Housing only |
| admin_staff | CRUD | Assigned district | All |
| audit | Read only | National | All + audit_event |

### RLS Policy Replacement

All 23 tables must have their allowlist policies replaced with role-based policies.

**Pattern for Admin Tables:**
```sql
-- Old (allowlist)
(auth.jwt() ->> 'email') = 'info@devmart.sr'

-- New (role-based)
public.has_role(auth.uid(), 'system_admin') OR
public.has_role(auth.uid(), 'minister') OR
public.has_role(auth.uid(), 'project_leader') OR
(public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') AND district_code = (SELECT district_code FROM app_user_profile WHERE user_id = auth.uid())) OR
...
```

### Audit Event Access

```sql
-- Enable read access for Audit role
CREATE POLICY "Audit role can read all events"
ON public.audit_event
FOR SELECT
USING (public.has_role(auth.uid(), 'audit'));
```

---

## E. Security & RLS Considerations

### Role Assignment Security
- Only system_admin can assign roles
- Role assignment logged to audit_event
- No self-role-assignment
- No privilege escalation possible

### District Isolation
- Operational roles (frontdesk_*, admin_staff) filtered by district
- National roles (minister, project_leader, audit) see all districts
- system_admin bypasses all restrictions

### Least Privilege Enforcement

| Role | CREATE | READ | UPDATE | DELETE |
|------|--------|------|--------|--------|
| system_admin | All | All | All | None* |
| minister | None | All | Approve only | None |
| project_leader | All | All | All | None* |
| frontdesk_* | District | District | District | None |
| admin_staff | District | District | District | None |
| audit | None | All | None | None |

*DELETE denied on all data tables for audit compliance

### Audit Event Protection
- INSERT: All authenticated users (via application layer)
- SELECT: Audit role only
- UPDATE: Denied
- DELETE: Denied

---

## F. Audit Trail Requirements

### Role Assignment Audit

```
entity_type: 'user_roles'
action: 'role_assigned'
entity_id: <user_roles record ID>
actor_user_id: <assigner user ID>
metadata_json: {
  target_user_id: <assigned user ID>,
  role: <assigned role>,
  assigned_at: <ISO datetime>
}
```

### Role Removal Audit

```
entity_type: 'user_roles'
action: 'role_removed'
entity_id: <user_roles record ID>
actor_user_id: <remover user ID>
metadata_json: {
  target_user_id: <affected user ID>,
  role: <removed role>,
  removed_at: <ISO datetime>
}
```

### District Assignment Audit

```
entity_type: 'app_user_profile'
action: 'district_assigned'
entity_id: <profile record ID>
actor_user_id: <assigner user ID>
metadata_json: {
  target_user_id: <assigned user ID>,
  from_district: <previous district or null>,
  to_district: <new district>
}
```

---

## G. UI Impact

### Changes Allowed

| Component | Location | Change Type |
|-----------|----------|-------------|
| UserManagement | Admin user list | Add role column |
| UserManagement | Admin user list | Add district column |
| UserRoleAssignment | User detail/modal | Role assignment form |
| DistrictAssignment | User detail/modal | District assignment form |
| Navigation | Sidebar | Role-based menu filtering |
| ListViews | All admin lists | District filter dropdown |

### User Management UI

| Field | Type | Validation |
|-------|------|------------|
| Role | Select dropdown | Single selection from 7 roles |
| District | Select dropdown | 10 Suriname districts + null for national |

### Navigation Filtering

| Role | Visible Menus |
|------|---------------|
| system_admin | All |
| minister | Dashboards, Reports, Cases (read) |
| project_leader | All except system settings |
| frontdesk_bouwsubsidie | Bouwsubsidie module only |
| frontdesk_housing | Housing module only |
| admin_staff | Both modules, no reports |
| audit | All (read-only mode) |

### Darkone 1:1 Compliance
- Use existing Darkone select components
- Use existing Darkone table patterns
- Use existing Darkone form patterns
- Use existing Darkone badge variants for roles
- No custom styling

---

## H. Verification Criteria

### Database Verification
- [ ] app_role enum created
- [ ] user_roles table created
- [ ] has_role() function created and working
- [ ] district_code column added to app_user_profile
- [ ] All constraints active

### RLS Verification
- [ ] All 23 tables have role-based policies
- [ ] Allowlist policies removed
- [ ] system_admin has full access
- [ ] minister has read + approve access
- [ ] project_leader has operational access
- [ ] frontdesk roles have district-scoped access
- [ ] audit role has read-only access to all + audit_event
- [ ] No privilege escalation possible
- [ ] District isolation enforced

### UI Verification
- [ ] Role assignment UI functional
- [ ] District assignment UI functional
- [ ] Navigation filtering by role works
- [ ] List view district filtering works
- [ ] Unauthorized actions blocked in UI
- [ ] Darkone 1:1 compliance maintained

### Security Verification
- [ ] Only system_admin can assign roles
- [ ] Self-role-assignment blocked
- [ ] Cross-district access blocked for operational roles
- [ ] Audit role cannot modify data
- [ ] Delete operations blocked for all roles

### Audit Verification
- [ ] Role assignments logged
- [ ] District assignments logged
- [ ] Audit role can read audit_event
- [ ] Other roles cannot read audit_event

---

## I. Restore Point Requirement

### Restore Point Name
`PHASE-11-COMPLETE`

### Restore Point Contents
- user_roles table and has_role() function created
- All RLS policies replaced
- UI components updated
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 11 verification fails:
1. Revert to PHASE-10-COMPLETE
2. Restore allowlist RLS policies
3. Drop user_roles table and has_role() function
4. Remove UI changes
5. Report failure details
6. Await remediation instructions

**WARNING:** Rollback from RBAC is complex. Extensive testing before PHASE-11-COMPLETE is mandatory.

---

## J. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 11 COMPLETION**

Upon completing Phase 11:
1. Execute all verification criteria
2. Perform comprehensive security testing
3. Submit completion report in standard format
4. Create restore point PHASE-11-COMPLETE
5. **STOP** — Do not proceed to Phase 12
6. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 12**

---

## K. Migration Strategy

### Phase 11 Deployment Order
1. Create enum and table (migration)
2. Create has_role() function (migration)
3. Add district_code column (migration)
4. Assign initial roles (system_admin to info@devmart.sr)
5. Deploy new RLS policies (migration)
6. Remove old allowlist policies (migration)
7. Deploy UI changes

### Initial Role Assignment
- `info@devmart.sr` → system_admin
- Additional users added post-deployment via UI

---

## L. Governance References

- Master PRD: Section 2.3 (Role Definitions)
- Architecture & Security: Section 6 (RBAC)
- Database & RLS Specification: Role-based patterns
- Execution Plan: Deferred from Phase 0
- Supabase Best Practices: user_roles table pattern

---

**End of Phase 11 Documentation**
