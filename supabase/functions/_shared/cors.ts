/**
 * Shared CORS headers for all Edge Functions.
 * Phase 9D — Shared Module Extraction
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
