import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logAuditEvent } from './useAuditLog'

export interface PendingVisitCase {
  id: string
  case_number: string
  applicant_name: string
  address: string
  district_code: string
  status: string
}

export interface FieldWorker {
  user_id: string
  full_name: string
  role: string
  district_code: string
}

export interface ScheduledVisit {
  id: string
  case_id: string
  case_number: string
  applicant_name: string
  visit_type: string
  assigned_to: string
  assigned_name: string
  scheduled_date: string
  visit_status: string
  visit_notes: string | null
}

export const useScheduleVisits = () => {
  const [pendingCases, setPendingCases] = useState<PendingVisitCase[]>([])
  const [fieldWorkers, setFieldWorkers] = useState<FieldWorker[]>([])
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const VISIT_STATUSES = ['in_social_review', 'in_technical_review', 'fieldwork']
  const FIELD_ROLES = ['social_field_worker', 'technical_inspector'] as const

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Query 1: Pending cases with person + address joins
    const { data: cases, error: casesError } = await supabase
      .from('subsidy_case')
      .select(`
        id, case_number, status, district_code,
        person:applicant_person_id ( first_name, last_name ),
        household:household_id (
          address ( address_line_1, is_current )
        )
      `)
      .in('status', VISIT_STATUSES)
      .order('updated_at', { ascending: true })

    if (casesError) {
      console.error('Error fetching pending cases:', casesError)
      setPendingCases([])
    } else {
      setPendingCases(
        (cases || []).map((c: any) => {
          const addresses = c.household?.address || []
          const currentAddr = addresses.find((a: any) => a.is_current) || addresses[0]
          return {
            id: c.id,
            case_number: c.case_number,
            applicant_name: c.person
              ? `${c.person.first_name} ${c.person.last_name}`
              : '-',
            address: currentAddr?.address_line_1 || '-',
            district_code: c.district_code,
            status: c.status,
          }
        })
      )
    }

    // Query 2: Active field workers
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id, role,
        app_user_profile!inner ( full_name, district_code, is_active )
      `)
      .in('role', [...FIELD_ROLES])

    if (rolesError) {
      console.error('Error fetching field workers:', rolesError)
      setFieldWorkers([])
    } else {
      setFieldWorkers(
        (roles || [])
          .filter((r: any) => r.app_user_profile?.is_active !== false)
          .map((r: any) => ({
            user_id: r.user_id,
            full_name: r.app_user_profile?.full_name || '-',
            role: r.role,
            district_code: r.app_user_profile?.district_code || '-',
          }))
      )
    }

    // Query 3: Scheduled visits (active)
    const { data: visits, error: visitsError } = await supabase
      .from('inspection_visit')
      .select('*')
      .in('visit_status', ['scheduled', 'rescheduled'])
      .order('scheduled_date', { ascending: true })

    if (visitsError) {
      console.error('Error fetching scheduled visits:', visitsError)
      setScheduledVisits([])
    } else {
      // Enrich with case_number and applicant_name from cases already loaded
      const caseMap = new Map<string, PendingVisitCase>()
      // We need all cases for mapping, not just pending
      const allCaseIds = (visits || []).map((v: any) => v.case_id)
      let enrichedCaseMap: Record<string, { case_number: string; applicant_name: string }> = {}

      if (allCaseIds.length > 0) {
        const { data: visitCases } = await supabase
          .from('subsidy_case')
          .select('id, case_number, person:applicant_person_id ( first_name, last_name )')
          .in('id', allCaseIds)

        for (const vc of (visitCases || []) as any[]) {
          enrichedCaseMap[vc.id] = {
            case_number: vc.case_number,
            applicant_name: vc.person ? `${vc.person.first_name} ${vc.person.last_name}` : '-',
          }
        }
      }

      // Map assigned_to to names from field workers
      const workerMap: Record<string, string> = {}
      for (const w of (roles || []) as any[]) {
        workerMap[w.user_id] = w.app_user_profile?.full_name || '-'
      }

      setScheduledVisits(
        (visits || []).map((v: any) => ({
          id: v.id,
          case_id: v.case_id,
          case_number: enrichedCaseMap[v.case_id]?.case_number || '-',
          applicant_name: enrichedCaseMap[v.case_id]?.applicant_name || '-',
          visit_type: v.visit_type,
          assigned_to: v.assigned_to,
          assigned_name: workerMap[v.assigned_to] || '-',
          scheduled_date: v.scheduled_date,
          visit_status: v.visit_status,
          visit_notes: v.visit_notes,
        }))
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const scheduleVisit = useCallback(async (params: {
    caseId: string
    assignedTo: string
    scheduledDate: string
    visitType: 'social' | 'technical' | 'follow_up'
    visitNotes?: string
  }) => {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitting(false)
      return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('inspection_visit')
      .insert({
        case_id: params.caseId,
        assigned_to: params.assignedTo,
        scheduled_date: params.scheduledDate,
        scheduled_by: user.id,
        visit_type: params.visitType,
        visit_notes: params.visitNotes || null,
        visit_status: 'scheduled',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error scheduling visit:', error)
      setSubmitting(false)
      return { error: error.message }
    }

    await logAuditEvent({
      entityType: 'inspection_visit',
      entityId: data.id,
      action: 'VISIT_SCHEDULED',
      reason: `Visit scheduled for case ${params.caseId}`,
      metadata: {
        case_id: params.caseId,
        assigned_to: params.assignedTo,
        scheduled_date: params.scheduledDate,
        visit_type: params.visitType,
      },
    })

    setSubmitting(false)
    await fetchData()
    return { error: null }
  }, [fetchData])

  const cancelVisit = useCallback(async (visitId: string, reason?: string) => {
    setSubmitting(true)
    const { error } = await supabase
      .from('inspection_visit')
      .update({ visit_status: 'cancelled' })
      .eq('id', visitId)

    if (error) {
      console.error('Error cancelling visit:', error)
      setSubmitting(false)
      return { error: error.message }
    }

    await logAuditEvent({
      entityType: 'inspection_visit',
      entityId: visitId,
      action: 'VISIT_CANCELLED',
      reason: reason || 'Visit cancelled',
    })

    setSubmitting(false)
    await fetchData()
    return { error: null }
  }, [fetchData])

  return { pendingCases, fieldWorkers, scheduledVisits, loading, submitting, scheduleVisit, cancelVisit, refetch: fetchData }
}
