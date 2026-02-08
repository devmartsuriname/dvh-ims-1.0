
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
