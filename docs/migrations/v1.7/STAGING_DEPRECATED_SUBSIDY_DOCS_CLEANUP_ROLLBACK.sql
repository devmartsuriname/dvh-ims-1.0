-- DVH-IMS v1.7.x — Phase 7: ROLLBACK — Deprecated Bouwsubsidie Docs Cleanup
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Environment: STAGING ONLY
-- Date: 2026-02-28
-- Purpose: Restore 3 deprecated rows to active + drop is_active column

-- Step 1: Re-enable the 3 deprecated rows

-- 1a. BUILDING_PERMIT
UPDATE subsidy_document_requirement
SET is_active = true
WHERE document_code = 'BUILDING_PERMIT';

-- 1b. CONSTRUCTION_PLAN
UPDATE subsidy_document_requirement
SET is_active = true
WHERE document_code = 'CONSTRUCTION_PLAN';

-- 1c. COST_ESTIMATE
UPDATE subsidy_document_requirement
SET is_active = true
WHERE document_code = 'COST_ESTIMATE';

-- Step 2: Drop the is_active column (restore original schema)
ALTER TABLE subsidy_document_requirement DROP COLUMN is_active;
