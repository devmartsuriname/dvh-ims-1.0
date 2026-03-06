

# DVH-IMS v1.8 — Phase 1 Implementation Plan

## Backward Compatibility Confirmation

**CONFIRMED SAFE.** The admin verification views (`subsidy-cases/[id]/page.tsx` and `archive/subsidy/[id]/page.tsx`) query `subsidy_document_upload` with a FK join to `subsidy_document_requirement` (`requirement:requirement_id (document_name, document_code)`). There is NO `WHERE is_active = true` filter on these queries. Setting `is_active = false` on deprecated requirement rows will NOT affect visibility of historical uploads. No DELETE operations will be performed.

## Phase 1 Scope

One DB migration only: create `subsidy_household_child` table with RLS policies.

Document requirement data changes (soft-deprecation + new inserts) are Phase 1B and will use the insert tool, not a migration.

## Migration SQL

```sql
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
```

No UPDATE or DELETE policies — immutable once submitted.

## What This Phase Does NOT Touch

- `household_member` table: zero changes
- `subsidy_document_requirement` table: zero changes (Phase 1B)
- Housing Registration: zero changes
- Any frontend code: zero changes

