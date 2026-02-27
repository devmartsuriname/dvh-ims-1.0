DROP POLICY IF EXISTS "anon_can_select_person_for_status" ON person;
DROP POLICY IF EXISTS "anon_can_select_subsidy_case_status" ON subsidy_case;
DROP POLICY IF EXISTS "anon_can_select_housing_registration_status" ON housing_registration;
DROP POLICY IF EXISTS "anon_can_select_subsidy_status_history" ON subsidy_case_status_history;
DROP POLICY IF EXISTS "anon_can_select_housing_status_history" ON housing_registration_status_history;
DROP POLICY IF EXISTS "anon_can_insert_audit_event" ON audit_event;