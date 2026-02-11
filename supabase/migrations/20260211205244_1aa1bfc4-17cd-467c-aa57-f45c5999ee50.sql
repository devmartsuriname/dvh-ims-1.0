-- DVH-IMS V1.5: Promote sergio.morman@gmail.com to system_admin
-- Context: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

-- 1. Activate user profile
UPDATE public.app_user_profile
SET is_active = true
WHERE user_id = '9f4c9f36-1e25-4516-a509-d43a7b409f8c';

-- 2. Assign system_admin role
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES (
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c',
  'system_admin',
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c'
);

-- 3. Audit trail (governance requirement)
INSERT INTO public.audit_event (
  entity_type, action, entity_id, actor_user_id, actor_role, reason,
  metadata_json
) VALUES (
  'user_roles', 'role_assigned',
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c',
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c',
  'system_admin',
  'Initial system_admin promotion for sergio.morman@gmail.com',
  jsonb_build_object(
    'target_user_id', '9f4c9f36-1e25-4516-a509-d43a7b409f8c',
    'target_email', 'sergio.morman@gmail.com',
    'role', 'system_admin',
    'assigned_at', now()::text
  )
);
