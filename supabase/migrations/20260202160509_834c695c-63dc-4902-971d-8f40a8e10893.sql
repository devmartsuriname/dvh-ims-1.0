-- Phase 4D: Director Activation for Bouwsubsidie - Part 2
-- RLS Policies and Trigger Update (enum must be committed first)

-- Step 2: Create RLS policies for Director role on subsidy_case

-- Director SELECT policy (National scope)
CREATE POLICY "director_select_subsidy_case" 
ON public.subsidy_case 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

-- Director UPDATE policy (National scope)
CREATE POLICY "director_update_subsidy_case" 
ON public.subsidy_case 
FOR UPDATE 
USING (has_role(auth.uid(), 'director'::app_role))
WITH CHECK (has_role(auth.uid(), 'director'::app_role));

-- Step 3: Create RLS policies for Director on person table
CREATE POLICY "director_select_person" 
ON public.person 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

-- Step 4: Create RLS policies for Director on household table
CREATE POLICY "director_select_household" 
ON public.household 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

-- Step 5: Create RLS policies for Director on audit_event table
CREATE POLICY "director_insert_audit_event" 
ON public.audit_event 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'director'::app_role) 
  AND actor_user_id = auth.uid()
);

-- Step 6: Create RLS policies for Director on subsidy_case_status_history table

-- Director SELECT policy
CREATE POLICY "director_select_status_history" 
ON public.subsidy_case_status_history 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

-- Director INSERT policy
CREATE POLICY "director_insert_status_history" 
ON public.subsidy_case_status_history 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'director'::app_role));

-- Step 7: Create RLS policy for Director on admin_notification table

-- Director SELECT policy
CREATE POLICY "director_select_admin_notification" 
ON public.admin_notification 
FOR SELECT 
USING (
  has_role(auth.uid(), 'director'::app_role) 
  AND (
    (recipient_user_id = auth.uid()) 
    OR (recipient_role = 'director')
  )
);

-- Director UPDATE policy (to mark as read)
CREATE POLICY "director_update_admin_notification" 
ON public.admin_notification 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'director'::app_role) 
  AND (
    (recipient_user_id = auth.uid()) 
    OR (recipient_role = 'director')
  )
)
WITH CHECK (is_read IS NOT NULL);

-- Director INSERT policy (to create notifications)
CREATE POLICY "director_insert_admin_notification" 
ON public.admin_notification 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'director'::app_role));

-- Step 8: Update validate_subsidy_case_transition() trigger function
-- Now includes director approval states in the workflow
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

  -- Define the transition matrix based on V1.3 Phase 4D state machine
  -- Includes social review (4A), technical review (4B), admin review (4C), and director approval (4D) states
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
    
    -- Phase 4D: Fieldwork now goes to director approval
    WHEN 'fieldwork' THEN
      allowed_transitions := ARRAY['awaiting_director_approval', 'rejected'];
    
    -- NEW Director Approval states (Phase 4D)
    WHEN 'awaiting_director_approval' THEN
      allowed_transitions := ARRAY['director_approved', 'returned_to_screening', 'rejected'];
    WHEN 'returned_to_screening' THEN
      allowed_transitions := ARRAY['screening', 'rejected'];
    WHEN 'director_approved' THEN
      allowed_transitions := ARRAY['approved_for_council', 'rejected'];
    
    -- Post-director approval states (unchanged)
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