
-- Phase 3: Create inspection_visit table
CREATE TABLE public.inspection_visit (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid NOT NULL REFERENCES public.subsidy_case(id),
  visit_type      text NOT NULL CHECK (visit_type IN ('social', 'technical', 'follow_up')),
  assigned_to     uuid NOT NULL REFERENCES auth.users(id),
  scheduled_date  date NOT NULL,
  scheduled_by    uuid NOT NULL REFERENCES auth.users(id),
  visit_status    text NOT NULL DEFAULT 'scheduled' CHECK (visit_status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  visit_notes     text,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inspection_visit_case_id ON public.inspection_visit(case_id);
CREATE INDEX idx_inspection_visit_assigned_to ON public.inspection_visit(assigned_to);
CREATE INDEX idx_inspection_visit_scheduled_date ON public.inspection_visit(scheduled_date);
CREATE INDEX idx_inspection_visit_status ON public.inspection_visit(visit_status);

-- Reuse existing updated_at trigger function
CREATE TRIGGER set_inspection_visit_updated_at
  BEFORE UPDATE ON public.inspection_visit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.inspection_visit ENABLE ROW LEVEL SECURITY;

-- INSERT: system_admin, project_leader only
CREATE POLICY "role_insert_inspection_visit" ON public.inspection_visit
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'system_admin'::app_role)
    OR has_role(auth.uid(), 'project_leader'::app_role)
  );

-- SELECT: national roles, admin_staff, or assigned field workers
CREATE POLICY "role_select_inspection_visit" ON public.inspection_visit
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    is_national_role(auth.uid())
    OR has_role(auth.uid(), 'admin_staff'::app_role)
    OR (assigned_to = auth.uid())
  );

-- UPDATE: system_admin, project_leader (reschedule/cancel), or assigned user (complete + notes)
CREATE POLICY "role_update_inspection_visit" ON public.inspection_visit
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'system_admin'::app_role)
    OR has_role(auth.uid(), 'project_leader'::app_role)
    OR (assigned_to = auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'system_admin'::app_role)
    OR has_role(auth.uid(), 'project_leader'::app_role)
    OR (assigned_to = auth.uid())
  );

-- DELETE: denied (no policy = denied by RLS)
