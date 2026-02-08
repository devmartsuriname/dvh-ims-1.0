

# DVH-IMS V1.5 — Activate Remaining Test Accounts

**Type:** Activation task (SQL only, no schema or code changes)
**Status:** Test & Stabilization Window

---

## Current State

All 4 accounts exist in Supabase Auth and have `app_user_profile` records with `is_active = false`. No role records exist yet.

| Email | UUID | Profile | Role | Active |
|-------|------|---------|------|--------|
| veldwerker@volkshuisvesting.sr | 51b7a3cd-b8ba-4041-a628-8ecee1e34cc9 | Exists | NONE | false |
| inspecteur@volkshuisvesting.sr | 919c5378-a3a5-4158-a95c-0007386eda42 | Exists | NONE | false |
| directeur@volkshuisvesting.sr | 19b054bb-dff1-4c5f-bdb7-40de9c31e4ea | Exists | NONE | false |
| adviseur@volkshuisvesting.sr | c7260e3a-dadf-45eb-8be0-69ed20d42267 | Exists | NONE | false |

---

## SQL to Execute (Single Migration)

The following SQL will be run via the database migration tool:

```sql
-- 1. Assign roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ('51b7a3cd-b8ba-4041-a628-8ecee1e34cc9', 'social_field_worker'),
  ('919c5378-a3a5-4158-a95c-0007386eda42', 'technical_inspector'),
  ('19b054bb-dff1-4c5f-bdb7-40de9c31e4ea', 'director'),
  ('c7260e3a-dadf-45eb-8be0-69ed20d42267', 'ministerial_advisor');

-- 2. Activate profiles + assign districts where applicable
UPDATE public.app_user_profile SET is_active = true, district_code = 'PAR'
  WHERE user_id = '51b7a3cd-b8ba-4041-a628-8ecee1e34cc9';

UPDATE public.app_user_profile SET is_active = true, district_code = 'PAR'
  WHERE user_id = '919c5378-a3a5-4158-a95c-0007386eda42';

UPDATE public.app_user_profile SET is_active = true
  WHERE user_id = '19b054bb-dff1-4c5f-bdb7-40de9c31e4ea';

UPDATE public.app_user_profile SET is_active = true
  WHERE user_id = 'c7260e3a-dadf-45eb-8be0-69ed20d42267';

-- 3. Audit logging for each activation
INSERT INTO public.audit_event (entity_type, entity_id, action, actor_user_id, actor_role, reason, metadata_json)
VALUES
  ('app_user_profile', '51b7a3cd-b8ba-4041-a628-8ecee1e34cc9', 'USER_ACTIVATED', 'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4', 'system_admin', 'Test account activation for V1.5 stabilization', '{"email":"veldwerker@volkshuisvesting.sr","role":"social_field_worker","district":"PAR"}'::jsonb),
  ('app_user_profile', '919c5378-a3a5-4158-a95c-0007386eda42', 'USER_ACTIVATED', 'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4', 'system_admin', 'Test account activation for V1.5 stabilization', '{"email":"inspecteur@volkshuisvesting.sr","role":"technical_inspector","district":"PAR"}'::jsonb),
  ('app_user_profile', '19b054bb-dff1-4c5f-bdb7-40de9c31e4ea', 'USER_ACTIVATED', 'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4', 'system_admin', 'Test account activation for V1.5 stabilization', '{"email":"directeur@volkshuisvesting.sr","role":"director"}'::jsonb),
  ('app_user_profile', 'c7260e3a-dadf-45eb-8be0-69ed20d42267', 'USER_ACTIVATED', 'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4', 'system_admin', 'Test account activation for V1.5 stabilization', '{"email":"adviseur@volkshuisvesting.sr","role":"ministerial_advisor"}'::jsonb);
```

---

## District Scoping Rationale

| Role | District | Reason |
|------|----------|--------|
| social_field_worker | PAR | District-scoped role per active role model |
| technical_inspector | PAR | District-scoped role per active role model |
| director | NULL | National-level oversight role |
| ministerial_advisor | NULL | National-level oversight role |

---

## Post-Activation Verification

After migration, a verification query will confirm:
- All 4 accounts have `is_active = true`
- All 4 accounts have correct role in `user_roles`
- District codes are correctly set
- Audit events are recorded

---

## No Code Changes

- No schema modifications
- No TypeScript changes
- No workflow changes
- Migration-only task

