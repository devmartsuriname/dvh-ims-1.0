-- =====================================================
-- PHASE 4: ALLOCATION ENGINE DATABASE MIGRATION
-- =====================================================
-- Creates 5 tables: district_quota, allocation_run, 
-- allocation_candidate, allocation_decision, assignment_record
-- All with allowlist RLS (info@devmart.sr only)
-- =====================================================

-- 1. DISTRICT QUOTA TABLE
-- Manages housing quotas per district per period
CREATE TABLE public.district_quota (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_code TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_quota INTEGER NOT NULL,
  allocated_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT district_quota_period_check CHECK (period_end > period_start),
  CONSTRAINT district_quota_amounts_check CHECK (allocated_count >= 0 AND total_quota >= 0)
);

-- Enable and Force RLS on district_quota
ALTER TABLE public.district_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_quota FORCE ROW LEVEL SECURITY;

-- Allowlist RLS policies for district_quota
CREATE POLICY "district_quota_select_allowlist" ON public.district_quota
FOR SELECT USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "district_quota_insert_allowlist" ON public.district_quota
FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "district_quota_update_allowlist" ON public.district_quota
FOR UPDATE 
USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr')
WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

-- Add updated_at trigger to district_quota
CREATE TRIGGER update_district_quota_updated_at
BEFORE UPDATE ON public.district_quota
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ALLOCATION RUN TABLE
-- Tracks allocation run executions
CREATE TABLE public.allocation_run (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_code TEXT NOT NULL,
  run_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  run_status TEXT NOT NULL DEFAULT 'pending',
  candidates_count INTEGER,
  allocations_count INTEGER,
  executed_by UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  CONSTRAINT allocation_run_status_check CHECK (run_status IN ('pending', 'running', 'completed', 'failed'))
);

-- Enable and Force RLS on allocation_run
ALTER TABLE public.allocation_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_run FORCE ROW LEVEL SECURITY;

-- Allowlist RLS policies for allocation_run
CREATE POLICY "allocation_run_select_allowlist" ON public.allocation_run
FOR SELECT USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "allocation_run_insert_allowlist" ON public.allocation_run
FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "allocation_run_update_allowlist" ON public.allocation_run
FOR UPDATE 
USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr')
WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

-- 3. ALLOCATION CANDIDATE TABLE (Append-only)
-- Records candidates considered during an allocation run
CREATE TABLE public.allocation_candidate (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.allocation_run(id),
  registration_id UUID NOT NULL REFERENCES public.housing_registration(id),
  urgency_score INTEGER NOT NULL,
  waiting_list_position INTEGER NOT NULL,
  composite_rank INTEGER NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT false
);

-- Enable and Force RLS on allocation_candidate
ALTER TABLE public.allocation_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_candidate FORCE ROW LEVEL SECURITY;

-- Allowlist RLS policies for allocation_candidate (append-only: SELECT + INSERT only)
CREATE POLICY "allocation_candidate_select_allowlist" ON public.allocation_candidate
FOR SELECT USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "allocation_candidate_insert_allowlist" ON public.allocation_candidate
FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

-- NO UPDATE or DELETE policies for allocation_candidate (append-only)

-- 4. ALLOCATION DECISION TABLE (Append-only)
-- Records decisions made for allocation candidates
CREATE TABLE public.allocation_decision (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.allocation_run(id),
  candidate_id UUID NOT NULL REFERENCES public.allocation_candidate(id),
  registration_id UUID NOT NULL REFERENCES public.housing_registration(id),
  decision TEXT NOT NULL,
  decision_reason TEXT,
  decided_by UUID NOT NULL,
  decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT allocation_decision_type_check CHECK (decision IN ('approved', 'rejected', 'deferred'))
);

-- Enable and Force RLS on allocation_decision
ALTER TABLE public.allocation_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_decision FORCE ROW LEVEL SECURITY;

-- Allowlist RLS policies for allocation_decision (append-only: SELECT + INSERT only)
CREATE POLICY "allocation_decision_select_allowlist" ON public.allocation_decision
FOR SELECT USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "allocation_decision_insert_allowlist" ON public.allocation_decision
FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

-- NO UPDATE or DELETE policies for allocation_decision (append-only)

-- 5. ASSIGNMENT RECORD TABLE (Append-only)
-- Records housing assignments (internal or external)
CREATE TABLE public.assignment_record (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.housing_registration(id),
  decision_id UUID REFERENCES public.allocation_decision(id),
  assignment_type TEXT NOT NULL,
  assignment_date DATE NOT NULL,
  housing_reference TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT assignment_record_type_check CHECK (assignment_type IN ('internal', 'external'))
);

-- Enable and Force RLS on assignment_record
ALTER TABLE public.assignment_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_record FORCE ROW LEVEL SECURITY;

-- Allowlist RLS policies for assignment_record (append-only: SELECT + INSERT only)
CREATE POLICY "assignment_record_select_allowlist" ON public.assignment_record
FOR SELECT USING ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

CREATE POLICY "assignment_record_insert_allowlist" ON public.assignment_record
FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'info@devmart.sr');

-- NO UPDATE or DELETE policies for assignment_record (append-only)

-- Create indexes for performance
CREATE INDEX idx_district_quota_district_code ON public.district_quota(district_code);
CREATE INDEX idx_district_quota_period ON public.district_quota(period_start, period_end);
CREATE INDEX idx_allocation_run_district ON public.allocation_run(district_code);
CREATE INDEX idx_allocation_run_status ON public.allocation_run(run_status);
CREATE INDEX idx_allocation_candidate_run ON public.allocation_candidate(run_id);
CREATE INDEX idx_allocation_candidate_registration ON public.allocation_candidate(registration_id);
CREATE INDEX idx_allocation_decision_run ON public.allocation_decision(run_id);
CREATE INDEX idx_allocation_decision_registration ON public.allocation_decision(registration_id);
CREATE INDEX idx_assignment_record_registration ON public.assignment_record(registration_id);