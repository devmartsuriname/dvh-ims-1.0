-- Phase 7 — Migration A: Drop overly permissive anonymous SELECT on public_status_access
-- Context ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- Finding: HIGH — anon_can_select_public_status_access uses USING (true)
-- Reason: Edge Function uses SUPABASE_SERVICE_ROLE_KEY, bypasses RLS. Policy is redundant attack surface.

DROP POLICY IF EXISTS "anon_can_select_public_status_access" ON public_status_access;