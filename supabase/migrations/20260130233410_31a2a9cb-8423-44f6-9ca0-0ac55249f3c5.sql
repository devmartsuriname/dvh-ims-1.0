-- =====================================================
-- DVH-IMS V1.3 Phase 4B Migration 2: Trigger + RLS Policies
-- Technical Inspector Activation (Bouwsubsidie Only)
-- =====================================================

-- 1. Update subsidy_case transition trigger with technical review states
CREATE OR REPLACE FUNCTION public.validate_subsidy_case_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_transitions text[];
  correlation uuid := gen_random_uuid();
BEGIN
  -- Only validate if status is actually changing
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define the transition matrix based on V1.3 Phase 4B state machine
  -- Includes social review states (Phase 4A) and technical review states (Phase 4B)
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
      -- Phase 4B: MUST go through technical review, direct to screening no longer allowed
      allowed_transitions := ARRAY['in_technical_review', 'rejected'];
    
    -- Technical Inspector states (NEW in Phase 4B)
    WHEN 'in_technical_review' THEN
      allowed_transitions := ARRAY['technical_approved', 'returned_to_social', 'rejected'];
    WHEN 'returned_to_social' THEN
      allowed_transitions := ARRAY['in_social_review', 'rejected'];
    WHEN 'technical_approved' THEN
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
$$;

-- =====================================================
-- 2. RLS Policies for technical_inspector role
-- =====================================================

-- 2.1 subsidy_case: SELECT (district + status filter)
CREATE POLICY "technical_inspector_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('social_completed', 'in_technical_review', 'returned_to_social', 'technical_approved')
);

-- 2.2 subsidy_case: UPDATE (district + eligible statuses only)
CREATE POLICY "technical_inspector_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('social_completed', 'in_technical_review')
)
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
);

-- 2.3 person: SELECT (via case access for applicant data)
CREATE POLICY "technical_inspector_select_person"
ON public.person
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.applicant_person_id = person.id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('social_completed', 'in_technical_review', 'returned_to_social', 'technical_approved')
  )
);

-- 2.4 household: SELECT (via case access)
CREATE POLICY "technical_inspector_select_household"
ON public.household
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.household_id = household.id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('social_completed', 'in_technical_review', 'returned_to_social', 'technical_approved')
  )
);

-- 2.5 technical_report: SELECT (via case access)
CREATE POLICY "technical_inspector_select_technical_report"
ON public.technical_report
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('social_completed', 'in_technical_review', 'returned_to_social', 'technical_approved')
  )
);

-- 2.6 technical_report: INSERT (only when case is in technical review)
CREATE POLICY "technical_inspector_insert_technical_report"
ON public.technical_report
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('in_technical_review', 'returned_to_social')
  )
);

-- 2.7 technical_report: UPDATE (only when case is in technical review and not finalized)
CREATE POLICY "technical_inspector_update_technical_report"
ON public.technical_report
FOR UPDATE
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('in_technical_review', 'returned_to_social')
  )
  AND is_finalized = false
);

-- 2.8 audit_event: INSERT (own actions only)
CREATE POLICY "technical_inspector_insert_audit_event"
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND actor_user_id = auth.uid()
);

-- 2.9 admin_notification: SELECT (own notifications by user or role/district)
CREATE POLICY "technical_inspector_select_admin_notification"
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'technical_inspector'
      AND (district_code IS NULL OR district_code = get_user_district(auth.uid()))
    )
  )
);

-- 2.10 admin_notification: UPDATE (mark as read)
CREATE POLICY "technical_inspector_update_admin_notification"
ON public.admin_notification
FOR UPDATE
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'technical_inspector'
      AND (district_code IS NULL OR district_code = get_user_district(auth.uid()))
    )
  )
)
WITH CHECK (
  is_read IS NOT NULL
);

-- 2.11 subsidy_case_status_history: INSERT (for status transitions)
CREATE POLICY "technical_inspector_insert_subsidy_status_history"
ON public.subsidy_case_status_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND sc.district_code = get_user_district(auth.uid())
  )
);

-- 2.12 subsidy_case_status_history: SELECT (view history for accessible cases)
CREATE POLICY "technical_inspector_select_subsidy_status_history"
ON public.subsidy_case_status_history
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND EXISTS (
    SELECT 1 FROM subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND sc.district_code = get_user_district(auth.uid())
    AND sc.status IN ('social_completed', 'in_technical_review', 'returned_to_social', 'technical_approved')
  )
);