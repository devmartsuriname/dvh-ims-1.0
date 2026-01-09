-- PHASE 11: RLS Policy Replacement Migration
-- Replaces allowlist policies with role-based policies for all 23 tables

-- ============================================
-- SHARED CORE TABLES (5)
-- ============================================

-- PERSON TABLE
DROP POLICY IF EXISTS "Allowlist users can read person" ON public.person;
DROP POLICY IF EXISTS "Allowlist users can insert person" ON public.person;
DROP POLICY IF EXISTS "Allowlist users can update person" ON public.person;

CREATE POLICY "role_select_person" ON public.person
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'minister') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'audit') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

CREATE POLICY "role_insert_person" ON public.person
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

CREATE POLICY "role_update_person" ON public.person
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
)
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

-- HOUSEHOLD TABLE
DROP POLICY IF EXISTS "Allowlist users can read household" ON public.household;
DROP POLICY IF EXISTS "Allowlist users can insert household" ON public.household;
DROP POLICY IF EXISTS "Allowlist users can update household" ON public.household;

CREATE POLICY "role_select_household" ON public.household
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_household" ON public.household
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_update_household" ON public.household
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

-- HOUSEHOLD_MEMBER TABLE
DROP POLICY IF EXISTS "Allowlist users can read household_member" ON public.household_member;
DROP POLICY IF EXISTS "Allowlist users can insert household_member" ON public.household_member;
DROP POLICY IF EXISTS "Allowlist users can update household_member" ON public.household_member;

CREATE POLICY "role_select_household_member" ON public.household_member
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.household h
    WHERE h.id = household_member.household_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND h.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_household_member" ON public.household_member
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.household h
    WHERE h.id = household_member.household_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND h.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_update_household_member" ON public.household_member
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.household h
    WHERE h.id = household_member.household_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'frontdesk_housing') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND h.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- CONTACT_POINT TABLE
DROP POLICY IF EXISTS "Allowlist users can read contact_point" ON public.contact_point;
DROP POLICY IF EXISTS "Allowlist users can insert contact_point" ON public.contact_point;
DROP POLICY IF EXISTS "Allowlist users can update contact_point" ON public.contact_point;

CREATE POLICY "role_select_contact_point" ON public.contact_point
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'minister') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'audit') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

CREATE POLICY "role_insert_contact_point" ON public.contact_point
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

CREATE POLICY "role_update_contact_point" ON public.contact_point
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'frontdesk_housing') OR
  public.has_role(auth.uid(), 'admin_staff')
);

-- ADDRESS TABLE
DROP POLICY IF EXISTS "Allowlist users can read address" ON public.address;
DROP POLICY IF EXISTS "Allowlist users can insert address" ON public.address;
DROP POLICY IF EXISTS "Allowlist users can update address" ON public.address;

CREATE POLICY "role_select_address" ON public.address
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_address" ON public.address
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_update_address" ON public.address
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'frontdesk_housing') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

-- ============================================
-- BOUWSUBSIDIE MODULE TABLES (7)
-- ============================================

-- SUBSIDY_CASE TABLE
DROP POLICY IF EXISTS "Allowlist users can read subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "Allowlist users can insert subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "Allowlist users can update subsidy_case" ON public.subsidy_case;

CREATE POLICY "role_select_subsidy_case" ON public.subsidy_case
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_insert_subsidy_case" ON public.subsidy_case
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

CREATE POLICY "role_update_subsidy_case" ON public.subsidy_case
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  (
    (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
     public.has_role(auth.uid(), 'admin_staff'))
    AND district_code = public.get_user_district(auth.uid())
  )
);

-- SUBSIDY_CASE_STATUS_HISTORY TABLE
DROP POLICY IF EXISTS "Allowlist users can read subsidy_case_status_history" ON public.subsidy_case_status_history;
DROP POLICY IF EXISTS "Allowlist users can insert subsidy_case_status_history" ON public.subsidy_case_status_history;

CREATE POLICY "role_select_subsidy_case_status_history" ON public.subsidy_case_status_history
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_subsidy_case_status_history" ON public.subsidy_case_status_history
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'minister') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_case_status_history.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- SUBSIDY_DOCUMENT_REQUIREMENT TABLE
DROP POLICY IF EXISTS "Allowlist users can read subsidy_document_requirement" ON public.subsidy_document_requirement;
DROP POLICY IF EXISTS "Allowlist users can insert subsidy_document_requirement" ON public.subsidy_document_requirement;
DROP POLICY IF EXISTS "Allowlist users can update subsidy_document_requirement" ON public.subsidy_document_requirement;

CREATE POLICY "role_select_subsidy_document_requirement" ON public.subsidy_document_requirement
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'minister') OR
  public.has_role(auth.uid(), 'project_leader') OR
  public.has_role(auth.uid(), 'audit') OR
  public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
  public.has_role(auth.uid(), 'admin_staff')
);

CREATE POLICY "role_insert_subsidy_document_requirement" ON public.subsidy_document_requirement
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

CREATE POLICY "role_update_subsidy_document_requirement" ON public.subsidy_document_requirement
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader')
);

-- SUBSIDY_DOCUMENT_UPLOAD TABLE
DROP POLICY IF EXISTS "Allowlist users can read subsidy_document_upload" ON public.subsidy_document_upload;
DROP POLICY IF EXISTS "Allowlist users can insert subsidy_document_upload" ON public.subsidy_document_upload;
DROP POLICY IF EXISTS "Allowlist users can update subsidy_document_upload" ON public.subsidy_document_upload;

CREATE POLICY "role_select_subsidy_document_upload" ON public.subsidy_document_upload
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_document_upload.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_subsidy_document_upload" ON public.subsidy_document_upload
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_document_upload.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_update_subsidy_document_upload" ON public.subsidy_document_upload
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = subsidy_document_upload.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- SOCIAL_REPORT TABLE
DROP POLICY IF EXISTS "Allowlist users can read social_report" ON public.social_report;
DROP POLICY IF EXISTS "Allowlist users can insert social_report" ON public.social_report;
DROP POLICY IF EXISTS "Allowlist users can update social_report" ON public.social_report;

CREATE POLICY "role_select_social_report" ON public.social_report
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_social_report" ON public.social_report
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_update_social_report" ON public.social_report
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = social_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- TECHNICAL_REPORT TABLE
DROP POLICY IF EXISTS "Allowlist users can read technical_report" ON public.technical_report;
DROP POLICY IF EXISTS "Allowlist users can insert technical_report" ON public.technical_report;
DROP POLICY IF EXISTS "Allowlist users can update technical_report" ON public.technical_report;

CREATE POLICY "role_select_technical_report" ON public.technical_report
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_technical_report" ON public.technical_report
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_update_technical_report" ON public.technical_report
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = technical_report.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

-- GENERATED_DOCUMENT TABLE
DROP POLICY IF EXISTS "Allowlist users can read generated_document" ON public.generated_document;
DROP POLICY IF EXISTS "Allowlist users can insert generated_document" ON public.generated_document;

CREATE POLICY "role_select_generated_document" ON public.generated_document
FOR SELECT TO authenticated
USING (
  public.is_national_role(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = generated_document.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "role_insert_generated_document" ON public.generated_document
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'project_leader') OR
  EXISTS (
    SELECT 1 FROM public.subsidy_case sc
    WHERE sc.id = generated_document.case_id
    AND (
      (public.has_role(auth.uid(), 'frontdesk_bouwsubsidie') OR
       public.has_role(auth.uid(), 'admin_staff'))
      AND sc.district_code = public.get_user_district(auth.uid())
    )
  )
);