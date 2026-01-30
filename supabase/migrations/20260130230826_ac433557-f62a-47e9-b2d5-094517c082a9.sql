-- =====================================================================
-- DVH-IMS V1.3 Phase 4A: Step 2 - Trigger and RLS Policies
-- =====================================================================
-- This migration:
-- 1. Updates the subsidy_case transition trigger with new social review states
-- 2. Creates RLS policies for the social_field_worker role
-- =====================================================================

-- 1. Update the subsidy_case transition trigger to include social review states
CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  allowed_transitions text[];
  correlation uuid := gen_random_uuid();
BEGIN
  -- Only validate if status is actually changing
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define the transition matrix based on V1.3 Phase 4A state machine
  -- Includes new social review states for Bouwsubsidie workflow
  CASE OLD.status
    -- New social review workflow entry point
    WHEN 'received' THEN
      allowed_transitions := ARRAY['in_social_review', 'screening', 'rejected'];
    
    -- Social Field Worker states (NEW in Phase 4A)
    WHEN 'in_social_review' THEN
      allowed_transitions := ARRAY['social_completed', 'returned_to_intake', 'rejected'];
    WHEN 'returned_to_intake' THEN
      allowed_transitions := ARRAY['in_social_review', 'rejected'];
    WHEN 'social_completed' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    
    -- Existing V1.1 transitions (unchanged)
    WHEN 'screening' THEN
      allowed_transitions := ARRAY['needs_more_docs', 'fieldwork', 'rejected'];
    WHEN 'needs_more_docs' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    WHEN 'fieldwork' THEN
      allowed_transitions := ARRAY['approved_for_council', 'rejected'];
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

-- 2. Create RLS policies for social_field_worker role

-- Policy: social_field_worker can SELECT subsidy_case in their district
CREATE POLICY "social_field_worker_select_subsidy_case" 
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('received', 'in_social_review', 'returned_to_intake', 'social_completed')
);

-- Policy: social_field_worker can UPDATE subsidy_case only when in social review status
CREATE POLICY "social_field_worker_update_subsidy_case" 
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('received', 'in_social_review', 'returned_to_intake')
)
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
);

-- Policy: social_field_worker can SELECT person records for accessible cases
CREATE POLICY "social_field_worker_select_person" 
ON public.person
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.applicant_person_id = person.id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('received', 'in_social_review', 'returned_to_intake', 'social_completed')
  )
);

-- Policy: social_field_worker can SELECT household records for accessible cases
CREATE POLICY "social_field_worker_select_household" 
ON public.household
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.household_id = household.id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('received', 'in_social_review', 'returned_to_intake', 'social_completed')
  )
);

-- Policy: social_field_worker can SELECT social_report for accessible cases
CREATE POLICY "social_field_worker_select_social_report" 
ON public.social_report
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('received', 'in_social_review', 'returned_to_intake', 'social_completed')
  )
);

-- Policy: social_field_worker can INSERT social_report for cases in social review
CREATE POLICY "social_field_worker_insert_social_report" 
ON public.social_report
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('in_social_review', 'returned_to_intake')
  )
);

-- Policy: social_field_worker can UPDATE social_report for cases in social review
CREATE POLICY "social_field_worker_update_social_report" 
ON public.social_report
FOR UPDATE
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('in_social_review', 'returned_to_intake')
  )
  AND is_finalized = false
);

-- Policy: social_field_worker can INSERT audit_event for their own actions
CREATE POLICY "social_field_worker_insert_audit_event" 
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND actor_user_id = auth.uid()
);

-- Policy: social_field_worker can SELECT their own admin notifications
CREATE POLICY "social_field_worker_select_admin_notification" 
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'social_field_worker'
      AND (district_code IS NULL OR district_code = get_user_district(auth.uid()))
    )
  )
);

-- Policy: social_field_worker can UPDATE their own admin notifications (mark as read)
CREATE POLICY "social_field_worker_update_admin_notification" 
ON public.admin_notification
FOR UPDATE
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'social_field_worker'
      AND (district_code IS NULL OR district_code = get_user_district(auth.uid()))
    )
  )
)
WITH CHECK (
  is_read IS NOT NULL
);

-- Policy: social_field_worker can INSERT into subsidy_case_status_history
CREATE POLICY "social_field_worker_insert_subsidy_status_history" 
ON public.subsidy_case_status_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('received', 'in_social_review', 'returned_to_intake')
  )
);

-- Policy: social_field_worker can SELECT subsidy_case_status_history for accessible cases
CREATE POLICY "social_field_worker_select_subsidy_status_history" 
ON public.subsidy_case_status_history
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('received', 'in_social_review', 'returned_to_intake', 'social_completed')
  )
);