
-- =====================================================
-- DVH-IMS V1.5 Phase 2: case_assignment table (append-only)
-- Operational task allocation within Bouwsubsidie dossiers
-- =====================================================

CREATE TABLE public.case_assignment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsidy_case_id UUID NOT NULL REFERENCES public.subsidy_case(id),
  assigned_user_id UUID NOT NULL,
  assigned_role TEXT NOT NULL,
  assignment_status TEXT NOT NULL DEFAULT 'assigned',
  assigned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by case and by assigned worker
CREATE INDEX idx_case_assignment_case_id ON public.case_assignment(subsidy_case_id);
CREATE INDEX idx_case_assignment_user_id ON public.case_assignment(assigned_user_id);
CREATE INDEX idx_case_assignment_status ON public.case_assignment(assignment_status);

-- Enable Row Level Security
ALTER TABLE public.case_assignment ENABLE ROW LEVEL SECURITY;

-- INSERT: Only system_admin and project_leader can create assignments
CREATE POLICY "Assignment insert by authorized roles"
  ON public.case_assignment
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['system_admin', 'project_leader']::public.app_role[])
  );

-- SELECT: Own assignments OR management/oversight roles
CREATE POLICY "Assignment select by authorized users"
  ON public.case_assignment
  FOR SELECT
  TO authenticated
  USING (
    assigned_user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY[
      'system_admin', 'project_leader', 'admin_staff',
      'director', 'ministerial_advisor', 'minister', 'audit'
    ]::public.app_role[])
  );

-- UPDATE: Denied (append-only model)
-- DELETE: Denied (append-only model)
-- No UPDATE or DELETE policies = denied by default with RLS enabled
