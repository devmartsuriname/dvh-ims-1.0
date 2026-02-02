-- Phase 4D: Director Activation for Bouwsubsidie - Part 1
-- Step 1: Add 'director' to app_role enum
-- This must be committed first before using the new enum value in policies

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'director';