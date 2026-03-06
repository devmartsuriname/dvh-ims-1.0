-- DVH-IMS v1.8 Phase 1B Step 1: Add category + validation_group columns
-- Audit Reference: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
ALTER TABLE public.subsidy_document_requirement
  ADD COLUMN category text,
  ADD COLUMN validation_group text;