-- DVH-IMS v1.7.x — Phase 6: ROLLBACK — DB Label Alignment (Housing Only)
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Environment: STAGING ONLY
-- Date: 2026-02-27
-- Purpose: Restore original housing_document_requirement labels

-- 1. INCOME_PROOF: "Income Proof" → "Proof of Income"
UPDATE housing_document_requirement
SET document_name = 'Proof of Income'
WHERE document_code = 'INCOME_PROOF';

-- 2. RESIDENCE_PROOF: "Residence Proof" → "Proof of Current Residence"
UPDATE housing_document_requirement
SET document_name = 'Proof of Current Residence'
WHERE document_code = 'RESIDENCE_PROOF';

-- 3. EMERGENCY_PROOF: "Emergency Proof" → "Emergency Documentation"
UPDATE housing_document_requirement
SET document_name = 'Emergency Documentation'
WHERE document_code = 'EMERGENCY_PROOF';
