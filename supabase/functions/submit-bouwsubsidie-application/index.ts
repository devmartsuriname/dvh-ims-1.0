/**
 * Edge Function: submit-bouwsubsidie-application
 * Phase 9 - Public Wizard Database Integration
 * Phase 8C - Structured Logging
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
import { createLogger } from '../_shared/logger.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createRateLimiter } from '../_shared/rate-limit.ts'
import { VALID_DISTRICTS } from '../_shared/constants.ts'

// Rate limiting: 5 submissions/hour per IP (per-function isolated instance)
const rateLimiter = createRateLimiter(5, 60 * 60 * 1000)

// Document upload structure from wizard (V1.3 Phase 5A)
interface DocumentUploadInput {
  document_code: string
  file_path: string
  file_name: string
  uploaded_at: string
}

interface ChildInputServer {
  age: number
  gender: string
  has_disability: boolean
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
  estimated_amount?: string
  documents?: DocumentUploadInput[]
  children?: ChildInputServer[]
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
      estimated_amount: input.estimated_amount ? String(input.estimated_amount).trim() : undefined,
      documents: Array.isArray(input.documents) ? input.documents : undefined,
      children: Array.isArray(input.children) ? input.children : undefined,
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
  
  const log = createLogger('submit-bouwsubsidie-application')
  
  try {
    log.info('request_started', { http_method: 'POST' })
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      log.warn('rate_limit_exceeded')
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
      log.warn('validation_failed', { field_count: validation.errors.length })
      return new Response(
        JSON.stringify({ success: false, error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const input = validation.data
    
    // === V1.8 Phase 3: Server-side document validation ===
    const MANDATORY_DOCUMENT_CODES = ['ID_COPY', 'BANK_STATEMENT']
    const INCOME_PROOF_CODES = ['PAYSLIP', 'AOV_STATEMENT', 'PENSION_STATEMENT', 'EMPLOYER_DECLARATION']
    
    const uploadedDocCodes = (input.documents || [])
      .filter((doc: any) => doc.uploaded_file?.file_path)
      .map((doc: any) => doc.document_code)
    
    const missingMandatory = MANDATORY_DOCUMENT_CODES.filter(code => !uploadedDocCodes.includes(code))
    const hasIncomeProof = INCOME_PROOF_CODES.some(code => uploadedDocCodes.includes(code))
    
    if (missingMandatory.length > 0 || !hasIncomeProof) {
      const errorCode = missingMandatory.length > 0 ? 'MANDATORY_DOCUMENTS_MISSING' : 'INCOME_PROOF_REQUIRED'
      
      // Audit log for blocked submission
      const ipHash = await hashIP(clientIP)
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const auditClient = createClient(supabaseUrl, supabaseServiceKey)
      
      await auditClient.from('audit_event').insert({
        actor_user_id: null,
        actor_role: 'public',
        entity_type: 'subsidy_case',
        entity_id: null,
        action: 'SUBMISSION_VALIDATION_BLOCKED',
        metadata_json: {
          validation_type: missingMandatory.length > 0 ? 'mandatory_documents' : 'income_proof',
          error_code: errorCode,
          district_code: input.district,
          submission_ip_hash: ipHash,
          timestamp: new Date().toISOString()
        }
      })
      
      log.warn('submission_blocked', { error_code: errorCode, district_code: input.district })
      
      return new Response(
        JSON.stringify({ success: false, error: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    // === End V1.8 Phase 3 document validation ===
    
    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Generate reference number and access token
    const referenceNumber = await generateReferenceNumber(supabase)
    const accessToken = generateAccessToken()
    const accessTokenHash = await hashToken(accessToken)
    
    log.info('submission_started', { reference_number: referenceNumber, district_code: input.district })
    
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
      log.error('db_insert_failed', { step: 'person_insert', district_code: input.district }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'household_insert', district_code: input.district }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'household_member_insert' }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'address_insert' }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'phone_contact_insert' }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'email_contact_insert' }, 'DB_CONSTRAINT')
    }
    
    // Validate estimated amount
    const parsedAmount = input.estimated_amount ? parseFloat(input.estimated_amount) : null

    if (parsedAmount !== null && isNaN(parsedAmount)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid subsidy amount value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (parsedAmount !== null && parsedAmount > 150000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Requested subsidy amount cannot exceed SRD 150,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
        requested_amount: parsedAmount,
        created_by: null
      })
      .select('id')
      .single()
    
    if (caseError) {
      log.error('db_insert_failed', { step: 'subsidy_case_insert', district_code: input.district }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'status_history_insert' }, 'DB_CONSTRAINT')
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
      log.error('db_insert_failed', { step: 'public_status_access_insert' }, 'DB_CONSTRAINT')
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
        // Skip documents without an uploaded file (optional docs not uploaded)
        const uploadedFile = (doc as any).uploaded_file
        if (!uploadedFile?.file_path) continue

        const requirementId = requirementMap.get((doc as any).document_code)
        if (requirementId) {
          const { error: docError } = await supabase
            .from('subsidy_document_upload')
            .insert({
              case_id: caseId,
              requirement_id: requirementId,
              file_path: uploadedFile.file_path,
              file_name: uploadedFile.file_name,
              uploaded_by: null,
              is_verified: false
            })
          
          if (docError) {
            log.error('db_insert_failed', { step: 'document_link', document_code: (doc as any).document_code }, 'DB_CONSTRAINT')
          } else {
            documentsLinked++
          }
        }
      }
    }
    
    // V1.8 Phase 5: Persist children to subsidy_household_child
    let childrenCount = 0
    if (input.children && input.children.length > 0) {
      for (let i = 0; i < input.children.length; i++) {
        const child = input.children[i]
        const { error: childError } = await supabase
          .from('subsidy_household_child')
          .insert({
            subsidy_case_id: caseId,
            age: child.age,
            gender: child.gender,
            has_disability: child.has_disability,
            sort_order: i + 1
          })
        
        if (childError) {
          log.error('db_insert_failed', { step: 'child_insert', sort_order: i + 1 }, 'DB_CONSTRAINT')
        } else {
          childrenCount++
        }
      }
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
          documents_count: documentsLinked,
          children_count: childrenCount
        }
      })
    
    if (auditError) {
      log.error('db_insert_failed', { step: 'audit_event_insert' }, 'DB_CONSTRAINT')
    }
    
    log.info('submission_completed', { reference_number: referenceNumber, district_code: input.district, documents_count: documentsLinked, children_count: childrenCount })
    
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
    log.error('unexpected_error', { message: error instanceof Error ? error.message : 'Unknown error' }, 'UNHANDLED')
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
