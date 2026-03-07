# Phase 7 — Security Hardening Plan

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Finding 1 — HIGH: `public_status_access` anonymous SELECT with `USING (true)`

**Current state:** The `anon_can_select_public_status_access` policy grants full anonymous read access to the entire `public_status_access` table — exposing all reference numbers (BS-2026-000001, WR-2026-002967), entity IDs, and hashed access tokens.

**Why it exists:** Originally created to support the public status lookup flow.

**Why it is redundant:** The `lookup-public-status` Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` (line 181-182), which bypasses RLS entirely. No client-side code queries this table directly. The policy is pure attack surface.

**Risk:** An attacker can enumerate all valid reference numbers and hashed tokens, enabling brute-force correlation attacks.

**Fix — Migration Script 1:**

```sql
BEGIN;

-- Drop the overly permissive anonymous policy
DROP POLICY IF EXISTS "anon_can_select_public_status_access" ON public_status_access;

COMMIT;
```

No replacement policy needed. The Edge Function uses service role key and is unaffected.

**Impact:** Zero. The Edge Function continues to work. No frontend code queries this table as anon.

---

## Finding 2 — MEDIUM: `app_user_profile` allows `district_code` self-modification

**Current state:** The policy `Users can update own profile` allows any authenticated user to update their own profile row with no column restrictions. A user could change their own `district_code`, which would escalate their district-level access across all RLS policies that use `get_user_district()`.

**Risk:** Privilege escalation — a frontdesk user in Paramaribo could change their district_code to Nickerie and access cases in that district.

**Fix — Migration Script 2:**

```sql
BEGIN;

-- Drop the permissive self-update policy
DROP POLICY IF EXISTS "Users can update own profile" ON app_user_profile;

-- Recreate with restriction: users can update own profile
-- but cannot change district_code or is_active
CREATE POLICY "Users can update own profile"
ON app_user_profile
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND district_code IS NOT DISTINCT FROM (
    SELECT district_code FROM app_user_profile WHERE user_id = auth.uid()
  )
  AND is_active IS NOT DISTINCT FROM (
    SELECT is_active FROM app_user_profile WHERE user_id = auth.uid()
  )
);

COMMIT;
```

This ensures users can update `full_name` but cannot modify `district_code` or `is_active`. Only `system_admin` (via `role_update_all_app_user_profile`) can change those fields.

**Impact:** Users can still update their display name. Admin management is unaffected (separate policy).

---

## Finding 3 — MEDIUM: Leaked password protection disabled

**Current state:** Supabase Auth leaked password protection is disabled.

**Action:** This is a Supabase Dashboard setting, not a migration. Per existing governance note, this is deferred due to Free Tier limitations.

**Recommendation:** Enable immediately upon upgrading to Supabase Pro tier via: **Supabase Dashboard → Auth → Security → Enable Leaked Password Protection**.

No migration script needed. Status: documented and deferred.

---

## Finding 4 — MEDIUM: `housing_document_upload` missing INSERT policy

**Current state:** No INSERT policy exists on `housing_document_upload`. The table has SELECT and UPDATE policies only. This means no authenticated role can insert document upload records via RLS.

**Current workaround:** Document uploads during public registration are handled by the `submit-housing-registration` Edge Function using the service role key, bypassing RLS. Admin-side document uploads would fail.

**Fix — Migration Script 3:**

```sql
BEGIN;

CREATE POLICY "role_insert_housing_document_upload"
ON housing_document_upload
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'system_admin'::app_role)
  OR has_role(auth.uid(), 'project_leader'::app_role)
  OR (EXISTS (
    SELECT 1 FROM housing_registration hr
    WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing'::app_role)
           OR has_role(auth.uid(), 'admin_staff'::app_role))
      AND hr.district_code = get_user_district(auth.uid())
  ))
);

COMMIT;
```

**Impact:** Enables admin-side document uploads for housing registrations. Follows existing RLS pattern from `housing_urgency` and `housing_registration_status_history`.

---

## RLS Audit Summary


| Table                                 | anon SELECT    | Status                             |
| ------------------------------------- | -------------- | ---------------------------------- |
| `public_status_access`                | `USING (true)` | **REMOVE** (Finding 1)             |
| `person`                              | None           | Clean                              |
| `subsidy_case`                        | None           | Clean                              |
| `housing_registration`                | None           | Clean                              |
| `subsidy_case_status_history`         | None           | Clean (removed in V1.7)            |
| `housing_registration_status_history` | None           | Clean (removed in V1.7)            |
| `audit_event`                         | None           | Clean (removed in V1.7)            |
| `housing_document_upload`             | None           | Clean — missing INSERT (Finding 4) |


All other tables have properly scoped authenticated-only policies.

---

## Migration Execution Order

1. **Migration A** — Drop `anon_can_select_public_status_access` (HIGH)
2. **Migration B** — Replace `Users can update own profile` with column-restricted version (MEDIUM)
3. **Migration C** — Add `role_insert_housing_document_upload` (MEDIUM)

**Rollback:** Each migration is independently reversible by recreating the dropped/replaced policy.

---

## NOTE — Security Plan Correction

The item “Leaked password protection disabled” is outdated.

We have already upgraded the Supabase project to the Pro tier and

Leaked Password Protection has been enabled in:

Supabase Dashboard → Auth → Security

Therefore this finding should be marked as:

RESOLVED (Platform configuration)

Please update the Phase 7 plan accordingly.

---

Additional note for the report:

Admin dashboards and document flows have been manually verified and are working correctly.

PageSpeed verification has also been completed:

Homepage

Desktop: 99 performance

Mobile: 83 performance

Wizard (/bouwsubsidie/apply)

Desktop: 91 performance

Mobile: 85 performance

Accessibility / SEO / Best Practices are all within acceptable production ranges.

---

Next step:

Proceed with the Phase 7 database migrations only:

Migration A

Drop policy:

anon_can_select_public_status_access

Migration B

Replace policy:

Users can update own profile

(add restriction preventing district_code and is_active modification)

Migration C

Add INSERT policy:

housing_document_upload

No other schema or application changes required.

After migrations complete:

1. Re-run RLS verification

2. Run a quick admin document upload test

3. Confirm status lookup still works via Edge Function

Await confirmation report after migrations.  
  
**Confirm that lookup-public-status Edge Function**

still returns correct results when querying

public_status_access using service_role.  
  
**What is NOT included**

- Leaked password protection (Dashboard setting, Free Tier limitation)
- No schema changes
- No frontend code changes
- No Edge Function changes

Awaiting approval before applying migrations.