-- V1.9 Defect Fix: admin_notification INSERT policies
-- Root cause: All 3 INSERT policies were RESTRICTIVE (AND logic), blocking any role
-- that doesn't satisfy ALL policies simultaneously.
-- Fix: Recreate as PERMISSIVE (OR logic) so satisfying ANY one policy is sufficient.

-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "role_insert_admin_notification" ON admin_notification;
DROP POLICY IF EXISTS "director_insert_admin_notification" ON admin_notification;
DROP POLICY IF EXISTS "ministerial_advisor_insert_admin_notification" ON admin_notification;

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