/**
 * Health Check Edge Function — Phase 8D
 * 
 * Stateless endpoint for external uptime monitors (BetterStack/UptimeRobot).
 * Returns { status: "ok", timestamp } only. No database queries, no auth required.
 * Must NOT expose system configuration, versions, or internal details.
 */

import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
})
