# Temporary Role & District Assignment Mechanism

## Phase 11 — Temporary Assignment

Until User Management UI is implemented (future phase), roles and districts are assigned via direct database manipulation.

---

## Method: Direct Database Manipulation

All role and district assignments must be performed by a `system_admin` user via the Supabase Dashboard SQL Editor or a secure database client.

### Assign Role

```sql
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES (
  '<target_user_uuid>',
  '<role_name>',  -- One of: system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit
  '<admin_user_uuid>'  -- UUID of the system_admin performing the assignment
);
```

### Remove Role

```sql
DELETE FROM public.user_roles
WHERE user_id = '<target_user_uuid>'
  AND role = '<role_name>';
```

### Assign District

```sql
UPDATE public.app_user_profile
SET district_code = '<district_code>'  -- One of: PAR, WAA, NIC, COR, SAR, COM, MAR, BRO, SIP, PRA
WHERE user_id = '<target_user_uuid>';
```

### Clear District (for national roles)

```sql
UPDATE public.app_user_profile
SET district_code = NULL
WHERE user_id = '<target_user_uuid>';
```

---

## Available Roles

| Role | Description | District Scope |
|------|-------------|----------------|
| `system_admin` | Full system access | National |
| `minister` | Read all + approval authority | National |
| `project_leader` | Full operational access | National |
| `frontdesk_bouwsubsidie` | Bouwsubsidie module operations | District-bound |
| `frontdesk_housing` | Housing module operations | District-bound |
| `admin_staff` | Both modules operations | District-bound |
| `audit` | Read-only access including audit logs | National |

---

## Available Districts

| Code | Name |
|------|------|
| PAR | Paramaribo |
| WAA | Wanica |
| NIC | Nickerie |
| COR | Coronie |
| SAR | Saramacca |
| COM | Commewijne |
| MAR | Marowijne |
| BRO | Brokopondo |
| SIP | Sipaliwini |
| PRA | Para |

---

## Initial Assignments (Phase 11 Bootstrap)

| User | Role | District |
|------|------|----------|
| info@devmart.sr | system_admin | NULL (national) |

---

## Audit Trail Requirements

All role and district assignments MUST be logged to `audit_event`:

### Log Role Assignment

```sql
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
  '<user_roles_record_id>',
  '<admin_user_uuid>',
  'system_admin',
  jsonb_build_object(
    'target_user_id', '<target_user_uuid>',
    'role', '<role_name>',
    'assigned_at', now()::text
  ),
  'Manual role assignment via SQL'
);
```

### Log Role Removal

```sql
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
  'role_removed',
  '<target_user_uuid>',
  '<admin_user_uuid>',
  'system_admin',
  jsonb_build_object(
    'target_user_id', '<target_user_uuid>',
    'role', '<role_name>',
    'removed_at', now()::text
  ),
  'Manual role removal via SQL'
);
```

### Log District Assignment

```sql
INSERT INTO public.audit_event (
  entity_type,
  action,
  entity_id,
  actor_user_id,
  actor_role,
  metadata_json,
  reason
) VALUES (
  'app_user_profile',
  'district_assigned',
  '<target_user_uuid>',
  '<admin_user_uuid>',
  'system_admin',
  jsonb_build_object(
    'target_user_id', '<target_user_uuid>',
    'district_code', '<district_code>',
    'assigned_at', now()::text
  ),
  'Manual district assignment via SQL'
);
```

---

## Security Notes

1. **Only system_admin can execute these queries** — RLS policies enforce this
2. **All changes must be logged** — Unlogged changes violate audit governance
3. **Self-assignment is NOT recommended** — Always have another admin verify
4. **Access via Supabase Dashboard SQL Editor** — Use authenticated session

---

## Planned Replacement

This temporary mechanism will be replaced by a formal User Management UI in a future phase. The UI will:
- Provide role assignment interface
- Provide district assignment interface
- Automatically log all changes to audit_event
- Enforce self-assignment restrictions
- Validate role/district combinations

---

## Quick Reference: Add New User

1. User signs up via `/auth/sign-up`
2. Verify user exists in `auth.users` table
3. Assign role(s) using INSERT statement above
4. If district-scoped role, assign district using UPDATE statement
5. Log both assignments to `audit_event`
6. User can now access admin UI with appropriate permissions
