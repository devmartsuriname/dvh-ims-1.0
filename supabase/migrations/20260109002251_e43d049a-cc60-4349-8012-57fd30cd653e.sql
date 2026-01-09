-- PHASE 11: RLS Policy Replacement - Housing Module & System Tables

-- ============================================
-- HOUSING MODULE TABLES (8)
-- ============================================

-- HOUSING_REGISTRATION TABLE
DROP POLICY IF EXISTS "housing_registration_select_allowlist" ON public.housing_registration;
DROP POLICY IF EXISTS "housing_registration_insert_allowlist" ON public.housing_registration;
DROP POLICY IF EXISTS "housing_registration_update_allowlist" ON public.housing_registration;

CREATE POLICY "role_select_housing_registration" ON public.housing_registration
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_housing_registration" ON public.housing_registration
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_update_housing_registration" ON public.housing_registration
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

-- HOUSING_REGISTRATION_STATUS_HISTORY TABLE
DROP POLICY IF EXISTS "housing_registration_status_history_select_allowlist" ON public.housing_registration_status_history;
DROP POLICY IF EXISTS "housing_registration_status_history_insert_allowlist" ON public.housing_registration_status_history;

CREATE POLICY "role_select_housing_registration_status_history" ON public.housing_registration_status_history
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = housing_registration_status_history.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_housing_registration_status_history" ON public.housing_registration_status_history
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = housing_registration_status_history.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- HOUSING_URGENCY TABLE
DROP POLICY IF EXISTS "housing_urgency_select_allowlist" ON public.housing_urgency;
DROP POLICY IF EXISTS "housing_urgency_insert_allowlist" ON public.housing_urgency;

CREATE POLICY "role_select_housing_urgency" ON public.housing_urgency
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = housing_urgency.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_housing_urgency" ON public.housing_urgency
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = housing_urgency.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- DISTRICT_QUOTA TABLE
DROP POLICY IF EXISTS "district_quota_select_allowlist" ON public.district_quota;
DROP POLICY IF EXISTS "district_quota_insert_allowlist" ON public.district_quota;
DROP POLICY IF EXISTS "district_quota_update_allowlist" ON public.district_quota;

CREATE POLICY "role_select_district_quota" ON public.district_quota
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_district_quota" ON public.district_quota
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

CREATE POLICY "role_update_district_quota" ON public.district_quota
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

-- ALLOCATION_RUN TABLE
DROP POLICY IF EXISTS "allocation_run_select_allowlist" ON public.allocation_run;
DROP POLICY IF EXISTS "allocation_run_insert_allowlist" ON public.allocation_run;
DROP POLICY IF EXISTS "allocation_run_update_allowlist" ON public.allocation_run;

CREATE POLICY "role_select_allocation_run" ON public.allocation_run
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_allocation_run" ON public.allocation_run
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

CREATE POLICY "role_update_allocation_run" ON public.allocation_run
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

-- ALLOCATION_CANDIDATE TABLE
DROP POLICY IF EXISTS "allocation_candidate_select_allowlist" ON public.allocation_candidate;
DROP POLICY IF EXISTS "allocation_candidate_insert_allowlist" ON public.allocation_candidate;

CREATE POLICY "role_select_allocation_candidate" ON public.allocation_candidate
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.allocation_run ar
    WHERE ar.id = allocation_candidate.run_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND ar.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_allocation_candidate" ON public.allocation_candidate
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

-- ALLOCATION_DECISION TABLE
DROP POLICY IF EXISTS "allocation_decision_select_allowlist" ON public.allocation_decision;
DROP POLICY IF EXISTS "allocation_decision_insert_allowlist" ON public.allocation_decision;

CREATE POLICY "role_select_allocation_decision" ON public.allocation_decision
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.allocation_run ar
    WHERE ar.id = allocation_decision.run_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND ar.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_allocation_decision" ON public.allocation_decision
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  EXISTS (
    SELECT 1 FROM public.allocation_run ar
    WHERE ar.id = allocation_decision.run_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND ar.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- ASSIGNMENT_RECORD TABLE
DROP POLICY IF EXISTS "assignment_record_select_allowlist" ON public.assignment_record;
DROP POLICY IF EXISTS "assignment_record_insert_allowlist" ON public.assignment_record;

CREATE POLICY "role_select_assignment_record" ON public.assignment_record
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = assignment_record.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_assignment_record" ON public.assignment_record
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.housing_registration hr
    WHERE hr.id = assignment_record.registration_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- ============================================
-- SYSTEM TABLES (3)
-- ============================================

-- APP_USER_PROFILE TABLE - Keep existing user self-access policies, add admin read
CREATE POLICY "role_select_all_app_user_profile" ON public.app_user_profile
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin')
);

CREATE POLICY "role_update_all_app_user_profile" ON public.app_user_profile
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "role_insert_app_user_profile" ON public.app_user_profile
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

-- PUBLIC_STATUS_ACCESS TABLE
DROP POLICY IF EXISTS "public_status_access_select_allowlist" ON public.public_status_access;
DROP POLICY IF EXISTS "public_status_access_insert_allowlist" ON public.public_status_access;
DROP POLICY IF EXISTS "public_status_access_update_allowlist" ON public.public_status_access;

CREATE POLICY "role_select_public_status_access" ON public.public_status_access
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'audit')
);

CREATE POLICY "role_insert_public_status_access" ON public.public_status_access
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

CREATE POLICY "role_update_public_status_access" ON public.public_status_access
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

-- AUDIT_EVENT TABLE - Add SELECT for audit role
DROP POLICY IF EXISTS "Allowlist users can insert audit_event" ON public.audit_event;

CREATE POLICY "role_select_audit_event" ON public.audit_event
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'audit') OR
  public.has_role(auth.uid(), 'system_admin')
);

CREATE POLICY "role_insert_audit_event" ON public.audit_event
FOR INSERT TO authenticated
WITH CHECK (
  actor_user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'system_admin') OR
    public.has_role(auth.uid(), 'minister') OR
    public.has_role(auth.uid(), 'project_leader') OR
    public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
    public.has_role(auth.uid(), 'frontdesk_housing') OR
    public.has_role(auth.uid(), 'admin_staff')
  )
);

-- ============================================
-- STORAGE POLICIES - generated-documents bucket
-- ============================================

-- Drop old allowlist storage policies
DROP POLICY IF EXISTS "admin_can_upload_documents" ON storage.objects;
DROP POLICY IF EXISTS "admin_can_download_documents" ON storage.objects;

-- Create role-based storage policies
CREATE POLICY "role_upload_documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'generated-documents' AND
  (
    public.has_role(auth.uid(), 'system_admin') OR
    public.has_role(auth.uid(), 'project_leader') OR
    public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
    public.has_role(auth.uid(), 'admin_staff')
  )
);

CREATE POLICY "role_download_documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'generated-documents' AND
  (
    public.has_role(auth.uid(), 'system_admin') OR
    public.has_role(auth.uid(), 'minister') OR
    public.has_role(auth.uid(), 'project_leader') OR
    public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
    public.has_role(auth.uid(), 'admin_staff') OR
    public.has_role(auth.uid(), 'audit')
  )
);