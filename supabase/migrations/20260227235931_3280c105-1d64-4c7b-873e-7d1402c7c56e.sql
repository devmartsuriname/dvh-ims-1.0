-- Phase 6: Housing label alignment (data-only, no schema change)
-- These are UPDATE statements on existing data rows

UPDATE housing_document_requirement
SET document_name = 'Income Proof'
WHERE document_code = 'INCOME_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Residence Proof'
WHERE document_code = 'RESIDENCE_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Emergency Proof'
WHERE document_code = 'EMERGENCY_PROOF';
