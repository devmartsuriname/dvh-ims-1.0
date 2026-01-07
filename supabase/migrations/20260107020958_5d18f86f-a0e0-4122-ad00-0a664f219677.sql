-- PHASE 0 DATABASE CLEANUP — CLEAN BASELINE RESET
-- ================================================

-- 1. Drop dependent policy on audit_event using has_role()
DROP POLICY IF EXISTS "Audit role can read all events" ON public.audit_event;

-- 2. Drop user_roles table (CASCADE removes its policies)
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 3. Drop has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- 4. Drop app_role enum
DROP TYPE IF EXISTS public.app_role;

-- 5. Modify handle_new_user trigger function (remove audit_event insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_user_profile (user_id, full_name, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    false
  );
  
  RETURN NEW;
END;
$$;

-- 6. Explicit RLS baseline enforcement on app_user_profile
ALTER TABLE public.app_user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_profile FORCE ROW LEVEL SECURITY;

-- 7. Explicit RLS baseline enforcement on audit_event
ALTER TABLE public.audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_event FORCE ROW LEVEL SECURITY;