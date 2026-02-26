-- DVH-IMS V1.5: Update Bouwsubsidie document requirements
-- Context: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Non-breaking: no deletions, no enum removals, additive only

-- 1. Deprecate removed docs (set is_mandatory = false, keep rows)
UPDATE public.subsidy_document_requirement
SET is_mandatory = false
WHERE document_code IN ('CONSTRUCTION_PLAN', 'COST_ESTIMATE', 'BUILDING_PERMIT');

-- 2. Promote BANK_STATEMENT and HOUSEHOLD_COMP to mandatory
UPDATE public.subsidy_document_requirement
SET is_mandatory = true
WHERE document_code IN ('BANK_STATEMENT', 'HOUSEHOLD_COMP');

-- 3. Update INCOME_PROOF label to reflect AOV/loonstrook
UPDATE public.subsidy_document_requirement
SET document_name = 'Inkomensverklaring (AOV/loonstrook)',
    description = 'Income proof - AOV statement or pay slip (loonstrook)'
WHERE document_code = 'INCOME_PROOF';

-- 4. Add two new optional document types
INSERT INTO public.subsidy_document_requirement (document_code, document_name, description, is_mandatory)
VALUES
  ('CBB_EXTRACT', 'CBB uittreksel / Nationaliteit verklaring', 'CBB extract or nationality declaration (optional)', false),
  ('FAMILY_EXTRACT', 'Gezinuittreksel', 'Family extract document (optional)', false)
ON CONFLICT (document_code) DO NOTHING;