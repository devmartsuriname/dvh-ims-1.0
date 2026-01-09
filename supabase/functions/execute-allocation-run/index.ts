import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AllocationRunRequest {
  run_id: string
  district_code: string
}

interface AllocationCandidate {
  registration_id: string
  urgency_score: number
  waiting_list_position: number
  composite_rank: number
}

// UUID validation helper for input sanitization
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// District code validation (alphanumeric, max 20 chars)
function isValidDistrictCode(str: string): boolean {
  return /^[A-Za-z0-9_-]{1,20}$/.test(str)
}

// Allowed roles for this function
const ALLOWED_ROLES = ['system_admin', 'project_leader']

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error', code: 'CONFIG_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header to validate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header', code: 'AUTH_MISSING' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate user JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Auth validation failed')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization token', code: 'AUTH_INVALID' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // RBAC: Check user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('Failed to fetch user roles')
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify authorization', code: 'AUTH_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const roles = userRoles?.map(r => r.role) || []
    const hasAccess = roles.some(role => ALLOWED_ROLES.includes(role))

    if (!hasAccess) {
      console.error('RBAC check failed - insufficient permissions')
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions', code: 'AUTH_FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: AllocationRunRequest = await req.json()
    const { run_id, district_code } = body

    // Validate required fields presence
    if (!run_id || !district_code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: run_id, district_code', code: 'VALIDATION_MISSING' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format for run_id
    if (!isValidUUID(run_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid run_id format', code: 'VALIDATION_UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate district_code format
    if (!isValidDistrictCode(district_code)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid district_code format', code: 'VALIDATION_DISTRICT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitized operational log - no PII
    console.log(`Allocation run started: run=${run_id.substring(0, 8)}...`)

    // 1. Update run status to 'running'
    const { error: updateStartError } = await supabase
      .from('allocation_run')
      .update({ run_status: 'running' })
      .eq('id', run_id)

    if (updateStartError) {
      console.error('Failed to update run status to running:', updateStartError)
      throw new Error('Failed to start allocation run')
    }

    // 2. Check quota availability for district
    const { data: quotaData, error: quotaError } = await supabase
      .from('district_quota')
      .select('*')
      .eq('district_code', district_code)
      .lte('period_start', new Date().toISOString().split('T')[0])
      .gte('period_end', new Date().toISOString().split('T')[0])
      .single()

    if (quotaError && quotaError.code !== 'PGRST116') {
      console.error('Quota check failed:', quotaError)
      throw new Error('Failed to check district quota')
    }

    const availableQuota = quotaData 
      ? quotaData.total_quota - quotaData.allocated_count 
      : 0

    console.log(`Quota check complete: available=${availableQuota}`)

    // 3. Fetch eligible candidates from waiting list
    const { data: registrations, error: registrationError } = await supabase
      .from('housing_registration')
      .select('id, urgency_score, waiting_list_position')
      .eq('district_code', district_code)
      .eq('current_status', 'waiting_list')
      .order('waiting_list_position', { ascending: true })

    if (registrationError) {
      console.error('Failed to fetch registrations:', registrationError)
      throw new Error('Failed to fetch eligible registrations')
    }

    console.log(`Eligible registrations found: count=${registrations?.length || 0}`)

    // 4. Calculate composite rank for each candidate
    const candidates: AllocationCandidate[] = (registrations || []).map((reg, index) => {
      const urgencyScore = reg.urgency_score || 0
      const waitingPosition = reg.waiting_list_position || index + 1
      const compositeRank = index + 1
      
      return {
        registration_id: reg.id,
        urgency_score: urgencyScore,
        waiting_list_position: waitingPosition,
        composite_rank: compositeRank
      }
    })

    // Sort by urgency score (desc) then by waiting position (asc)
    candidates.sort((a, b) => {
      if (b.urgency_score !== a.urgency_score) {
        return b.urgency_score - a.urgency_score
      }
      return a.waiting_list_position - b.waiting_list_position
    })

    // Reassign composite ranks after sorting
    candidates.forEach((candidate, index) => {
      candidate.composite_rank = index + 1
    })

    // 5. Mark top candidates as selected based on available quota
    const selectedCount = Math.min(availableQuota, candidates.length)

    // 6. Insert allocation candidates
    if (candidates.length > 0) {
      const candidateRecords = candidates.map((c, index) => ({
        run_id,
        registration_id: c.registration_id,
        urgency_score: c.urgency_score,
        waiting_list_position: c.waiting_list_position,
        composite_rank: c.composite_rank,
        is_selected: index < selectedCount
      }))

      const { error: insertError } = await supabase
        .from('allocation_candidate')
        .insert(candidateRecords)

      if (insertError) {
        console.error('Failed to insert candidates:', insertError)
        throw new Error('Failed to record allocation candidates')
      }
    }

    // 7. Update run with results and complete status
    const { error: updateCompleteError } = await supabase
      .from('allocation_run')
      .update({
        run_status: 'completed',
        candidates_count: candidates.length,
        allocations_count: selectedCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', run_id)

    if (updateCompleteError) {
      console.error('Failed to complete run:', updateCompleteError)
      throw new Error('Failed to complete allocation run')
    }

    // 8. Log audit event
    await supabase.from('audit_event').insert({
      actor_user_id: user.id,
      actor_role: roles[0] || 'unknown',
      entity_type: 'allocation_run',
      entity_id: run_id,
      action: 'CREATE',
      metadata_json: {
        district_code,
        candidates_count: candidates.length,
        allocations_count: selectedCount
      }
    })

    console.log(`Allocation run completed: candidates=${candidates.length}, selected=${selectedCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        candidates_count: candidates.length,
        allocations_count: selectedCount,
        message: 'Allocation run completed successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Processing error'
    console.error('Allocation run failed')

    // Try to update run status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const body = await req.clone().json()
      if (body.run_id) {
        await supabase
          .from('allocation_run')
          .update({
            run_status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', body.run_id)
      }
    } catch (updateError) {
      console.error('Failed to update run status to failed:', updateError)
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
