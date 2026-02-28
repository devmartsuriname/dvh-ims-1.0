-- DVH-IMS v1.7.x — Phase 6: DB Label Alignment (Housing Only)
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Environment: STAGING ONLY
-- Date: 2026-02-27
-- Purpose: Align housing_document_requirement labels with shared config
-- Table: housing_document_requirement
-- Scope: 3 individual UPDATE statements (document_name only)
-- No is_mandatory changes. No schema changes. No deletions.

-- 1. INCOME_PROOF: "Proof of Income" → "Income Proof"
UPDATE housing_document_requirement
SET document_name = 'Income Proof'
WHERE document_code = 'INCOME_PROOF';

-- 2. RESIDENCE_PROOF: "Proof of Current Residence" → "Residence Proof"
UPDATE housing_document_requirement
SET document_name = 'Residence Proof'
WHERE document_code = 'RESIDENCE_PROOF';

-- 3. EMERGENCY_PROOF: "Emergency Documentation" → "Emergency Proof"
UPDATE housing_document_requirement
SET document_name = 'Emergency Proof'
WHERE document_code = 'EMERGENCY_PROOF';
