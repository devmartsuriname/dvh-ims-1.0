import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { createRateLimiter } from '../_shared/rate-limit.ts'

const rateLimiter = createRateLimiter(60, 60 * 60 * 1000) // 60 requests per IP per hour

const VALID_QR_TYPES = ['woningregistratie', 'bouwsubsidie'] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Rate limit by IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!rateLimiter.check(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { qr_type } = body

    if (!qr_type || !VALID_QR_TYPES.includes(qr_type)) {
      return new Response(JSON.stringify({ error: 'Invalid qr_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Hash IP for privacy
    const encoder = new TextEncoder()
    const data = encoder.encode(clientIP)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const ipHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    const userAgent = req.headers.get('user-agent') || null

    // Insert via service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error } = await supabase.from('qr_scan_event').insert({
      qr_type,
      ip_hash: ipHash,
      user_agent: userAgent,
    })

    if (error) {
      console.error('Insert error:', error.message)
      return new Response(JSON.stringify({ error: 'Failed to record scan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Track QR scan error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
