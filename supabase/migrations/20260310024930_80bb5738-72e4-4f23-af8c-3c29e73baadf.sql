-- Phase 9E: Replace BANK_STATEMENT with NATIONALITY_DECLARATION in subsidy_document_requirement
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

-- Step 1: Deactivate BANK_STATEMENT
UPDATE public.subsidy_document_requirement
SET is_active = false
WHERE document_code = 'BANK_STATEMENT';

-- Step 2: Insert NATIONALITY_DECLARATION as mandatory identity document
INSERT INTO public.subsidy_document_requirement (document_code, document_name, is_mandatory, is_active, category, validation_group, description)
VALUES ('NATIONALITY_DECLARATION', 'Nationaliteitverklaring', true, true, 'identity', null, 'Nationality declaration - mandatory document for bouwsubsidie application')
ON CONFLICT (document_code) DO UPDATE SET
  is_mandatory = true,
  is_active = true,
  category = 'identity',
  document_name = 'Nationaliteitverklaring';