/**
 * Edge Function: submit-bouwsubsidie-application
 * Phase 9 - Public Wizard Database Integration
 * 
 * Handles anonymous Bouwsubsidie (Construction Subsidy) submissions
 * from the public wizard.
 * 
 * Security:
 * - Anonymous (no JWT required)
 * - Rate limited: 5 submissions/hour per IP
 * - Input validation via Zod
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

// Input validation schema (manual validation - no external Zod in Edge Functions)
// Document upload structure from wizard (V1.3 Phase 5A)
interface DocumentUploadInput {
  document_code: string
  file_path: string
  file_name: string
  uploaded_at: string
}

interface BouwsubsidieInput {
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
  household_size: number
  household_members?: Array<{
    first_name: string
    last_name: string
    date_of_birth: string
    relationship: string
  }>
  reason?: string
  documents?: DocumentUploadInput[]
}

interface ValidationError {
  field: string
  message: string
}

function validateInput(data: unknown): { valid: true; data: BouwsubsidieInput } | { valid: false; errors: ValidationError[] } {
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
  
  // Validate household_size
  const householdSize = input.household_size
  if (householdSize === undefined || typeof householdSize !== 'number' || householdSize < 1 || householdSize > 20) {
    errors.push({ field: 'household_size', message: 'Household size must be between 1 and 20' })
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
      household_size: input.household_size as number,
      household_members: input.household_members as BouwsubsidieInput['household_members'],
      reason: input.reason as string | undefined,
      documents: input.documents as DocumentUploadInput[] | undefined,
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excludes confusing chars: 0, O, I, 1
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
  const prefix = 'BS'
  
  // Query for the highest reference number this year
  const { data } = await supabase
    .from('subsidy_case')
    .select('case_number')
    .like('case_number', `${prefix}-${year}-%`)
    .order('case_number', { ascending: false })
    .limit(1)
  
  let nextNum = 1
  if (data && data.length > 0 && data[0]?.case_number) {
    const parts = (data[0].case_number as string).split('-')
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
      console.log(`[submit-bouwsubsidie] Rate limit exceeded for IP hash: ${await hashIP(clientIP)}`)
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
    
    console.log(`[submit-bouwsubsidie] Processing submission: ${referenceNumber}`)
    
    // Create person record
    const { data: personData, error: personError } = await supabase
      .from('person')
      .insert({
        national_id: input.national_id,
        first_name: input.first_name,
        last_name: input.last_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        nationality: 'SR', // Default to Suriname
        created_by: null // Public submission
      })
      .select('id')
      .single()
    
    if (personError) {
      console.error('[submit-bouwsubsidie] Failed to create person:', personError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process application. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const personId = personData.id
    
    // Create household record
    const { data: householdData, error: householdError } = await supabase
      .from('household')
      .insert({
        primary_person_id: personId,
        household_size: input.household_size,
        district_code: input.district
      })
      .select('id')
      .single()
    
    if (householdError) {
      console.error('[submit-bouwsubsidie] Failed to create household:', householdError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process application. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const householdId = householdData.id
    
    // Create household_member for applicant (head of household)
    const { error: memberError } = await supabase
      .from('household_member')
      .insert({
        household_id: householdId,
        person_id: personId,
        relationship: 'head'
      })
    
    if (memberError) {
      console.error('[submit-bouwsubsidie] Failed to create household member:', memberError.message)
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
      console.error('[submit-bouwsubsidie] Failed to create address:', addressError.message)
    }
    
    // Create contact points (phone and email)
    const { error: phoneError } = await supabase
      .from('contact_point')
      .insert({
        person_id: personId,
        contact_type: 'phone',
        contact_value: input.phone_number,
        is_primary: true
      })
    
    if (phoneError) {
      console.error('[submit-bouwsubsidie] Failed to create phone contact:', phoneError.message)
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
      console.error('[submit-bouwsubsidie] Failed to create email contact:', emailError.message)
    }
    
    // Create subsidy_case record
    const { data: caseData, error: caseError } = await supabase
      .from('subsidy_case')
      .insert({
        case_number: referenceNumber,
        applicant_person_id: personId,
        household_id: householdId,
        district_code: input.district,
        status: 'received',
        created_by: null // Public submission
      })
      .select('id')
      .single()
    
    if (caseError) {
      console.error('[submit-bouwsubsidie] Failed to create subsidy case:', caseError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process application. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const caseId = caseData.id
    
    // Create initial status history entry
    const { error: statusHistoryError } = await supabase
      .from('subsidy_case_status_history')
      .insert({
        case_id: caseId,
        from_status: null,
        to_status: 'received',
        changed_by: null,
        reason: 'Public submission received'
      })
    
    if (statusHistoryError) {
      console.error('[submit-bouwsubsidie] Failed to create status history:', statusHistoryError.message)
    }
    
    // Create public_status_access record for tracking
    const { data: accessData, error: accessError } = await supabase
      .from('public_status_access')
      .insert({
        reference_number: referenceNumber,
        access_token_hash: accessTokenHash,
        entity_type: 'subsidy_case',
        entity_id: caseId
      })
      .select('id')
      .single()
    
    if (accessError) {
      console.error('[submit-bouwsubsidie] Failed to create public status access:', accessError.message)
    }
    
    // V1.3 Phase 5A: Link uploaded documents to the case
    let documentsLinked = 0
    if (input.documents && input.documents.length > 0) {
      // Get document requirement IDs
      const { data: requirements } = await supabase
        .from('subsidy_document_requirement')
        .select('id, document_code')
      
      const requirementMap = new Map(
        (requirements || []).map((r: any) => [r.document_code, r.id])
      )
      
      for (const doc of input.documents) {
        const requirementId = requirementMap.get(doc.document_code)
        if (requirementId) {
          const { error: docError } = await supabase
            .from('subsidy_document_upload')
            .insert({
              case_id: caseId,
              requirement_id: requirementId,
              file_path: doc.file_path,
              file_name: doc.file_name,
              uploaded_by: null, // Public submission
              is_verified: false
            })
          
          if (docError) {
            console.error(`[submit-bouwsubsidie] Failed to link document ${doc.document_code}:`, docError.message)
          } else {
            documentsLinked++
          }
        }
      }
      console.log(`[submit-bouwsubsidie] Linked ${documentsLinked} documents to case ${referenceNumber}`)
    }
    
    // Log audit event
    const ipHash = await hashIP(clientIP)
    const { error: auditError } = await supabase
      .from('audit_event')
      .insert({
        actor_user_id: null,
        actor_role: 'public',
        entity_type: 'subsidy_case',
        entity_id: caseId,
        action: 'public_submission',
        metadata_json: {
          reference_number: referenceNumber,
          district_code: input.district,
          submission_ip_hash: ipHash,
          submission_timestamp: new Date().toISOString(),
          documents_count: documentsLinked
        }
      })
    
    if (auditError) {
      console.error('[submit-bouwsubsidie] Failed to create audit event:', auditError.message)
    }
    
    console.log(`[submit-bouwsubsidie] Submission successful: ${referenceNumber}`)
    
    // Return success with reference number and access token
    return new Response(
      JSON.stringify({
        success: true,
        reference_number: referenceNumber,
        access_token: accessToken, // Plaintext - shown once to user
        submitted_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('[submit-bouwsubsidie] Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
