-- DVH-IMS v1.8 Phase 1B Step 2-4: Data operations for subsidy_document_requirement
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

-- Step 2: Soft-deprecate 5 rows
UPDATE public.subsidy_document_requirement SET is_active = false WHERE document_code IN ('HOUSEHOLD_COMP', 'FAMILY_EXTRACT', 'CBB_EXTRACT', 'INCOME_PROOF', 'LAND_TITLE');

-- Step 3a: Update existing rows with category
UPDATE public.subsidy_document_requirement SET category = 'identity' WHERE document_code = 'ID_COPY';
UPDATE public.subsidy_document_requirement SET category = 'financial' WHERE document_code = 'BANK_STATEMENT';

-- Step 3b: Insert 12 new rows
INSERT INTO public.subsidy_document_requirement (document_code, document_name, is_mandatory, is_active, category, validation_group) VALUES
  ('PAYSLIP', 'Loonstrook', false, true, 'income', 'income_proof'),
  ('AOV_STATEMENT', 'AOV-verklaring', false, true, 'income', 'income_proof'),
  ('PENSION_STATEMENT', 'Pensioenverklaring', false, true, 'income', 'income_proof'),
  ('EMPLOYER_DECLARATION', 'Werkgeversverklaring', false, true, 'income', 'income_proof'),
  ('PROPERTY_DEED', 'Grondbewijs / eigendomsbewijs', false, true, 'property', NULL),
  ('GLIS_EXTRACT', 'GLIS-uittreksel', false, true, 'property', NULL),
  ('PARCEL_MAP', 'Perceelkaart', false, true, 'property', NULL),
  ('NOTARIAL_DEED', 'Notariële akte', false, true, 'legal', NULL),
  ('PURCHASE_AGREEMENT', 'Koopovereenkomst', false, true, 'legal', NULL),
  ('ESTATE_PERMISSION', 'Boedelgrondverklaring', false, true, 'special', NULL),
  ('MORTGAGE_EXTRACT', 'Hypotheekuittreksel', false, true, 'special', NULL),
  ('VILLAGE_AUTHORITY', 'Verklaring dorpshoofd', false, true, 'special', NULL);