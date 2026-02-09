-- Backfill: BS-2026-000001 document records lost due to pre-fix edge function bug
-- One-time data INSERT only. No schema changes.
INSERT INTO public.subsidy_document_upload (case_id, requirement_id, file_path, file_name, uploaded_by, is_verified)
VALUES
  -- ID_COPY
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', '8c9fd5d8-6eda-4201-8fb8-e1fc5b7ea863',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/ID_COPY_1770654138089.png',
   'ID_COPY_1770654138089.png', NULL, false),
  -- INCOME_PROOF
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', '69be3848-4377-4de7-b136-087570be82c7',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/INCOME_PROOF_1770654192866.png',
   'INCOME_PROOF_1770654192866.png', NULL, false),
  -- LAND_TITLE
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', '40d50654-b2c4-4efb-91b9-ae19e01da474',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/LAND_TITLE_1770654309936.png',
   'LAND_TITLE_1770654309936.png', NULL, false),
  -- CONSTRUCTION_PLAN
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', '4eae22a8-2113-49e9-99bf-d270e45400cf',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/CONSTRUCTION_PLAN_1770654440784.png',
   'CONSTRUCTION_PLAN_1770654440784.png', NULL, false),
  -- COST_ESTIMATE (latest upload)
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', '9138a3ae-4c81-473d-ba0d-791a57e34516',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/COST_ESTIMATE_1770654474702.png',
   'COST_ESTIMATE_1770654474702.png', NULL, false),
  -- BUILDING_PERMIT (latest upload)
  ('d5106ad7-d39e-4946-b6cd-0cbbeae53052', 'df8ae0c0-0ae6-471c-905a-cf386b7e41f4',
   'bouwsubsidie/3335b08c-f062-4684-a8a5-e5a95a17b745/BUILDING_PERMIT_1770654510145.png',
   'BUILDING_PERMIT_1770654510145.png', NULL, false);