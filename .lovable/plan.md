

# DVH-IMS V1.5 — Security Findings Remediation Plan

**Type:** Security-critical RLS and Auth hardening
**Scope:** RLS policy changes only + one Auth dashboard setting
**Risk:** Low (all public flows use service role key; no behavioral change)

---

## Summary of Findings and Fixes

| # | Finding | Scanner | Severity | Fix Type |
|---|---------|---------|----------|----------|
| 1 | housing_document_requirement publicly readable | supabase_lov | WARN | Drop 2 policies, add 1 role-based SELECT |
| 2 | subsidy_document_requirement "no SELECT policies" | supabase_lov | WARN | FALSE POSITIVE — policy already exists. Delete finding. |
| 3 | RLS Policy Always True (12 anon INSERT policies) | supabase | WARN | Drop all 12 anon INSERT policies with `WITH CHECK (true)` |
| 4 | Leaked Password Protection Disabled | supabase | WARN | Manual: User enables in Supabase Auth dashboard |
| 5 | Medium severity dependency vulnerabilities | supabase | INFO | Review only, no action |

---

## Fix 1: housing_document_requirement — Remove Public Exposure

**Root cause:** Two SELECT policies allow unrestricted read access:
- `anon_can_select_housing_document_requirement` (anon, USING true)
- `authenticated_can_select_housing_document_requirement` (authenticated, USING true)

**Action:**
```sql
DROP POLICY "anon_can_select_housing_document_requirement" ON public.housing_document_requirement;
DROP POLICY "authenticated_can_select_housing_document_requirement" ON public.housing_document_requirement;

CREATE POLICY "role_select_housing_document_requirement" ON public.housing_document_requirement
FOR SELECT TO authenticated
USING (
  is_national_role(auth.uid())
  OR has_role(auth.uid(), 'frontdesk_housing'::app_role)
  OR has_role(auth.uid(), 'frontdesk_bouwsubsidie'::app_role)
  OR has_role(auth.uid(), 'admin_staff'::app_role)
);
```

**Impact:** The public housing wizard calls the `submit-housing-registration` edge function which uses the service role key (bypasses RLS). No public-facing flow reads this table directly from the browser. Zero functional impact.

---

## Fix 2: subsidy_document_requirement — False Positive

**Root cause:** The scanner reported "no SELECT policies," but the database already contains:
- `role_select_subsidy_document_requirement` with proper role checks for `system_admin`, `minister`, `project_leader`, `audit`, `frontdesk_bouwsubsidie`, `admin_staff`

**Action:** Delete the security finding via the manage_security_finding tool. No SQL changes needed.

---

## Fix 3: RLS Policy Always True — Remove 12 Unnecessary Anon INSERT Policies

**Root cause:** 12 tables have `anon` INSERT policies with `WITH CHECK (true)`, originally created to support public wizard submissions. However, ALL public submission flows use edge functions with the **service role key**, which bypasses RLS entirely. These policies are dead code that creates unnecessary attack surface.

**Policies to drop:**

| Table | Policy Name |
|-------|-------------|
| address | anon_can_insert_address |
| contact_point | anon_can_insert_contact_point |
| household | anon_can_insert_household |
| household_member | anon_can_insert_household_member |
| housing_document_upload | anon_can_insert_housing_document_upload |
| housing_registration | anon_can_insert_housing_registration |
| housing_registration_status_history | anon_can_insert_housing_status_history |
| person | anon_can_insert_person |
| public_status_access | anon_can_insert_public_status_access |
| subsidy_case | anon_can_insert_subsidy_case |
| subsidy_case_status_history | anon_can_insert_subsidy_status_history |
| subsidy_document_upload | anon_can_insert_document_upload |

**NOT removed** (has proper conditions, not flagged):
- `anon_can_insert_audit_event` — has condition `(actor_user_id IS NULL AND actor_role = 'public')`

**Impact:** Edge functions use service role key and are unaffected. No browser-side code inserts directly into these tables as anon. Zero functional impact.

---

## Fix 4: Leaked Password Protection — Manual Dashboard Action

**Action required by Delroy:**
1. Go to Supabase Dashboard > Authentication > Settings > Security
2. Enable "Leaked Password Protection"
3. Save

This cannot be done via SQL migration or code. It is a dashboard-only setting.

---

## Fix 5: Dependency Vulnerabilities — Review Only

**Assessment:** These are INFO-level notices about medium-severity vulnerabilities in npm dependencies. No immediate action required within the stabilization window. Recommend deferring to next maintenance cycle unless a specific CVE is identified as exploitable in this application context.

---

## What This Does NOT Change

- No schema changes
- No workflow or business logic changes
- No UI changes
- No role or permission model changes
- No edge function changes
- Anon SELECT policies with proper conditions (status lookup) are preserved
- The `audit_event` anon INSERT policy with proper conditions is preserved

---

## Execution Order

1. Run single SQL migration (Fix 1 + Fix 3 combined)
2. Delete false-positive finding (Fix 2)
3. Instruct user on dashboard setting (Fix 4)
4. Re-run security scan
5. Verify zero warnings remain
6. Report

