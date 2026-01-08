/**
 * Edge Function: submit-housing-registration
 * Phase 9 - Public Wizard Database Integration
 * 
 * Handles anonymous Housing Registration (Woningregistratie) submissions
 * from the public wizard.
 * 
 * Security:
 * - Anonymous (no JWT required)
 * - Rate limited: 5 submissions/hour per IP
 * - Input validation
 * - Token hashing before storage
 * - IP anonymization in audit logs
 */

import { createClient } from 'npm:@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: in-memory store (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Valid district codes
const VALID_DISTRICTS = ['PAR', 'WAA', 'NIC', 'COR', 'SAR', 'COM', 'MAR', 'SIP', 'BRO', 'PRA']

// Input validation
interface HousingInput {
  national_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  phone_number: string
  email: string
  district: string
  address_line_1: string
  address_line_2?: string
  current_living_situation?: string
  housing_type_preference?: string
  reason_for_application?: string
  monthly_income?: number
  income_source?: string
  urgency_category?: string
  urgency_description?: string
}

interface ValidationError {
  field: string
  message: string
}

function validateInput(data: unknown): { valid: true; data: HousingInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body is required' }] }
  }
  
  const input = data as Record<string, unknown>
  
  // Required string fields
  const requiredStrings = [
    { field: 'national_id', maxLength: 20 },
    { field: 'first_name', maxLength: 100 },
    { field: 'last_name', maxLength: 100 },
    { field: 'date_of_birth', maxLength: 10 },
    { field: 'gender', maxLength: 20 },
    { field: 'phone_number', maxLength: 20 },
    { field: 'email', maxLength: 255 },
    { field: 'district', maxLength: 10 },
    { field: 'address_line_1', maxLength: 255 },
  ]
  
  for (const { field, maxLength } of requiredStrings) {
    const value = input[field]
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      errors.push({ field, message: `${field} is required` })
    } else if (value.length > maxLength) {
      errors.push({ field, message: `${field} must be less than ${maxLength} characters` })
    }
  }
  
  // Validate district code
  if (input.district && !VALID_DISTRICTS.includes(input.district as string)) {
    errors.push({ field: 'district', message: 'Invalid district code' })
  }
  
  // Validate email format
  if (input.email && typeof input.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' })
    }
  }
  
  // Validate date format (YYYY-MM-DD)
  if (input.date_of_birth && typeof input.date_of_birth === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(input.date_of_birth)) {
      errors.push({ field: 'date_of_birth', message: 'Date must be in YYYY-MM-DD format' })
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    data: {
      national_id: (input.national_id as string).trim(),
      first_name: (input.first_name as string).trim(),
      last_name: (input.last_name as string).trim(),
      date_of_birth: (input.date_of_birth as string).trim(),
      gender: (input.gender as string).trim(),
      phone_number: (input.phone_number as string).trim(),
      email: (input.email as string).trim().toLowerCase(),
      district: (input.district as string).trim(),
      address_line_1: (input.address_line_1 as string).trim(),
      address_line_2: input.address_line_2 ? (input.address_line_2 as string).trim() : undefined,
      current_living_situation: input.current_living_situation as string | undefined,
      housing_type_preference: input.housing_type_preference as string | undefined,
      reason_for_application: input.reason_for_application as string | undefined,
      monthly_income: input.monthly_income as number | undefined,
      income_source: input.income_source as string | undefined,
      urgency_category: input.urgency_category as string | undefined,
      urgency_description: input.urgency_description as string | undefined,
    }
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

function generateAccessToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excludes confusing chars
  let token = ''
  const array = new Uint8Array(12)
  crypto.getRandomValues(array)
  for (let i = 0; i < 12; i++) {
    token += chars[array[i] % chars.length]
  }
  return token
}

async function generateReferenceNumber(supabase: any): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = 'WR'
  
  // Query for the highest reference number this year
  const { data } = await supabase
    .from('housing_registration')
    .select('reference_number')
    .like('reference_number', `${prefix}-${year}-%`)
    .order('reference_number', { ascending: false })
    .limit(1)
  
  let nextNum = 1
  if (data && data.length > 0 && data[0]?.reference_number) {
    const parts = (data[0].reference_number as string).split('-')
    if (parts.length === 3) {
      const lastNum = parseInt(parts[2], 10)
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1
      }
    }
  }
  
  return `${prefix}-${year}-${String(nextNum).padStart(6, '0')}`
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
      console.log(`[submit-housing] Rate limit exceeded for IP hash: ${await hashIP(clientIP)}`)
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
    
    const input = validation.data
    
    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Generate reference number and access token
    const referenceNumber = await generateReferenceNumber(supabase)
    const accessToken = generateAccessToken()
    const accessTokenHash = await hashToken(accessToken)
    
    console.log(`[submit-housing] Processing submission: ${referenceNumber}`)
    
    // Create person record
    const { data: personData, error: personError } = await supabase
      .from('person')
      .insert({
        national_id: input.national_id,
        first_name: input.first_name,
        last_name: input.last_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        nationality: 'SR',
        created_by: null
      })
      .select('id')
      .single()
    
    if (personError) {
      console.error('[submit-housing] Failed to create person:', personError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const personId = personData.id
    
    // Create household record (size 1 for housing registration)
    const { data: householdData, error: householdError } = await supabase
      .from('household')
      .insert({
        primary_person_id: personId,
        household_size: 1,
        district_code: input.district
      })
      .select('id')
      .single()
    
    if (householdError) {
      console.error('[submit-housing] Failed to create household:', householdError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const householdId = householdData.id
    
    // Create household_member for applicant
    const { error: memberError } = await supabase
      .from('household_member')
      .insert({
        household_id: householdId,
        person_id: personId,
        relationship: 'self'
      })
    
    if (memberError) {
      console.error('[submit-housing] Failed to create household member:', memberError.message)
    }
    
    // Create address record
    const { error: addressError } = await supabase
      .from('address')
      .insert({
        household_id: householdId,
        district_code: input.district,
        address_line_1: input.address_line_1,
        address_line_2: input.address_line_2 || null,
        is_current: true
      })
    
    if (addressError) {
      console.error('[submit-housing] Failed to create address:', addressError.message)
    }
    
    // Create contact points
    const { error: phoneError } = await supabase
      .from('contact_point')
      .insert({
        person_id: personId,
        contact_type: 'phone',
        contact_value: input.phone_number,
        is_primary: true
      })
    
    if (phoneError) {
      console.error('[submit-housing] Failed to create phone contact:', phoneError.message)
    }
    
    const { error: emailError } = await supabase
      .from('contact_point')
      .insert({
        person_id: personId,
        contact_type: 'email',
        contact_value: input.email,
        is_primary: false
      })
    
    if (emailError) {
      console.error('[submit-housing] Failed to create email contact:', emailError.message)
    }
    
    // Create housing_registration record
    const { data: registrationData, error: registrationError } = await supabase
      .from('housing_registration')
      .insert({
        reference_number: referenceNumber,
        applicant_person_id: personId,
        household_id: householdId,
        district_code: input.district,
        housing_type_preference: input.housing_type_preference || null,
        current_status: 'received',
        assigned_officer_id: null
      })
      .select('id')
      .single()
    
    if (registrationError) {
      console.error('[submit-housing] Failed to create housing registration:', registrationError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const registrationId = registrationData.id
    
    // Create initial status history entry
    const { error: statusHistoryError } = await supabase
      .from('housing_registration_status_history')
      .insert({
        registration_id: registrationId,
        from_status: null,
        to_status: 'received',
        changed_by: null,
        reason: 'Public registration received'
      })
    
    if (statusHistoryError) {
      console.error('[submit-housing] Failed to create status history:', statusHistoryError.message)
    }
    
    // Create public_status_access record for tracking
    const { error: accessError } = await supabase
      .from('public_status_access')
      .insert({
        reference_number: referenceNumber,
        access_token_hash: accessTokenHash,
        entity_type: 'housing_registration',
        entity_id: registrationId
      })
    
    if (accessError) {
      console.error('[submit-housing] Failed to create public status access:', accessError.message)
    }
    
    // Log audit event
    const ipHash = await hashIP(clientIP)
    const { error: auditError } = await supabase
      .from('audit_event')
      .insert({
        actor_user_id: null,
        actor_role: 'public',
        entity_type: 'housing_registration',
        entity_id: registrationId,
        action: 'public_submission',
        metadata_json: {
          reference_number: referenceNumber,
          district_code: input.district,
          submission_ip_hash: ipHash,
          submission_timestamp: new Date().toISOString()
        }
      })
    
    if (auditError) {
      console.error('[submit-housing] Failed to create audit event:', auditError.message)
    }
    
    console.log(`[submit-housing] Registration successful: ${referenceNumber}`)
    
    // Return success with reference number and access token
    return new Response(
      JSON.stringify({
        success: true,
        reference_number: referenceNumber,
        access_token: accessToken,
        submitted_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('[submit-housing] Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
