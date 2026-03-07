import { useEffect, useState, useCallback } from 'react'
import { Spinner, Badge } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'

interface TimelineItem {
  id: string
  timestamp: string
  source: 'status_history' | 'audit_event'
  actorName: string
  actorRole: string | null
  label: string
  description: string | null
  reason: string | null
  metadata?: Record<string, unknown> | null
}

interface CaseTimelineProps {
  caseId: string
}

const RELEVANT_ACTIONS = [
  'STATUS_CHANGE', 'DOCUMENT_VERIFIED', 'CASE_ASSIGNED', 'CASE_REASSIGNED',
  'VISIT_SCHEDULED', 'VISIT_COMPLETED', 'VISIT_CANCELLED', 'VISIT_RESCHEDULED',
  'DIRECTOR_APPROVED', 'MINISTER_APPROVED', 'MINISTER_RETURNED',
  'SOCIAL_ASSESSMENT_STARTED', 'SOCIAL_ASSESSMENT_COMPLETED',
  'TECHNICAL_INSPECTION_STARTED', 'TECHNICAL_INSPECTION_COMPLETED',
  'ADMIN_REVIEW_STARTED', 'ADMIN_REVIEW_COMPLETED',
  'MINISTERIAL_ADVICE_STARTED', 'MINISTERIAL_ADVICE_COMPLETED',
  'DIRECTOR_REVIEW_STARTED', 'ARCHIVE_VIEWED',
  'SUBMISSION_VALIDATION_BLOCKED', 'CREATE', 'UPDATE',
  'CASE_REVOKED', 'CASE_ASSIGNMENT_COMPLETED',
  'SOCIAL_ASSESSMENT_RETURNED', 'TECHNICAL_INSPECTION_RETURNED',
  'ADMIN_REVIEW_RETURNED', 'DIRECTOR_RETURNED',
  'MINISTERIAL_ADVICE_RETURNED', 'MINISTER_DECISION_STARTED',
]

const STATUS_LABELS: Record<string, string> = {
  received: 'Received',
  in_social_review: 'In Social Review',
  social_completed: 'Social Completed',
  returned_to_intake: 'Returned to Intake',
  in_technical_review: 'In Technical Review',
  technical_approved: 'Technical Approved',
  returned_to_social: 'Returned to Social',
  in_admin_review: 'In Admin Review',
  admin_complete: 'Admin Complete',
  returned_to_technical: 'Returned to Technical',
  screening: 'Screening',
  needs_more_docs: 'Needs More Docs',
  fieldwork: 'Fieldwork',
  awaiting_director_approval: 'Awaiting Director Approval',
  director_approved: 'Director Approved',
  returned_to_screening: 'Returned to Screening',
  in_ministerial_advice: 'In Ministerial Advice',
  ministerial_advice_complete: 'Advice Complete',
  returned_to_director: 'Returned to Director',
  awaiting_minister_decision: 'Awaiting Minister Decision',
  minister_approved: 'Minister Approved',
  returned_to_advisor: 'Returned to Advisor',
  approved_for_council: 'Approved for Council',
  council_doc_generated: 'Council Doc Generated',
  finalized: 'Finalized',
  rejected: 'Rejected',
}

const ACTION_BADGE_COLORS: Record<string, string> = {
  STATUS_CHANGE: 'info',
  CREATE: 'success',
  UPDATE: 'secondary',
  DOCUMENT_VERIFIED: 'primary',
  CASE_ASSIGNED: 'warning',
  CASE_REASSIGNED: 'warning',
  VISIT_SCHEDULED: 'primary',
  VISIT_COMPLETED: 'success',
  VISIT_CANCELLED: 'danger',
  VISIT_RESCHEDULED: 'warning',
  DIRECTOR_APPROVED: 'success',
  MINISTER_APPROVED: 'success',
  MINISTER_RETURNED: 'warning',
  SUBMISSION_VALIDATION_BLOCKED: 'danger',
  ARCHIVE_VIEWED: 'secondary',
}

const formatActionLabel = (action: string): string => {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bId\b/g, 'ID')
}

const CaseTimeline = ({ caseId }: CaseTimelineProps) => {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both sources in parallel
      const [statusRes, auditRes] = await Promise.all([
        supabase
          .from('subsidy_case_status_history')
          .select('id, from_status, to_status, reason, changed_at, changed_by')
          .eq('case_id', caseId)
          .order('changed_at', { ascending: false }),
        supabase
          .from('audit_event')
          .select('id, occurred_at, actor_user_id, actor_role, action, reason, metadata_json')
          .eq('entity_id', caseId)
          .in('action', RELEVANT_ACTIONS)
          .order('occurred_at', { ascending: false })
      ])

      if (statusRes.error) throw statusRes.error
      if (auditRes.error) throw auditRes.error

      // Collect all unique user IDs for name resolution
      const userIds = new Set<string>()
      ;(statusRes.data || []).forEach(r => { if (r.changed_by) userIds.add(r.changed_by) })
      ;(auditRes.data || []).forEach(r => { if (r.actor_user_id) userIds.add(r.actor_user_id) })

      let userMap: Record<string, string> = {}
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('app_user_profile')
          .select('user_id, full_name')
          .in('user_id', Array.from(userIds))

        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = p.full_name
            return acc
          }, {} as Record<string, string>)
        }
      }

      // Map status history entries
      const statusItems: TimelineItem[] = (statusRes.data || []).map(entry => ({
        id: `sh-${entry.id}`,
        timestamp: entry.changed_at,
        source: 'status_history' as const,
        actorName: entry.changed_by ? (userMap[entry.changed_by] || 'Unknown') : 'System',
        actorRole: null,
        label: `Status: ${STATUS_LABELS[entry.from_status || ''] || entry.from_status || '—'} → ${STATUS_LABELS[entry.to_status] || entry.to_status}`,
        description: null,
        reason: entry.reason,
      }))

      // Map audit event entries
      const auditItems: TimelineItem[] = (auditRes.data || []).map(event => ({
        id: `ae-${event.id}`,
        timestamp: event.occurred_at,
        source: 'audit_event' as const,
        actorName: event.actor_user_id ? (userMap[event.actor_user_id] || 'Unknown') : 'System',
        actorRole: event.actor_role,
        label: formatActionLabel(event.action),
        description: null,
        reason: event.reason,
        metadata: event.metadata_json as Record<string, unknown> | null,
      }))

      // Merge and sort descending
      const merged = [...statusItems, ...auditItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setItems(merged)
    } catch (err: any) {
      setError(err.message || 'Failed to load timeline')
      console.error('Timeline fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Loading timeline...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-danger py-3">{error}</div>
  }

  if (items.length === 0) {
    return <p className="text-muted py-3">No timeline events found for this case.</p>
  }

  return (
    <div className="position-relative ps-4" style={{ borderLeft: '2px solid var(--bs-border-color)' }}>
      {items.map((item) => {
        const badgeColor = item.source === 'status_history'
          ? 'info'
          : (ACTION_BADGE_COLORS[item.label.replace(/ /g, '_').toUpperCase()] || 'secondary')

        return (
          <div key={item.id} className="position-relative mb-4 ps-3">
            {/* Dot indicator */}
            <div
              className={`position-absolute bg-${item.source === 'status_history' ? 'info' : 'primary'} rounded-circle`}
              style={{
                width: 10,
                height: 10,
                left: -25,
                top: 6,
              }}
            />

            {/* Timestamp */}
            <small className="text-muted d-block mb-1">
              {new Date(item.timestamp).toLocaleString()}
            </small>

            {/* Actor */}
            <div className="fw-semibold mb-1">
              {item.actorName}
              {item.actorRole && (
                <Badge bg="soft-secondary" className="ms-2 badge-soft-secondary fw-normal">
                  {item.actorRole}
                </Badge>
              )}
            </div>

            {/* Event label */}
            <div className="mb-1">
              <Badge bg={badgeColor}>{item.label}</Badge>
            </div>

            {/* Reason / notes */}
            {item.reason && (
              <p className="text-muted small mb-0">{item.reason}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CaseTimeline
