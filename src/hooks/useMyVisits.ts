import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useUserRole } from '@/hooks/useUserRole'

export interface MyVisitItem {
  id: string
  case_number: string
  applicant_name: string
  address: string
  district_code: string
  report_status: 'none' | 'draft' | 'finalized'
}

export const useMyVisits = () => {
  const { roles, loading: roleLoading } = useUserRole()
  const [items, setItems] = useState<MyVisitItem[]>([])
  const [loading, setLoading] = useState(true)

  const isSocial = roles.includes('social_field_worker')
  const isTechnical = roles.includes('technical_inspector')

  const fetchVisits = useCallback(async () => {
    if (roleLoading || (!isSocial && !isTechnical)) {
      setItems([])
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
    setLoading(false)
  }, [roleLoading, isSocial, isTechnical])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  return { items, loading: loading || roleLoading, isSocial, isTechnical, refetch: fetchVisits }
}
