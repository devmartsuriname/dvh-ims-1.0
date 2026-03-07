

# V1.9 Defect Fix — admin_notification RLS INSERT Policy

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Root Cause

All three `admin_notification` INSERT policies are **RESTRICTIVE** (`Permissive: No`):

1. `role_insert_admin_notification` — allows system_admin, project_leader, minister, frontdesk roles
2. `director_insert_admin_notification` — allows director only
3. `ministerial_advisor_insert_admin_notification` — allows ministerial_advisor only

PostgreSQL requires **ALL** restrictive policies to pass simultaneously. A `system_admin` satisfies policy #1 but fails policies #2 and #3, so the INSERT is blocked.

## Fix

Drop all three INSERT policies and recreate them as **PERMISSIVE**. Permissive policies use OR logic — satisfying any one is sufficient.

```sql
-- Drop existing restrictive INSERT policies
DROP POLICY "role_insert_admin_notification" ON admin_notification;
DROP POLICY "director_insert_admin_notification" ON admin_notification;
DROP POLICY "ministerial_advisor_insert_admin_notification" ON admin_notification;

-- Recreate as PERMISSIVE
CREATE POLICY "role_insert_admin_notification" ON admin_notification
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'system_admin'::app_role)
    OR has_role(auth.uid(), 'project_leader'::app_role)
    OR has_role(auth.uid(), 'minister'::app_role)
    OR has_role(auth.uid(), 'frontdesk_bouwsubsidie'::app_role)
    OR has_role(auth.uid(), 'frontdesk_housing'::app_role)
    OR has_role(auth.uid(), 'admin_staff'::app_role)
  );

CREATE POLICY "director_insert_admin_notification" ON admin_notification
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'director'::app_role));

CREATE POLICY "ministerial_advisor_insert_admin_notification" ON admin_notification
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'ministerial_advisor'::app_role));
```

## What does NOT change

- SELECT, UPDATE policies remain RESTRICTIVE (correct behavior — each role reads only its own notifications)
- DELETE remains blocked
- Notification routing logic untouched
- No schema changes, no new columns, no workflow changes

## After Fix

Resume and complete the full V1.9 end-to-end smoke test covering all remaining modules (visits, director, advisor, minister, Raadvoorstel, archive, RBAC spot checks) with full notification verification at each transition.

