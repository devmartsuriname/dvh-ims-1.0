-- DVH-IMS v1.8 Phase 1: Create subsidy_household_child table
CREATE TABLE public.subsidy_household_child (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_case_id uuid NOT NULL REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  gender text NOT NULL CHECK (gender IN ('M', 'V')),
  age integer NOT NULL CHECK (age >= 0 AND age <= 25),
  has_disability boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subsidy_household_child ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT — national roles + district-scoped bouwsubsidie/admin staff
CREATE POLICY "role_select_subsidy_household_child" ON public.subsidy_household_child
  FOR SELECT TO authenticated
  USING (
    public.is_national_role(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.subsidy_case sc
      WHERE sc.id = subsidy_household_child.subsidy_case_id
        AND public.has_any_role(auth.uid(), ARRAY['frontdesk_bouwsubsidie'::app_role, 'admin_staff'::app_role])
        AND sc.district_code = public.get_user_district(auth.uid())
    )
  );

-- RLS: INSERT — system_admin/project_leader + district-scoped bouwsubsidie/admin staff
CREATE POLICY "role_insert_subsidy_household_child" ON public.subsidy_household_child
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['system_admin'::app_role, 'project_leader'::app_role])
    OR EXISTS (
      SELECT 1 FROM public.subsidy_case sc
      WHERE sc.id = subsidy_household_child.subsidy_case_id
        AND public.has_any_role(auth.uid(), ARRAY['frontdesk_bouwsubsidie'::app_role, 'admin_staff'::app_role])
        AND sc.district_code = public.get_user_district(auth.uid())
    )
  );

-- No UPDATE or DELETE policies — immutable once submitted