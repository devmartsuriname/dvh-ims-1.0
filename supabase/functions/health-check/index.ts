/**
 * Health Check Edge Function — Phase 8D
 * 
 * Stateless endpoint for external uptime monitors (BetterStack/UptimeRobot).
 * Returns { status: "ok", timestamp } only. No database queries, no auth required.
 * Must NOT expose system configuration, versions, or internal details.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
