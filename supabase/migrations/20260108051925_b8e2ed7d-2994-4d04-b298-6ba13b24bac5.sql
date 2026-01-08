-- Phase 9: Anonymous INSERT RLS Policies for Public Wizard Submissions
-- These policies allow anonymous (unauthenticated) users to submit via Edge Functions

-- 1. Anonymous INSERT policy for person table
CREATE POLICY "anon_can_insert_person"
ON public.person
FOR INSERT
TO anon
WITH CHECK (true);

-- 2. Anonymous INSERT policy for household table
CREATE POLICY "anon_can_insert_household"
ON public.household
FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Anonymous INSERT policy for household_member table
CREATE POLICY "anon_can_insert_household_member"
ON public.household_member
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Anonymous INSERT policy for address table
CREATE POLICY "anon_can_insert_address"
ON public.address
FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Anonymous INSERT policy for contact_point table
CREATE POLICY "anon_can_insert_contact_point"
ON public.contact_point
FOR INSERT
TO anon
WITH CHECK (true);

-- 6. Anonymous INSERT policy for subsidy_case table
CREATE POLICY "anon_can_insert_subsidy_case"
ON public.subsidy_case
FOR INSERT
TO anon
WITH CHECK (true);

-- 7. Anonymous INSERT policy for housing_registration table
CREATE POLICY "anon_can_insert_housing_registration"
ON public.housing_registration
FOR INSERT
TO anon
WITH CHECK (true);

-- 8. Anonymous INSERT policy for public_status_access table
CREATE POLICY "anon_can_insert_public_status_access"
ON public.public_status_access
FOR INSERT
TO anon
WITH CHECK (true);

-- 9. Anonymous INSERT policy for housing_registration_status_history table
CREATE POLICY "anon_can_insert_housing_status_history"
ON public.housing_registration_status_history
FOR INSERT
TO anon
WITH CHECK (true);

-- 10. Anonymous INSERT policy for subsidy_case_status_history table
CREATE POLICY "anon_can_insert_subsidy_status_history"
ON public.subsidy_case_status_history
FOR INSERT
TO anon
WITH CHECK (true);

-- 11. Anonymous INSERT policy for audit_event table (public submissions only)
CREATE POLICY "anon_can_insert_audit_event"
ON public.audit_event
FOR INSERT
TO anon
WITH CHECK (actor_user_id IS NULL AND actor_role = 'public');

-- 12. Anonymous SELECT policy for public_status_access (for lookup validation)
-- Note: Actual token validation happens in Edge Function; this allows the query
CREATE POLICY "anon_can_select_public_status_access"
ON public.public_status_access
FOR SELECT
TO anon
USING (true);

-- 13. Anonymous SELECT policy for subsidy_case (limited fields for status lookup)
CREATE POLICY "anon_can_select_subsidy_case_status"
ON public.subsidy_case
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.public_status_access psa 
    WHERE psa.entity_id = subsidy_case.id 
    AND psa.entity_type = 'subsidy_case'
  )
);

-- 14. Anonymous SELECT policy for housing_registration (for status lookup)
CREATE POLICY "anon_can_select_housing_registration_status"
ON public.housing_registration
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.public_status_access psa 
    WHERE psa.entity_id = housing_registration.id 
    AND psa.entity_type = 'housing_registration'
  )
);

-- 15. Anonymous SELECT policy for person (for status lookup - applicant name)
CREATE POLICY "anon_can_select_person_for_status"
ON public.person
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    JOIN public.public_status_access psa ON psa.entity_id = sc.id
    WHERE sc.applicant_person_id = person.id
    AND psa.entity_type = 'subsidy_case'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    JOIN public.public_status_access psa ON psa.entity_id = hr.id
    WHERE hr.applicant_person_id = person.id
    AND psa.entity_type = 'housing_registration'
  )
);

-- 16. Anonymous SELECT policy for subsidy_case_status_history (for timeline)
CREATE POLICY "anon_can_select_subsidy_status_history"
ON public.subsidy_case_status_history
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.public_status_access psa 
    WHERE psa.entity_id = subsidy_case_status_history.case_id 
    AND psa.entity_type = 'subsidy_case'
  )
);

-- 17. Anonymous SELECT policy for housing_registration_status_history (for timeline)
CREATE POLICY "anon_can_select_housing_status_history"
ON public.housing_registration_status_history
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.public_status_access psa 
    WHERE psa.entity_id = housing_registration_status_history.registration_id 
    AND psa.entity_type = 'housing_registration'
  )
);