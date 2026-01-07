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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header to validate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate user JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User validation failed:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate allowlist (only info@devmart.sr can execute)
    if (user.email !== 'info@devmart.sr') {
      console.error('User not in allowlist:', user.email)
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: User not in allowlist' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: AllocationRunRequest = await req.json()
    const { run_id, district_code } = body

    if (!run_id || !district_code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: run_id, district_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting allocation run: ${run_id} for district: ${district_code}`)

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

    console.log(`Available quota for ${district_code}: ${availableQuota}`)

    // 3. Fetch eligible candidates from waiting list
    // Eligible: status = 'waiting_list' and district matches
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

    console.log(`Found ${registrations?.length || 0} eligible registrations`)

    // 4. Calculate composite rank for each candidate
    // Composite rank = urgency_score (higher is better) + inverse waiting position
    const candidates: AllocationCandidate[] = (registrations || []).map((reg, index) => {
      const urgencyScore = reg.urgency_score || 0
      const waitingPosition = reg.waiting_list_position || index + 1
      // Higher urgency = higher priority, lower position = higher priority
      // Composite rank: lower is better (first in queue)
      const compositeRank = index + 1 // Simple sequential ranking after sorting
      
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
    candidates.slice(0, selectedCount).forEach(c => {
      // Mark as selected (for UI indication)
    })

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
      entity_type: 'allocation_run',
      entity_id: run_id,
      action: 'CREATE',
      metadata_json: {
        district_code,
        candidates_count: candidates.length,
        allocations_count: selectedCount
      }
    })

    console.log(`Allocation run ${run_id} completed successfully`)

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Allocation run failed:', errorMessage)

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
