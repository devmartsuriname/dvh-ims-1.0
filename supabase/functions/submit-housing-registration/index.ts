/**
 * Edge Function: submit-housing-registration
 * Phase 5C - Document Upload Implementation
 * v1.7.x - Bugfix: Person upsert + reference number retry + correlation logging
 * 
 * Handles anonymous Housing Registration (Woningregistratie) submissions
 * from the public wizard including document uploads.
 * 
 * Security:
 * - Anonymous (no JWT required)
 * - Rate limited: 5 submissions/hour per IP
 * - Input validation
 * - Token hashing before storage
 * - IP anonymization in audit logs
 * 
 * Transaction Safety:
 * - Person: lookup-first-then-insert (handles duplicate national_id)
 * - Reference number: retry loop (max 3 attempts on duplicate)
 * - Compensating cleanup: if registration insert fails after person/household
 *   creation, the orphaned records are benign (no status, no public access token).
 *   Next retry will reuse the existing person via lookup-first pattern.
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

// Document upload structure from frontend
interface DocumentUploadInput {
  id: string
  document_code: string
  label: string
  is_mandatory: boolean
  uploaded_file?: {
    file_path: string
    file_name: string
    file_size: number
    uploaded_at: string
  }
}

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
  documents?: DocumentUploadInput[]
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
  
  // Validate documents array if present
  if (input.documents && Array.isArray(input.documents)) {
    const docs = input.documents as DocumentUploadInput[]
    const mandatoryDocs = docs.filter(d => d.is_mandatory)
    const missingMandatory = mandatoryDocs.filter(d => !d.uploaded_file)
    
    if (missingMandatory.length > 0) {
      errors.push({ 
        field: 'documents', 
        message: `Missing mandatory documents: ${missingMandatory.map(d => d.document_code).join(', ')}` 
      })
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
  
  // Query ALL reference numbers this year and find the numeric maximum
  // This avoids string-sorting issues with mixed padding (e.g., '2966' vs '002967')
  const { data } = await supabase
    .from('housing_registration')
    .select('reference_number')
    .like('reference_number', `${prefix}-${year}-%`)
  
  let maxNum = 0
  if (data && Array.isArray(data)) {
    for (const row of data) {
      const parts = (row.reference_number as string).split('-')
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10)
        if (!isNaN(num) && num > maxNum) {
          maxNum = num
        }
      }
    }
  }
  
  return `${prefix}-${year}-${String(maxNum + 1).padStart(6, '0')}`
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
  
  // Generate correlation ID for this request
  const correlationId = crypto.randomUUID()
  
  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`[submit-housing] correlation=${correlationId} Rate limit exceeded for IP hash: ${await hashIP(clientIP)}`)
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
      console.log(`[submit-housing] correlation=${correlationId} Validation failed: ${JSON.stringify(validation.errors)}`)
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
    
    const accessToken = generateAccessToken()
    const accessTokenHash = await hashToken(accessToken)
    
    console.log(`[submit-housing] correlation=${correlationId} Processing submission`)
    
    // ── Step 1: Person — lookup-first-then-insert ──
    // Prevents duplicate person_national_id_key constraint violation
    let personId: string

    const { data: existingPerson, error: personLookupError } = await supabase
      .from('person')
      .select('id')
      .eq('national_id', input.national_id)
      .maybeSingle()

    if (personLookupError) {
      console.error(`[submit-housing] correlation=${correlationId} Person lookup failed:`, personLookupError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingPerson) {
      personId = existingPerson.id
      console.log(`[submit-housing] correlation=${correlationId} Found existing person for national_id`)
    } else {
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
        console.error(`[submit-housing] correlation=${correlationId} Failed to create person:`, personError.message)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      personId = personData.id
      console.log(`[submit-housing] correlation=${correlationId} Created new person`)
    }
    
    // ── Step 2: Household ──
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
      console.error(`[submit-housing] correlation=${correlationId} Failed to create household:`, householdError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const householdId = householdData.id
    
    // ── Step 3: Household member ──
    const { error: memberError } = await supabase
      .from('household_member')
      .insert({
        household_id: householdId,
        person_id: personId,
        relationship: 'self'
      })
    
    if (memberError) {
      console.error(`[submit-housing] correlation=${correlationId} Failed to create household member:`, memberError.message)
    }
    
    // ── Step 4: Address ──
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
      console.error(`[submit-housing] correlation=${correlationId} Failed to create address:`, addressError.message)
    }
    
    // ── Step 5: Contact points ──
    const { error: phoneError } = await supabase
      .from('contact_point')
      .insert({
        person_id: personId,
        contact_type: 'phone',
        contact_value: input.phone_number,
        is_primary: true
      })
    
    if (phoneError) {
      console.error(`[submit-housing] correlation=${correlationId} Failed to create phone contact:`, phoneError.message)
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
      console.error(`[submit-housing] correlation=${correlationId} Failed to create email contact:`, emailError.message)
    }
    
    // ── Step 6: Housing registration — retry loop for reference number conflicts ──
    const MAX_REF_ATTEMPTS = 3
    let registrationId: string | null = null
    let referenceNumber: string = ''
    let refAttempt = 0

    while (refAttempt < MAX_REF_ATTEMPTS) {
      referenceNumber = await generateReferenceNumber(supabase)
      
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
      
      if (!registrationError) {
        registrationId = registrationData.id
        break
      }
      
      // Check if it's a duplicate reference_number error — retry
      if (registrationError.message && registrationError.message.includes('duplicate key') && registrationError.message.includes('reference_number')) {
        refAttempt++
        console.warn(`[submit-housing] correlation=${correlationId} Duplicate reference_number ${referenceNumber}, retry ${refAttempt}/${MAX_REF_ATTEMPTS}`)
        continue
      }
      
      // Non-duplicate error — fail immediately
      console.error(`[submit-housing] correlation=${correlationId} Failed to create housing registration:`, registrationError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!registrationId) {
      console.error(`[submit-housing] correlation=${correlationId} Failed to create housing registration after ${MAX_REF_ATTEMPTS} attempts (duplicate reference_number)`)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process registration. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // ── Step 7: Document uploads (Phase 5C) ──
    let documentCount = 0
    if (input.documents && input.documents.length > 0) {
      // Get document requirements to map codes to IDs
      const { data: requirements } = await supabase
        .from('housing_document_requirement')
        .select('id, document_code')
      
      const reqMap = new Map<string, string>()
      if (requirements) {
        for (const req of requirements) {
          reqMap.set(req.document_code, req.id)
        }
      }
      
      // Insert document upload records for uploaded files
      for (const doc of input.documents) {
        if (doc.uploaded_file) {
          const requirementId = reqMap.get(doc.document_code)
          if (requirementId) {
            const { error: docError } = await supabase
              .from('housing_document_upload')
              .insert({
                registration_id: registrationId,
                requirement_id: requirementId,
                file_path: doc.uploaded_file.file_path,
                file_name: doc.uploaded_file.file_name,
                uploaded_by: null,
                is_verified: false
              })
            
            if (docError) {
              console.error(`[submit-housing] correlation=${correlationId} Failed to create document upload for ${doc.document_code}:`, docError.message)
            } else {
              documentCount++
            }
          } else {
            console.warn(`[submit-housing] correlation=${correlationId} Unknown document code: ${doc.document_code}`)
          }
        }
      }
      
      console.log(`[submit-housing] correlation=${correlationId} Linked ${documentCount} documents to registration ${referenceNumber}`)
    }
    
    // ── Step 8: Status history ──
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
      console.error(`[submit-housing] correlation=${correlationId} Failed to create status history:`, statusHistoryError.message)
    }
    
    // ── Step 9: Public status access ──
    const { error: accessError } = await supabase
      .from('public_status_access')
      .insert({
        reference_number: referenceNumber,
        access_token_hash: accessTokenHash,
        entity_type: 'housing_registration',
        entity_id: registrationId
      })
    
    if (accessError) {
      console.error(`[submit-housing] correlation=${correlationId} Failed to create public status access:`, accessError.message)
    }
    
    // ── Step 10: Audit event ──
    const ipHash = await hashIP(clientIP)
    const { error: auditError } = await supabase
      .from('audit_event')
      .insert({
        actor_user_id: null,
        actor_role: 'public',
        entity_type: 'housing_registration',
        entity_id: registrationId,
        action: 'public_submission',
        correlation_id: correlationId,
        metadata_json: {
          reference_number: referenceNumber,
          district_code: input.district,
          submission_ip_hash: ipHash,
          submission_timestamp: new Date().toISOString(),
          document_count: documentCount,
          person_reused: !!existingPerson
        }
      })
    
    if (auditError) {
      console.error(`[submit-housing] correlation=${correlationId} Failed to create audit event:`, auditError.message)
    }
    
    console.log(`[submit-housing] correlation=${correlationId} Registration successful: ${referenceNumber} with ${documentCount} documents (person_reused=${!!existingPerson})`)
    
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
    console.error(`[submit-housing] correlation=${correlationId} Unexpected error:`, error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
