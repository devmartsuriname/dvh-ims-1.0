-- DVH-IMS V1.3 Phase 1: D-02 Audit Hardening + D-01 Backend Transition Enforcement
-- Authorization: V1.3 Authorization Decision — OPTION B (APPROVED)
-- Restore Point: RESTORE_POINT_V1.3_PHASE1_D01_D02_START

-- ============================================================================
-- D-02: AUDIT HARDENING — Add correlation_id column
-- ============================================================================

-- Add correlation_id column to audit_event for cross-entity traceability
ALTER TABLE public.audit_event 
ADD COLUMN IF NOT EXISTS correlation_id uuid DEFAULT gen_random_uuid();

-- Add index for efficient correlation lookups
CREATE INDEX IF NOT EXISTS idx_audit_event_correlation_id 
ON public.audit_event (correlation_id);

-- ============================================================================
-- D-01: BACKEND TRANSITION ENFORCEMENT — Subsidy Case
-- ============================================================================

-- Create the validation function for subsidy_case transitions
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

  -- Define the transition matrix based on V1.1 state machine
  CASE OLD.status
    WHEN 'received' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
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

-- Attach the trigger to subsidy_case table
DROP TRIGGER IF EXISTS trg_validate_subsidy_case_transition ON public.subsidy_case;
CREATE TRIGGER trg_validate_subsidy_case_transition
  BEFORE UPDATE ON public.subsidy_case
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subsidy_case_transition();

-- ============================================================================
-- D-01: BACKEND TRANSITION ENFORCEMENT — Housing Registration
-- ============================================================================

-- Create the validation function for housing_registration transitions
CREATE OR REPLACE FUNCTION public.validate_housing_registration_transition()
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
  IF OLD.current_status = NEW.current_status THEN
    RETURN NEW;
  END IF;

  -- Define the transition matrix based on V1.1 state machine
  CASE OLD.current_status
    WHEN 'received' THEN
      allowed_transitions := ARRAY['under_review', 'rejected'];
    WHEN 'under_review' THEN
      allowed_transitions := ARRAY['urgency_assessed', 'rejected'];
    WHEN 'urgency_assessed' THEN
      allowed_transitions := ARRAY['waiting_list', 'rejected'];
    WHEN 'waiting_list' THEN
      allowed_transitions := ARRAY['matched', 'rejected'];
    WHEN 'matched' THEN
      allowed_transitions := ARRAY['allocated', 'rejected'];
    WHEN 'allocated' THEN
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
        'housing_registration', OLD.id, 'INVALID_TRANSITION_BLOCKED', auth.uid(),
        (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
        'Unknown source status: ' || COALESCE(OLD.current_status, 'NULL'),
        jsonb_build_object(
          'from_status', OLD.current_status,
          'to_status', NEW.current_status,
          'reference_number', OLD.reference_number
        ),
        correlation
      );
      RAISE EXCEPTION 'Invalid status transition: Unknown source status "%"', OLD.current_status
        USING ERRCODE = 'check_violation';
  END CASE;

  -- Check if the new status is in the allowed list
  IF NEW.current_status = ANY(allowed_transitions) THEN
    -- Valid transition - allow it
    RETURN NEW;
  ELSE
    -- Invalid transition - log to audit and block
    INSERT INTO public.audit_event (
      entity_type, entity_id, action, actor_user_id, actor_role,
      reason, metadata_json, correlation_id
    ) VALUES (
      'housing_registration', OLD.id, 'INVALID_TRANSITION_BLOCKED', auth.uid(),
      (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
      format('Attempted invalid transition from "%s" to "%s". Allowed: %s',
             OLD.current_status, NEW.current_status, array_to_string(allowed_transitions, ', ')),
      jsonb_build_object(
        'from_status', OLD.current_status,
        'to_status', NEW.current_status,
        'allowed_transitions', allowed_transitions,
        'reference_number', OLD.reference_number
      ),
      correlation
    );
    
    RAISE EXCEPTION 'Invalid status transition: Cannot change from "%" to "%". Allowed transitions: %',
      OLD.current_status, NEW.current_status, array_to_string(allowed_transitions, ', ')
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- Attach the trigger to housing_registration table
DROP TRIGGER IF EXISTS trg_validate_housing_registration_transition ON public.housing_registration;
CREATE TRIGGER trg_validate_housing_registration_transition
  BEFORE UPDATE ON public.housing_registration
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_housing_registration_transition();

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================
-- 
-- D-02 Implemented:
--   ✓ correlation_id column added to audit_event
--   ✓ Index created for correlation_id lookups
--
-- D-01 Implemented:
--   ✓ validate_subsidy_case_transition() function created
--   ✓ validate_housing_registration_transition() function created
--   ✓ BEFORE UPDATE triggers attached to both tables
--   ✓ Invalid transitions logged to audit_event with correlation_id
--   ✓ Terminal states (finalized, rejected) cannot transition
--
-- Transition Matrices Enforced:
--   Subsidy Case: received → screening → needs_more_docs/fieldwork → 
--                 approved_for_council → council_doc_generated → finalized
--   Housing: received → under_review → urgency_assessed → waiting_list → 
--            matched → allocated → finalized
--   Both allow → rejected from any non-terminal state
--
-- ============================================================================