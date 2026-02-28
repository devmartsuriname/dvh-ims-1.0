-- DVH-IMS v1.7.x — Phase 7: Deprecated Bouwsubsidie Docs Cleanup (STAGING ONLY)
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Environment: STAGING ONLY
-- Date: 2026-02-28
-- Purpose: Soft-deprecate 3 deprecated bouwsubsidie document requirements
-- Table: subsidy_document_requirement
-- Method: Add is_active column + set to false for deprecated rows

-- Step 1: Schema change — Add is_active column
ALTER TABLE subsidy_document_requirement
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Data updates — Disable 3 deprecated rows (1 per statement)

-- 2a. BUILDING_PERMIT
UPDATE subsidy_document_requirement
SET is_active = false
WHERE document_code = 'BUILDING_PERMIT';
-- ABORT if affected rows != 1

-- 2b. CONSTRUCTION_PLAN
UPDATE subsidy_document_requirement
SET is_active = false
WHERE document_code = 'CONSTRUCTION_PLAN';
-- ABORT if affected rows != 1

-- 2c. COST_ESTIMATE
UPDATE subsidy_document_requirement
SET is_active = false
WHERE document_code = 'COST_ESTIMATE';
-- ABORT if affected rows != 1

-- Step 3: Verification queries

-- Confirm 3 deprecated rows have is_active = false
SELECT document_code, document_name, is_mandatory, is_active
FROM subsidy_document_requirement
WHERE is_active = false
ORDER BY document_code;
-- Expected: 3 rows (BUILDING_PERMIT, CONSTRUCTION_PLAN, COST_ESTIMATE)

-- Confirm 7 active rows have is_active = true
SELECT document_code, document_name, is_mandatory, is_active
FROM subsidy_document_requirement
WHERE is_active = true
ORDER BY document_code;
-- Expected: 7 rows

-- Confirm total row count = 10
SELECT COUNT(*) AS total_rows FROM subsidy_document_requirement;
-- Expected: 10
