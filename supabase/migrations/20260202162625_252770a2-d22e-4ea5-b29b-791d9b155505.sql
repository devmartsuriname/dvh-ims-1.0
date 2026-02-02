-- Phase 4E Migration 2: RLS policies, function updates, and trigger updates for ministerial_advisor

-- 1. Update is_national_role() function to include ministerial_advisor
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('system_admin', 'minister', 'project_leader', 'audit', 'director', 'ministerial_advisor')
  )
$$;

-- 2. RLS Policies for ministerial_advisor role on subsidy_case
CREATE POLICY "ministerial_advisor_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ministerial_advisor'));

CREATE POLICY "ministerial_advisor_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ministerial_advisor'));

-- 3. RLS Policies for ministerial_advisor on person
CREATE POLICY "ministerial_advisor_select_person"
ON public.person
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ministerial_advisor'));

-- 4. RLS Policies for ministerial_advisor on household
CREATE POLICY "ministerial_advisor_select_household"
ON public.household
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ministerial_advisor'));

-- 5. RLS Policies for ministerial_advisor on audit_event
CREATE POLICY "ministerial_advisor_insert_audit_event"
ON public.audit_event
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'ministerial_advisor') 
  AND actor_user_id = auth.uid()
);

-- 6. RLS Policies for ministerial_advisor on subsidy_case_status_history
CREATE POLICY "ministerial_advisor_select_status_history"
ON public.subsidy_case_status_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ministerial_advisor'));

CREATE POLICY "ministerial_advisor_insert_status_history"
ON public.subsidy_case_status_history
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'ministerial_advisor')
  AND EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
  )
);

-- 7. RLS Policies for ministerial_advisor on admin_notification
CREATE POLICY "ministerial_advisor_select_admin_notification"
ON public.admin_notification
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'ministerial_advisor')
  AND (
    recipient_user_id = auth.uid()
    OR recipient_role = 'ministerial_advisor'
  )
);

CREATE POLICY "ministerial_advisor_update_admin_notification"
ON public.admin_notification
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'ministerial_advisor')
  AND (
    recipient_user_id = auth.uid()
    OR recipient_role = 'ministerial_advisor'
  )
)
WITH CHECK (is_read IS NOT NULL);

CREATE POLICY "ministerial_advisor_insert_admin_notification"
ON public.admin_notification
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'ministerial_advisor'));

-- 8. Update validate_subsidy_case_transition() trigger with ministerial advisor states
CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  allowed_transitions text[];
  correlation uuid := gen_random_uuid();
BEGIN
  -- Only validate if status is actually changing
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define the transition matrix based on V1.3 Phase 4E state machine
  -- Includes social review (4A), technical review (4B), admin review (4C), 
  -- director approval (4D), and ministerial advisor (4E) states
  CASE OLD.status
    -- Initial state - can go to social review or legacy screening path
    WHEN 'received' THEN
      allowed_transitions := ARRAY['in_social_review', 'screening', 'rejected'];
    
    -- Social Field Worker states (Phase 4A)
    WHEN 'in_social_review' THEN
      allowed_transitions := ARRAY['social_completed', 'returned_to_intake', 'rejected'];
    WHEN 'returned_to_intake' THEN
      allowed_transitions := ARRAY['in_social_review', 'rejected'];
    WHEN 'social_completed' THEN
      allowed_transitions := ARRAY['in_technical_review', 'rejected'];
    
    -- Technical Inspector states (Phase 4B)
    WHEN 'in_technical_review' THEN
      allowed_transitions := ARRAY['technical_approved', 'returned_to_social', 'rejected'];
    WHEN 'returned_to_social' THEN
      allowed_transitions := ARRAY['in_social_review', 'rejected'];
    WHEN 'technical_approved' THEN
      -- Phase 4C: MUST go through admin review
      allowed_transitions := ARRAY['in_admin_review', 'rejected'];
    
    -- Administrative Officer states (Phase 4C)
    WHEN 'in_admin_review' THEN
      allowed_transitions := ARRAY['admin_complete', 'returned_to_technical', 'rejected'];
    WHEN 'returned_to_technical' THEN
      allowed_transitions := ARRAY['in_technical_review', 'rejected'];
    WHEN 'admin_complete' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    
    -- Screening and fieldwork states
    WHEN 'screening' THEN
      allowed_transitions := ARRAY['needs_more_docs', 'fieldwork', 'rejected'];
    WHEN 'needs_more_docs' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    
    -- Phase 4D: Fieldwork goes to director approval
    WHEN 'fieldwork' THEN
      allowed_transitions := ARRAY['awaiting_director_approval', 'rejected'];
    
    -- Director Approval states (Phase 4D)
    WHEN 'awaiting_director_approval' THEN
      allowed_transitions := ARRAY['director_approved', 'returned_to_screening', 'rejected'];
    WHEN 'returned_to_screening' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    
    -- Phase 4E: Director approved now goes to ministerial advice
    WHEN 'director_approved' THEN
      allowed_transitions := ARRAY['in_ministerial_advice', 'rejected'];
    
    -- NEW Ministerial Advisor states (Phase 4E)
    WHEN 'in_ministerial_advice' THEN
      allowed_transitions := ARRAY['ministerial_advice_complete', 'returned_to_director', 'rejected'];
    WHEN 'returned_to_director' THEN
      allowed_transitions := ARRAY['awaiting_director_approval', 'rejected'];
    WHEN 'ministerial_advice_complete' THEN
      allowed_transitions := ARRAY['approved_for_council', 'rejected'];
    
    -- Post-ministerial advice states (unchanged flow)
    WHEN 'approved_for_council' THEN
      allowed_transitions := ARRAY['council_doc_generated', 'rejected'];
    WHEN 'council_doc_generated' THEN
      allowed_transitions := ARRAY['finalized', 'rejected'];
    WHEN 'finalized' THEN
      allowed_transitions := ARRAY[]::text[];  -- Terminal state
    WHEN 'rejected' THEN
      allowed_transitions := ARRAY[]::text[];  -- Terminal state
    ELSE
      -- Unknown status - block transition and log
      INSERT INTO public.audit_event (
        entity_type, entity_id, action, actor_user_id, actor_role,
        reason, metadata_json, correlation_id
      ) VALUES (
        'subsidy_case', OLD.id, 'INVALID_TRANSITION_BLOCKED', auth.uid(), 
        (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
        'Unknown source status: ' || COALESCE(OLD.status, 'NULL'),
        jsonb_build_object(
          'from_status', OLD.status,
          'to_status', NEW.status,
          'case_number', OLD.case_number
        ),
        correlation
      );
      RAISE EXCEPTION 'Invalid status transition: Unknown source status "%"', OLD.status
        USING ERRCODE = 'check_violation';
  END CASE;

  -- Check if the new status is in the allowed list
  IF NEW.status = ANY(allowed_transitions) THEN
    -- Valid transition - allow it
    RETURN NEW;
  ELSE
    -- Invalid transition - log to audit and block
    INSERT INTO public.audit_event (
      entity_type, entity_id, action, actor_user_id, actor_role,
      reason, metadata_json, correlation_id
    ) VALUES (
      'subsidy_case', OLD.id, 'INVALID_TRANSITION_BLOCKED', auth.uid(),
      (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
      format('Attempted invalid transition from "%s" to "%s". Allowed: %s',
             OLD.status, NEW.status, array_to_string(allowed_transitions, ', ')),
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'allowed_transitions', allowed_transitions,
        'case_number', OLD.case_number
      ),
      correlation
    );
    
    RAISE EXCEPTION 'Invalid status transition: Cannot change from "%" to "%". Allowed transitions: %',
      OLD.status, NEW.status, array_to_string(allowed_transitions, ', ')
      USING ERRCODE = 'check_violation';
  END IF;
END;
$function$;