-- Admin v1.1-A: Extend audit_event SELECT access to minister and project_leader roles
-- This enables the read-only Audit Log Interface for governance roles

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "role_select_audit_event" ON public.audit_event;

-- Create updated SELECT policy with extended roles
CREATE POLICY "role_select_audit_event" ON public.audit_event
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'audit'::app_role) OR
  has_role(auth.uid(), 'system_admin'::app_role) OR
  has_role(auth.uid(), 'minister'::app_role) OR
  has_role(auth.uid(), 'project_leader'::app_role)
);