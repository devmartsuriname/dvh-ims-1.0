

# Promote sergio.morman@gmail.com to system_admin

## Current State

| Field | Value |
|-------|-------|
| user_id | `9f4c9f36-1e25-4516-a509-d43a7b409f8c` |
| full_name | sergio.morman@gmail.com |
| is_active | **false** |
| district_code | NULL |
| roles | **none** |

## Required Changes (SQL Migration)

Two operations, no schema changes:

### 1. Activate user profile

```sql
UPDATE public.app_user_profile
SET is_active = true
WHERE user_id = '9f4c9f36-1e25-4516-a509-d43a7b409f8c';
```

### 2. Assign system_admin role

```sql
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES (
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c',
  'system_admin',
  '9f4c9f36-1e25-4516-a509-d43a7b409f8c'
);
```

### 3. Audit trail (governance requirement)

```sql
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
```

## What This Grants

- `system_admin` = national role (no district restriction)
- `district_code` stays NULL (correct for national roles)
- Full SELECT/INSERT/UPDATE access on all tables per existing RLS policies
- Full visibility of all admin menu items, all modules, audit log, archive

## What This Does NOT Change

- No schema changes
- No RLS policy changes
- No UI changes
- No enum changes

## Verification After Execution

1. Log in as sergio.morman@gmail.com
2. Confirm admin dashboard loads
3. Confirm all sidebar menu items visible
4. Confirm case detail access (all tabs)
5. Confirm audit log accessible

