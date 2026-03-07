-- Phase 7 — Migration C: Add INSERT policy for housing_document_upload
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Finding: MEDIUM — No INSERT policy exists, blocking admin-side document uploads

CREATE POLICY "role_insert_housing_document_upload"
ON housing_document_upload
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'system_admin'::app_role)
  OR has_role(auth.uid(), 'project_leader'::app_role)
  OR (EXISTS (
    SELECT 1 FROM housing_registration hr
    WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing'::app_role)
           OR has_role(auth.uid(), 'admin_staff'::app_role))
      AND hr.district_code = get_user_district(auth.uid())
  ))
);