-- PHASE 11: RBAC Foundation Migration
-- Creates app_role enum, user_roles table, security definer functions, and initial role assignment

-- 1. Create app_role enum with 7 roles
CREATE TYPE public.app_role AS ENUM (
  'system_admin',
  'minister',
  'project_leader',
  'frontdesk_bouwsubsidie',
  'frontdesk_housing',
  'admin_staff',
  'audit'
);

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  CONSTRAINT user_roles_unique_user_role UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role() security definer function
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

-- 4. Create has_any_role() security definer function (checks if user has any of the specified roles)
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
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
      AND role = ANY(_roles)
  )
$$;

-- 5. Create get_user_district() security definer function
CREATE OR REPLACE FUNCTION public.get_user_district(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_code
  FROM public.app_user_profile
  WHERE user_id = _user_id
$$;

-- 6. Create is_national_role() helper function (roles that have cross-district access)
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
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
      AND role IN ('system_admin', 'minister', 'project_leader', 'audit')
  )
$$;

-- 7. RLS policies for user_roles table (system_admin only)
CREATE POLICY "system_admin_select_user_roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "system_admin_insert_user_roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "system_admin_update_user_roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "system_admin_delete_user_roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'));

-- 8. Allow users to read their own roles (for UI filtering)
CREATE POLICY "users_read_own_roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 9. Initial role assignment: info@devmart.sr as system_admin
-- Using the verified user ID from auth.users
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES (
  'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4',
  'system_admin',
  NULL
);

-- 10. Log the initial role assignment to audit_event
INSERT INTO public.audit_event (
  entity_type,
  action,
  entity_id,
  actor_user_id,
  actor_role,
  metadata_json,
  reason
) VALUES (
  'user_roles',
  'role_assigned',
  'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4',
  NULL,
  'system',
  jsonb_build_object(
    'target_user_id', 'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4',
    'role', 'system_admin',
    'assignment_type', 'phase_11_bootstrap'
  ),
  'Phase 11 RBAC bootstrap - initial system_admin assignment'
);