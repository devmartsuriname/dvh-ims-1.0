
-- PHASE 1 EXECUTION: User Role Assignment + Activation + District Scoping
-- NO ENUM CHANGES. NO RLS CHANGES. DATA OPERATIONS ONLY.

-- 1. INSERT ROLE ASSIGNMENTS (6 users missing roles)
INSERT INTO public.user_roles (user_id, role) VALUES
  ('7c0f868f-4b8b-4d50-95e9-6d8e11cde269', 'admin_staff'),       -- admin.staff@volkshuisvesting.sr
  ('d2000c84-0eac-4f8e-9a44-42ed092b2384', 'audit'),              -- audit@volkshuisvesting.sr
  ('d515a981-2323-4422-9483-2b700a0c3389', 'frontdesk_bouwsubsidie'), -- frontdesk.bs@volkshuisvesting.sr
  ('d5b3574f-295c-4371-a7f2-e1fc89b3b406', 'frontdesk_housing'),  -- frontdesk.wr@volkshuisvesting.sr
  ('77239be0-2093-42c5-bcd9-63f39844c015', 'minister'),           -- minister@volkshuisvesting.sr
  ('2b2c485e-2249-420a-8975-75e6dc9d5657', 'project_leader')      -- projectleider@volkshuisvesting.sr
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. ACTIVATE ALL USERS (set is_active = true)
UPDATE public.app_user_profile
SET is_active = true
WHERE user_id IN (
  '7c0f868f-4b8b-4d50-95e9-6d8e11cde269',  -- admin.staff
  'd2000c84-0eac-4f8e-9a44-42ed092b2384',  -- audit
  'd515a981-2323-4422-9483-2b700a0c3389',  -- frontdesk.bs
  'd5b3574f-295c-4371-a7f2-e1fc89b3b406',  -- frontdesk.wr
  '77239be0-2093-42c5-bcd9-63f39844c015',  -- minister
  '2b2c485e-2249-420a-8975-75e6dc9d5657',  -- projectleider
  'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4'   -- system_admin (info@devmart.sr)
);

-- 3. SET DISTRICT CODE FOR DISTRICT-SCOPED ROLES (frontdesk_* and admin_staff)
-- Using 'PAR' (Paramaribo) as the default operational district
UPDATE public.app_user_profile
SET district_code = 'PAR'
WHERE user_id IN (
  '7c0f868f-4b8b-4d50-95e9-6d8e11cde269',  -- admin.staff (district-scoped)
  'd515a981-2323-4422-9483-2b700a0c3389',  -- frontdesk.bs (district-scoped)
  'd5b3574f-295c-4371-a7f2-e1fc89b3b406'   -- frontdesk.wr (district-scoped)
);

-- 4. ENSURE NATIONAL ROLES HAVE NULL DISTRICT (explicit safety)
UPDATE public.app_user_profile
SET district_code = NULL
WHERE user_id IN (
  'd2000c84-0eac-4f8e-9a44-42ed092b2384',  -- audit (national)
  '77239be0-2093-42c5-bcd9-63f39844c015',  -- minister (national)
  '2b2c485e-2249-420a-8975-75e6dc9d5657',  -- project_leader (national)
  'aef3d169-3b1d-4148-b0fa-f36fc08d1cd4'   -- system_admin (national)
);
