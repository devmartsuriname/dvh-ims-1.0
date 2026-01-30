-- =====================================================
-- DVH-IMS V1.3 Phase 4B Migration 1: Enum Extension
-- =====================================================

-- Add technical_inspector to app_role enum
ALTER TYPE public.app_role ADD VALUE 'technical_inspector';