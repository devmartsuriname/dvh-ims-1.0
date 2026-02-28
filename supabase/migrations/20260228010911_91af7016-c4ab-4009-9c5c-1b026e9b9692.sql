-- Phase 7: Soft-deprecate 3 bouwsubsidie document requirements
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'BUILDING_PERMIT';
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'CONSTRUCTION_PLAN';
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'COST_ESTIMATE';