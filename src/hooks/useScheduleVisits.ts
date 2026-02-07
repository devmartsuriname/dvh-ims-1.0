import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

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

export const useScheduleVisits = () => {
  const [pendingCases, setPendingCases] = useState<PendingVisitCase[]>([])
  const [fieldWorkers, setFieldWorkers] = useState<FieldWorker[]>([])
  const [loading, setLoading] = useState(true)

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

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { pendingCases, fieldWorkers, loading }
}
