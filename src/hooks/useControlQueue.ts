import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useUserRole, type AppRole } from '@/hooks/useUserRole'

export interface ControlQueueItem {
  id: string
  case_number: string
  applicant_name: string
  status: string
  district_code: string
  updated_at: string
  days_in_status: number
}

const ROLE_STATUS_MAP: Record<string, string[]> = {
  frontdesk_bouwsubsidie: ['received', 'returned_to_intake', 'needs_more_docs'],
  social_field_worker: ['in_social_review', 'returned_to_social'],
  technical_inspector: ['in_technical_review', 'returned_to_technical'],
  admin_staff: ['in_admin_review', 'screening'],
  project_leader: ['fieldwork'],
  director: ['awaiting_director_approval', 'returned_to_director'],
  ministerial_advisor: ['in_ministerial_advice', 'returned_to_advisor'],
  minister: ['awaiting_minister_decision'],
}

const ALL_STATUSES_ROLES: AppRole[] = ['system_admin', 'audit']

function getRelevantStatuses(roles: AppRole[]): string[] | null {
  // system_admin and audit see all
  if (roles.some(r => ALL_STATUSES_ROLES.includes(r))) {
    return null // null = no filter
  }

  const statuses = new Set<string>()
  for (const role of roles) {
    const mapped = ROLE_STATUS_MAP[role]
    if (mapped) {
      mapped.forEach(s => statuses.add(s))
    }
  }
  return statuses.size > 0 ? Array.from(statuses) : []
}

function calcDaysInStatus(updatedAt: string): number {
  const diff = Date.now() - new Date(updatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const useControlQueue = () => {
  const { roles, loading: roleLoading } = useUserRole()
  const [items, setItems] = useState<ControlQueueItem[]>([])
  const [loading, setLoading] = useState(true)

  const relevantStatuses = useMemo(() => getRelevantStatuses(roles), [roles])

  const fetchQueue = useCallback(async () => {
    if (roleLoading) return

    setLoading(true)
    let query = supabase
      .from('subsidy_case')
      .select(`
        id, case_number, status, district_code, updated_at,
        person:applicant_person_id ( first_name, last_name )
      `)
      .order('updated_at', { ascending: true })

    // Apply status filter if not full-access role
    if (relevantStatuses !== null) {
      if (relevantStatuses.length === 0) {
        setItems([])
        setLoading(false)
        return
      }
      query = query.in('status', relevantStatuses)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching control queue:', error)
      setItems([])
    } else {
      setItems(
        (data || []).map((c: any) => ({
          id: c.id,
          case_number: c.case_number,
          applicant_name: c.person
            ? `${c.person.first_name} ${c.person.last_name}`
            : '-',
          status: c.status,
          district_code: c.district_code,
          updated_at: c.updated_at,
          days_in_status: calcDaysInStatus(c.updated_at),
        }))
      )
    }
    setLoading(false)
  }, [roleLoading, relevantStatuses])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { items, loading: loading || roleLoading, refetch: fetchQueue }
}
