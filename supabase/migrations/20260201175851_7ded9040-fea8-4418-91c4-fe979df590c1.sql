-- V1.3 Phase 4C: Administrative Officer Workflow Activation
-- Scope: Update subsidy_case transition trigger to enforce admin review step
-- Bouwsubsidie ONLY - No changes to Woningregistratie

-- Update the validate_subsidy_case_transition function to include admin review states
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

  -- Define the transition matrix based on V1.3 Phase 4C state machine
  -- Includes social review (4A), technical review (4B), and admin review (4C) states
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
      -- Phase 4C: MUST go through admin review, direct to screening no longer allowed
      allowed_transitions := ARRAY['in_admin_review', 'rejected'];
    
    -- Administrative Officer states (NEW in Phase 4C)
    WHEN 'in_admin_review' THEN
      allowed_transitions := ARRAY['admin_complete', 'returned_to_technical', 'rejected'];
    WHEN 'returned_to_technical' THEN
      allowed_transitions := ARRAY['in_technical_review', 'rejected'];
    WHEN 'admin_complete' THEN
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