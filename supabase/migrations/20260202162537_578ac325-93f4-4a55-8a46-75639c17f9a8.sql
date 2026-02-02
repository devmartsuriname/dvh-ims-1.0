-- Phase 4E Migration 1: Add ministerial_advisor to app_role enum
-- This must be a separate migration to allow the value to be used in subsequent migrations

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ministerial_advisor';