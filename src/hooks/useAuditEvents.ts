import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface AuditEventFilters {
  dateFrom?: string
  dateTo?: string
  actor?: string
  action?: string
  entityType?: string
}

export interface AuditEvent {
  id: string
  occurred_at: string
  actor_user_id: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_id: string | null
  reason: string | null
  metadata_json: Record<string, unknown> | null
  actor_name?: string
}

interface UseAuditEventsReturn {
  events: AuditEvent[]
  loading: boolean
  error: string | null
  totalCount: number
  page: number
  pageSize: number
  setPage: (page: number) => void
  refetch: () => void
  distinctActions: string[]
  distinctEntityTypes: string[]
}

const PAGE_SIZE = 25

export const useAuditEvents = (filters: AuditEventFilters): UseAuditEventsReturn => {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [distinctActions, setDistinctActions] = useState<string[]>([])
  const [distinctEntityTypes, setDistinctEntityTypes] = useState<string[]>([])

  // Fetch distinct values for filters on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [actionsResult, entityTypesResult] = await Promise.all([
        supabase.from('audit_event').select('action').order('action'),
        supabase.from('audit_event').select('entity_type').order('entity_type'),
      ])

      if (actionsResult.data) {
        const uniqueActions = [...new Set(actionsResult.data.map(r => r.action))]
        setDistinctActions(uniqueActions)
      }
      if (entityTypesResult.data) {
        const uniqueTypes = [...new Set(entityTypesResult.data.map(r => r.entity_type))]
        setDistinctEntityTypes(uniqueTypes)
      }
    }

    fetchFilterOptions()
  }, [])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * PAGE_SIZE

      let query = supabase
        .from('audit_event')
        .select('*', { count: 'exact' })
        .order('occurred_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('occurred_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(filters.dateTo)
        endDate.setDate(endDate.getDate() + 1)
        query = query.lt('occurred_at', endDate.toISOString())
      }
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters.actor) {
        query = query.ilike('actor_user_id', `%${filters.actor}%`)
      }

      const { data, error: queryError, count } = await query

      if (queryError) {
        setError(queryError.message)
        setEvents([])
        setTotalCount(0)
        return
      }

      // Fetch actor names for user IDs
      const userIds = [...new Set((data || []).filter(e => e.actor_user_id).map(e => e.actor_user_id))]
      let userMap: Record<string, string> = {}

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('app_user_profile')
          .select('user_id, full_name')
          .in('user_id', userIds)

        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = p.full_name
            return acc
          }, {} as Record<string, string>)
        }
      }

      const eventsWithNames: AuditEvent[] = (data || []).map(event => ({
        ...event,
        metadata_json: event.metadata_json as Record<string, unknown> | null,
        actor_name: event.actor_user_id ? userMap[event.actor_user_id] || 'Unknown' : 'System/Public',
      }))

      setEvents(eventsWithNames)
      setTotalCount(count || 0)
    } catch (err) {
      setError('Failed to fetch audit events')
      console.error('Audit events fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters.dateFrom, filters.dateTo, filters.action, filters.entityType, filters.actor])

  return {
    events,
    loading,
    error,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    refetch: fetchEvents,
    distinctActions,
    distinctEntityTypes,
  }
}
