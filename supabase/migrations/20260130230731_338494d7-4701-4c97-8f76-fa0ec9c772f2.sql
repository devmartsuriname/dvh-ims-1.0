-- =====================================================================
-- DVH-IMS V1.3 Phase 4A: Step 1 - Extend app_role enum
-- =====================================================================
-- This migration adds 'social_field_worker' to the app_role enum
-- Must be committed before the new value can be used in policies
-- =====================================================================

ALTER TYPE public.app_role ADD VALUE 'social_field_worker';