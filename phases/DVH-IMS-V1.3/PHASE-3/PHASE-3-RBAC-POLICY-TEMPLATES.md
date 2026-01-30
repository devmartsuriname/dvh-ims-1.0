# DVH-IMS V1.3 — Phase 3 RBAC Policy Templates

**Document Type:** RLS Policy Template Specification  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 3 — Role & Workflow Activation Preparation  
**Status:** PREPARED — NOT APPLIED

---

## 1. Document Purpose

This document contains **prepared RLS policy templates** for the 4 roles that are documented in V1.2 but NOT YET instantiated in the database. These policies are **templates only** and are **NOT applied** to the database.

**CRITICAL:** The SQL in this document is for DOCUMENTATION PURPOSES ONLY. It must NOT be executed until explicit activation authorization is granted.

---

## 2. Current RLS Policy State

The database currently uses V1.1 RLS policies with the following structure:

- Policies reference `has_role()`, `has_any_role()`, `is_national_role()`, and `get_user_district()` functions
- All policies reference the 7 active roles only
- District scoping is enforced for district-scoped roles

---

## 3. Security Function Templates

### 3.1 Updated is_national_role Function

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- This function update adds the new national roles

CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role IN (
      'system_admin',
      'minister',
      'project_leader',
      'audit',
      -- NEW NATIONAL ROLES (prepared)
      'director',
      'ministerial_advisor'
    )
  )
$$;

-- Note: social_field_worker and technical_inspector are DISTRICT-SCOPED
-- They are NOT included in is_national_role
```

### 3.2 Service Applicability Function (New)

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- New function to validate role-service applicability

CREATE OR REPLACE FUNCTION public.is_role_applicable_to_service(
  _role app_role,
  _service text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    -- Bouwsubsidie-only roles
    WHEN _role IN ('frontdesk_bouwsubsidie', 'technical_inspector', 'ministerial_advisor', 'minister')
      THEN _service = 'bouwsubsidie'
    -- Woningregistratie-only roles
    WHEN _role = 'frontdesk_housing'
      THEN _service = 'woningregistratie'
    -- Both services
    WHEN _role IN ('system_admin', 'social_field_worker', 'admin_staff', 'project_leader', 'director', 'audit')
      THEN TRUE
    ELSE FALSE
  END
$$;
```

---

## 4. Social Field Worker Policy Templates

### 4.1 subsidy_case Policies

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: social_field_worker
-- Table: subsidy_case

-- SELECT: Can view cases in their district that are in social review status
/*
CREATE POLICY "social_field_worker_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
);
*/

-- UPDATE: Can update cases during social review
/*
CREATE POLICY "social_field_worker_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status = 'IN_SOCIAL_REVIEW'
)
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('IN_SOCIAL_REVIEW', 'SOCIAL_COMPLETED', 'RETURNED_TO_INTAKE')
);
*/
```

### 4.2 housing_registration Policies

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: social_field_worker
-- Table: housing_registration

-- SELECT: Can view registrations in their district during social review
/*
CREATE POLICY "social_field_worker_select_housing_registration"
ON public.housing_registration
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND current_status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
);
*/

-- UPDATE: Can update registrations during social review
/*
CREATE POLICY "social_field_worker_update_housing_registration"
ON public.housing_registration
FOR UPDATE
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND current_status = 'IN_SOCIAL_REVIEW'
)
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND current_status IN ('IN_SOCIAL_REVIEW', 'SOCIAL_COMPLETED', 'RETURNED_TO_INTAKE')
);
*/
```

### 4.3 Related Table Access

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: social_field_worker
-- Tables: person, household, household_member

-- SELECT on person: Via case/registration access
/*
CREATE POLICY "social_field_worker_select_person"
ON public.person
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND (
    -- Access via subsidy_case
    id IN (
      SELECT applicant_person_id FROM subsidy_case
      WHERE district_code = get_user_district(auth.uid())
      AND status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
    )
    OR
    -- Access via housing_registration
    id IN (
      SELECT applicant_person_id FROM housing_registration
      WHERE district_code = get_user_district(auth.uid())
      AND current_status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
    )
  )
);
*/

-- SELECT on household: Via case/registration access
/*
CREATE POLICY "social_field_worker_select_household"
ON public.household
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND (
    -- Access via subsidy_case
    id IN (
      SELECT household_id FROM subsidy_case
      WHERE district_code = get_user_district(auth.uid())
      AND status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
    )
    OR
    -- Access via housing_registration
    id IN (
      SELECT household_id FROM housing_registration
      WHERE district_code = get_user_district(auth.uid())
      AND current_status IN ('SUBMITTED', 'IN_SOCIAL_REVIEW')
    )
  )
);
*/
```

---

## 5. Technical Inspector Policy Templates

### 5.1 subsidy_case Policies

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: technical_inspector
-- Table: subsidy_case
-- Service: Bouwsubsidie ONLY

-- SELECT: Can view cases in their district after social completion
/*
CREATE POLICY "technical_inspector_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('SOCIAL_COMPLETED', 'IN_TECHNICAL_REVIEW')
);
*/

-- UPDATE: Can update cases during technical review
/*
CREATE POLICY "technical_inspector_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status = 'IN_TECHNICAL_REVIEW'
)
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND district_code = get_user_district(auth.uid())
  AND status IN ('IN_TECHNICAL_REVIEW', 'TECHNICAL_APPROVED', 'TECHNICAL_REJECTED', 'RETURNED_TO_SOCIAL')
);
*/
```

### 5.2 Technical Report Access

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: technical_inspector
-- Table: technical_report

-- SELECT: Can view technical reports for cases in review
/*
CREATE POLICY "technical_inspector_select_technical_report"
ON public.technical_report
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND case_id IN (
    SELECT id FROM subsidy_case
    WHERE district_code = get_user_district(auth.uid())
    AND status IN ('SOCIAL_COMPLETED', 'IN_TECHNICAL_REVIEW', 'TECHNICAL_APPROVED')
  )
);
*/

-- INSERT: Can create technical reports
/*
CREATE POLICY "technical_inspector_insert_technical_report"
ON public.technical_report
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND case_id IN (
    SELECT id FROM subsidy_case
    WHERE district_code = get_user_district(auth.uid())
    AND status = 'IN_TECHNICAL_REVIEW'
  )
);
*/

-- UPDATE: Can update own technical reports
/*
CREATE POLICY "technical_inspector_update_technical_report"
ON public.technical_report
FOR UPDATE
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND created_by = auth.uid()
  AND is_finalized = FALSE
)
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND created_by = auth.uid()
);
*/
```

---

## 6. Director Policy Templates

### 6.1 subsidy_case Policies (Bouwsubsidie)

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: director
-- Table: subsidy_case
-- Scope: NATIONAL (no district restriction)

-- SELECT: Can view all cases after policy approval
/*
CREATE POLICY "director_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND status IN ('POLICY_APPROVED', 'IN_DIRECTOR_REVIEW', 'DIRECTOR_APPROVED', 'DIRECTOR_REJECTED')
);
*/

-- UPDATE: Can update cases during director review
/*
CREATE POLICY "director_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND status = 'IN_DIRECTOR_REVIEW'
)
WITH CHECK (
  has_role(auth.uid(), 'director'::app_role)
  AND status IN ('IN_DIRECTOR_REVIEW', 'DIRECTOR_APPROVED', 'DIRECTOR_REJECTED', 'RETURNED_TO_POLICY')
);
*/
```

### 6.2 housing_registration Policies (Woningregistratie)

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: director
-- Table: housing_registration
-- Scope: NATIONAL (no district restriction)
-- Note: Director is FINAL DECISION AUTHORITY for Woningregistratie

-- SELECT: Can view all registrations after policy approval
/*
CREATE POLICY "director_select_housing_registration"
ON public.housing_registration
FOR SELECT
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND current_status IN ('POLICY_APPROVED', 'IN_DIRECTOR_REVIEW', 'REGISTERED', 'REJECTED')
);
*/

-- UPDATE: Can update registrations during director review (FINAL DECISION)
/*
CREATE POLICY "director_update_housing_registration"
ON public.housing_registration
FOR UPDATE
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND current_status = 'IN_DIRECTOR_REVIEW'
)
WITH CHECK (
  has_role(auth.uid(), 'director'::app_role)
  AND current_status IN ('IN_DIRECTOR_REVIEW', 'REGISTERED', 'REJECTED', 'RETURNED_TO_POLICY')
);
*/
```

---

## 7. Ministerial Advisor Policy Templates

### 7.1 subsidy_case Policies

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: ministerial_advisor
-- Table: subsidy_case
-- Scope: NATIONAL (no district restriction)
-- Service: Bouwsubsidie ONLY

-- SELECT: Can view all cases after director approval
/*
CREATE POLICY "ministerial_advisor_select_subsidy_case"
ON public.subsidy_case
FOR SELECT
USING (
  has_role(auth.uid(), 'ministerial_advisor'::app_role)
  AND status IN ('DIRECTOR_APPROVED', 'IN_MINISTERIAL_ADVICE', 'ADVICE_COMPLETE')
);
*/

-- UPDATE: Can update cases during ministerial advice
/*
CREATE POLICY "ministerial_advisor_update_subsidy_case"
ON public.subsidy_case
FOR UPDATE
USING (
  has_role(auth.uid(), 'ministerial_advisor'::app_role)
  AND status = 'IN_MINISTERIAL_ADVICE'
)
WITH CHECK (
  has_role(auth.uid(), 'ministerial_advisor'::app_role)
  AND status IN ('IN_MINISTERIAL_ADVICE', 'ADVICE_COMPLETE', 'RETURNED_TO_DIRECTOR')
);
*/
```

### 7.2 No housing_registration Access

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Role: ministerial_advisor
-- Table: housing_registration
-- SERVICE RESTRICTION: Ministerial Advisor has NO ACCESS to Woningregistratie

-- No policies for housing_registration
-- Woningregistratie decisions are finalized by Director
```

---

## 8. Audit Event Policies

### 8.1 audit_event Insert Policies

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- All new roles can create audit events

/*
CREATE POLICY "social_field_worker_insert_audit_event"
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND actor_user_id = auth.uid()
);

CREATE POLICY "technical_inspector_insert_audit_event"
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND actor_user_id = auth.uid()
);

CREATE POLICY "director_insert_audit_event"
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'director'::app_role)
  AND actor_user_id = auth.uid()
);

CREATE POLICY "ministerial_advisor_insert_audit_event"
ON public.audit_event
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'ministerial_advisor'::app_role)
  AND actor_user_id = auth.uid()
);
*/
```

---

## 9. Admin Notification Policies

### 9.1 Notification Access for New Roles

```sql
-- PREPARED TEMPLATE — NOT APPLIED
-- Notification access for new roles

/*
CREATE POLICY "social_field_worker_select_admin_notification"
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'social_field_worker'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'social_field_worker'
      AND district_code = get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "technical_inspector_select_admin_notification"
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'technical_inspector'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR (
      recipient_role = 'technical_inspector'
      AND district_code = get_user_district(auth.uid())
    )
  )
);

CREATE POLICY "director_select_admin_notification"
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'director'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR recipient_role = 'director'
  )
);

CREATE POLICY "ministerial_advisor_select_admin_notification"
ON public.admin_notification
FOR SELECT
USING (
  has_role(auth.uid(), 'ministerial_advisor'::app_role)
  AND (
    recipient_user_id = auth.uid()
    OR recipient_role = 'ministerial_advisor'
  )
);
*/
```

---

## 10. Policy Activation Checklist

### 10.1 Pre-Activation Requirements

| # | Requirement | Status |
|---|-------------|--------|
| 1 | app_role enum extended with 4 new values | ⏸️ REQUIRED |
| 2 | is_national_role function updated | ⏸️ REQUIRED |
| 3 | is_role_applicable_to_service function created | ⏸️ REQUIRED |
| 4 | Status enums extended | ⏸️ REQUIRED |
| 5 | Accounts created for new roles | ⏸️ REQUIRED |

### 10.2 Policy Application Order

1. Security function updates
2. subsidy_case policies
3. housing_registration policies
4. Related table policies (person, household)
5. Report table policies (technical_report, social_report)
6. audit_event policies
7. admin_notification policies

---

## 11. Governance Statement

**This document contains RLS policy TEMPLATES ONLY.**

**No policies in this document are applied to the database.**

**Application requires explicit authorization and a dedicated implementation phase.**

**The current system operates with V1.1 RLS policies only.**

---

**PHASE 3 — RBAC POLICY TEMPLATES — COMPLETE**

---

**END OF DOCUMENT**
