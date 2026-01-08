/**
 * Edge Function: lookup-public-status
 * Phase 9 - Public Wizard Database Integration
 * 
 * Handles public status lookup using reference number and access token.
 * Returns application status and timeline for citizens.
 * 
 * Security:
 * - Anonymous (no JWT required)
 * - Rate limited: 20 lookups/hour per IP
 * - Token validation via SHA-256 hash comparison
 * - IP anonymization in audit logs
 */

import { createClient } from 'npm:@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Status label mappings
const BOUWSUBSIDIE_STATUS_LABELS: Record<string, string> = {
  'received': 'Ontvangen',
  'in_review': 'In Behandeling',
  'documents_requested': 'Documenten Opgevraagd',
  'documents_received': 'Documenten Ontvangen',
  'technical_review': 'Technische Beoordeling',
  'social_review': 'Sociale Beoordeling',
  'committee_review': 'Commissie Beoordeling',
  'approved': 'Goedgekeurd',
  'rejected': 'Afgewezen',
  'completed': 'Afgerond'
}

const HOUSING_STATUS_LABELS: Record<string, string> = {
  'received': 'Ontvangen',
  'in_review': 'In Behandeling',
  'documents_requested': 'Documenten Opgevraagd',
  'documents_received': 'Documenten Ontvangen',
  'waitlisted': 'Op Wachtlijst',
  'allocated': 'Toegewezen',
  'assigned': 'Woning Toegekend',
  'rejected': 'Afgewezen',
  'withdrawn': 'Ingetrokken'
}

interface ValidationError {
  field: string
  message: string
}

function validateInput(data: unknown): { valid: true; reference_number: string; access_token: string } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] }
  }
  
  const input = data as Record<string, unknown>
  
  // Validate reference_number
  if (!input.reference_number || typeof input.reference_number !== 'string') {
    errors.push({ field: 'reference_number', message: 'Reference number is required' })
  } else {
    const refNum = input.reference_number.trim().toUpperCase()
    const refPattern = /^(BS|WR)-\d{4}-\d{6}$/
    if (!refPattern.test(refNum)) {
      errors.push({ field: 'reference_number', message: 'Invalid reference number format' })
    }
  }
  
  // Validate access_token
  if (!input.access_token || typeof input.access_token !== 'string') {
    errors.push({ field: 'access_token', message: 'Access token is required' })
  } else if (input.access_token.trim().length < 12) {
    errors.push({ field: 'access_token', message: 'Invalid access token' })
  }
  
  if (errors.length > 0) {
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    reference_number: (input.reference_number as string).trim().toUpperCase(),
    access_token: (input.access_token as string).trim().toUpperCase()
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS })
    return true
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false
  }
  
  entry.count++
  return true
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashIP(ip: string): Promise<string> {
  return hashToken(ip + '-salt-volkshuisvesting')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`[lookup-status] Rate limit exceeded for IP hash: ${await hashIP(clientIP)}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse and validate input
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const validation = validateInput(body)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { reference_number, access_token } = validation
    
    // Hash the provided token for comparison
    const tokenHash = await hashToken(access_token)
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log(`[lookup-status] Looking up: ${reference_number}`)
    
    // Find the public_status_access record
    const { data: accessRecord, error: accessError } = await supabase
      .from('public_status_access')
      .select('id, entity_type, entity_id')
      .eq('reference_number', reference_number)
      .eq('access_token_hash', tokenHash)
      .single()
    
    if (accessError || !accessRecord) {
      console.log(`[lookup-status] Invalid credentials for: ${reference_number}`)
      
      // Log failed lookup attempt
      const ipHash = await hashIP(clientIP)
      await supabase.from('audit_event').insert({
        actor_user_id: null,
        actor_role: 'public',
        entity_type: 'public_status_access',
        entity_id: null,
        action: 'status_lookup_failed',
        metadata_json: {
          reference_number: reference_number,
          lookup_ip_hash: ipHash,
          lookup_timestamp: new Date().toISOString()
        }
      })
      
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid reference number or access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Update last_accessed_at
    await supabase
      .from('public_status_access')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', accessRecord.id)
    
    let responseData: Record<string, unknown>
    
    // Fetch the appropriate entity based on type
    if (accessRecord.entity_type === 'subsidy_case') {
      // Fetch subsidy case with applicant info
      const { data: caseData, error: caseError } = await supabase
        .from('subsidy_case')
        .select(`
          id,
          case_number,
          status,
          district_code,
          created_at,
          person:applicant_person_id (
            first_name,
            last_name
          )
        `)
        .eq('id', accessRecord.entity_id)
        .single()
      
      if (caseError || !caseData) {
        console.error('[lookup-status] Failed to fetch subsidy case:', caseError?.message)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to retrieve application status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Fetch status history
      const { data: historyData } = await supabase
        .from('subsidy_case_status_history')
        .select('to_status, changed_at, reason')
        .eq('case_id', accessRecord.entity_id)
        .order('changed_at', { ascending: true })
      
      const statusHistory = (historyData || []).map(h => ({
        status: h.to_status,
        status_label: BOUWSUBSIDIE_STATUS_LABELS[h.to_status] || h.to_status,
        timestamp: h.changed_at,
        description: h.reason || getStatusDescription('bouwsubsidie', h.to_status)
      }))
      
      const personData = caseData.person as unknown as { first_name: string; last_name: string }[] | null
      const person = personData && personData.length > 0 ? personData[0] : null
      
      responseData = {
        success: true,
        application_type: 'bouwsubsidie',
        reference_number: caseData.case_number,
        applicant_name: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
        submitted_at: caseData.created_at,
        current_status: caseData.status,
        current_status_label: BOUWSUBSIDIE_STATUS_LABELS[caseData.status] || caseData.status,
        district_code: caseData.district_code,
        status_history: statusHistory
      }
      
    } else if (accessRecord.entity_type === 'housing_registration') {
      // Fetch housing registration with applicant info
      const { data: regData, error: regError } = await supabase
        .from('housing_registration')
        .select(`
          id,
          reference_number,
          current_status,
          district_code,
          waiting_list_position,
          created_at,
          person:applicant_person_id (
            first_name,
            last_name
          )
        `)
        .eq('id', accessRecord.entity_id)
        .single()
      
      if (regError || !regData) {
        console.error('[lookup-status] Failed to fetch housing registration:', regError?.message)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to retrieve registration status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Fetch status history
      const { data: historyData } = await supabase
        .from('housing_registration_status_history')
        .select('to_status, changed_at, reason')
        .eq('registration_id', accessRecord.entity_id)
        .order('changed_at', { ascending: true })
      
      const statusHistory = (historyData || []).map(h => ({
        status: h.to_status,
        status_label: HOUSING_STATUS_LABELS[h.to_status] || h.to_status,
        timestamp: h.changed_at,
        description: h.reason || getStatusDescription('housing', h.to_status)
      }))
      
      const personData = regData.person as unknown as { first_name: string; last_name: string }[] | null
      const person = personData && personData.length > 0 ? personData[0] : null
      
      responseData = {
        success: true,
        application_type: 'housing',
        reference_number: regData.reference_number,
        applicant_name: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
        submitted_at: regData.created_at,
        current_status: regData.current_status,
        current_status_label: HOUSING_STATUS_LABELS[regData.current_status] || regData.current_status,
        district_code: regData.district_code,
        waiting_list_position: regData.waiting_list_position,
        status_history: statusHistory
      }
      
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Unknown application type' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log successful lookup
    const ipHash = await hashIP(clientIP)
    await supabase.from('audit_event').insert({
      actor_user_id: null,
      actor_role: 'public',
      entity_type: 'public_status_access',
      entity_id: accessRecord.id,
      action: 'status_lookup',
      metadata_json: {
        reference_number: reference_number,
        lookup_successful: true,
        lookup_ip_hash: ipHash,
        lookup_timestamp: new Date().toISOString()
      }
    })
    
    console.log(`[lookup-status] Lookup successful: ${reference_number}`)
    
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('[lookup-status] Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getStatusDescription(type: 'bouwsubsidie' | 'housing', status: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    bouwsubsidie: {
      'received': 'Uw aanvraag is ontvangen en wordt verwerkt.',
      'in_review': 'Uw aanvraag wordt beoordeeld door onze medewerkers.',
      'documents_requested': 'Er zijn aanvullende documenten nodig.',
      'documents_received': 'Uw documenten zijn ontvangen.',
      'technical_review': 'Technische beoordeling is in uitvoering.',
      'social_review': 'Sociale beoordeling is in uitvoering.',
      'committee_review': 'Uw aanvraag wordt beoordeeld door de commissie.',
      'approved': 'Uw aanvraag is goedgekeurd.',
      'rejected': 'Uw aanvraag is helaas afgewezen.',
      'completed': 'Uw aanvraag is volledig afgerond.'
    },
    housing: {
      'received': 'Uw registratie is ontvangen en wordt verwerkt.',
      'in_review': 'Uw registratie wordt beoordeeld.',
      'documents_requested': 'Er zijn aanvullende documenten nodig.',
      'documents_received': 'Uw documenten zijn ontvangen.',
      'waitlisted': 'U staat op de wachtlijst.',
      'allocated': 'Er is een woning voor u beschikbaar.',
      'assigned': 'Een woning is aan u toegewezen.',
      'rejected': 'Uw registratie is helaas afgewezen.',
      'withdrawn': 'Uw registratie is ingetrokken.'
    }
  }
  
  return descriptions[type]?.[status] || 'Status update'
}
