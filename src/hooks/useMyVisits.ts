import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useUserRole } from '@/hooks/useUserRole'
import { logAuditEvent } from './useAuditLog'

export interface MyVisitItem {
  id: string
  case_number: string
  applicant_name: string
  address: string
  district_code: string
  report_status: 'none' | 'draft' | 'finalized'
}

export interface MyScheduledVisit {
  id: string
  case_id: string
  case_number: string
  applicant_name: string
  visit_type: string
  scheduled_date: string
  visit_status: string
  visit_notes: string | null
}

export const useMyVisits = () => {
  const { roles, loading: roleLoading } = useUserRole()
  const [items, setItems] = useState<MyVisitItem[]>([])
  const [scheduledVisits, setScheduledVisits] = useState<MyScheduledVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  const isSocial = roles.includes('social_field_worker')
  const isTechnical = roles.includes('technical_inspector')

  const fetchVisits = useCallback(async () => {
    if (roleLoading || (!isSocial && !isTechnical)) {
      setItems([])
      setScheduledVisits([])
      setLoading(false)
      return
    }

    setLoading(true)

    const visitStatuses = isSocial
      ? ['in_social_review']
      : ['in_technical_review']

    // Fetch cases with person and household->address joins
    const { data: cases, error } = await supabase
      .from('subsidy_case')
      .select(`
        id, case_number, district_code, household_id,
        person:applicant_person_id ( first_name, last_name ),
        household:household_id ( 
          address ( address_line_1, is_current )
        )
      `)
      .in('status', visitStatuses)
      .order('updated_at', { ascending: true })

    if (error) {
      console.error('Error fetching visits:', error)
      setItems([])
      setLoading(false)
      return
    }

    // Fetch report status
    const caseIds = (cases || []).map((c: any) => c.id)
    let reportMap: Record<string, { is_finalized: boolean }> = {}

    if (caseIds.length > 0) {
      const reportTable = isSocial ? 'social_report' : 'technical_report'
      const { data: reports } = await supabase
        .from(reportTable)
        .select('case_id, is_finalized')
        .in('case_id', caseIds)

      if (reports) {
        for (const r of reports) {
          reportMap[r.case_id] = { is_finalized: r.is_finalized }
        }
      }
    }

    setItems(
      (cases || []).map((c: any) => {
        const addresses = c.household?.address || []
        const currentAddr = addresses.find((a: any) => a.is_current) || addresses[0]
        const report = reportMap[c.id]

        return {
          id: c.id,
          case_number: c.case_number,
          applicant_name: c.person
            ? `${c.person.first_name} ${c.person.last_name}`
            : '-',
          address: currentAddr?.address_line_1 || '-',
          district_code: c.district_code,
          report_status: report
            ? report.is_finalized
              ? 'finalized'
              : 'draft'
            : 'none',
        }
      })
    )

    // Fetch scheduled inspection visits assigned to current user
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: myVisits, error: myVisitsError } = await supabase
        .from('inspection_visit')
        .select('*')
        .eq('assigned_to', user.id)
        .in('visit_status', ['scheduled', 'rescheduled'])
        .order('scheduled_date', { ascending: true })

      if (myVisitsError) {
        console.error('Error fetching scheduled visits:', myVisitsError)
        setScheduledVisits([])
      } else {
        // Enrich with case details
        const visitCaseIds = (myVisits || []).map((v: any) => v.case_id)
        let caseMap: Record<string, { case_number: string; applicant_name: string }> = {}

        if (visitCaseIds.length > 0) {
          const { data: visitCases } = await supabase
            .from('subsidy_case')
            .select('id, case_number, person:applicant_person_id ( first_name, last_name )')
            .in('id', visitCaseIds)

          for (const vc of (visitCases || []) as any[]) {
            caseMap[vc.id] = {
              case_number: vc.case_number,
              applicant_name: vc.person ? `${vc.person.first_name} ${vc.person.last_name}` : '-',
            }
          }
        }

        setScheduledVisits(
          (myVisits || []).map((v: any) => ({
            id: v.id,
            case_id: v.case_id,
            case_number: caseMap[v.case_id]?.case_number || '-',
            applicant_name: caseMap[v.case_id]?.applicant_name || '-',
            visit_type: v.visit_type,
            scheduled_date: v.scheduled_date,
            visit_status: v.visit_status,
            visit_notes: v.visit_notes,
          }))
        )
      }
    }

    setLoading(false)
  }, [roleLoading, isSocial, isTechnical])

  const completeVisit = useCallback(async (visitId: string, notes?: string) => {
    setCompleting(true)
    const updatePayload: any = {
      visit_status: 'completed',
      completed_at: new Date().toISOString(),
    }
    if (notes) updatePayload.visit_notes = notes

    const { error } = await supabase
      .from('inspection_visit')
      .update(updatePayload)
      .eq('id', visitId)

    if (error) {
      console.error('Error completing visit:', error)
      setCompleting(false)
      return { error: error.message }
    }

    await logAuditEvent({
      entityType: 'inspection_visit',
      entityId: visitId,
      action: 'VISIT_COMPLETED',
      reason: notes || 'Visit completed',
    })

    setCompleting(false)
    await fetchVisits()
    return { error: null }
  }, [fetchVisits])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  return { items, scheduledVisits, loading: loading || roleLoading, isSocial, isTechnical, refetch: fetchVisits, completeVisit, completing }
}
