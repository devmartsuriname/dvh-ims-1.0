import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'

type AuditAction = 'create' | 'update' | 'delete' | 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'SOCIAL_ASSESSMENT_STARTED' | 'SOCIAL_ASSESSMENT_COMPLETED' | 'SOCIAL_ASSESSMENT_RETURNED' | 'TECHNICAL_INSPECTION_STARTED' | 'TECHNICAL_INSPECTION_COMPLETED' | 'TECHNICAL_INSPECTION_RETURNED' | 'ADMIN_REVIEW_STARTED' | 'ADMIN_REVIEW_COMPLETED' | 'ADMIN_REVIEW_RETURNED'
type EntityType = 'person' | 'household' | 'household_member' | 'contact_point' | 'address' | 'subsidy_case' | 'subsidy_document' | 'subsidy_document_upload' | 'social_report' | 'technical_report' | 'housing_registration' | 'housing_urgency' | 'district_quota' | 'allocation_run' | 'allocation_decision' | 'assignment_record' | 'admin_notification'

interface AuditLogParams {
  entityType?: EntityType
  entity_type?: EntityType
  entityId?: string
  entity_id?: string
  action: AuditAction
  reason?: string
  metadata?: Json
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Cannot log audit event: no authenticated user')
    return
  }

  // Fetch user's role for audit attribution
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const actorRole = roleData?.role || 'unknown'

  const entityType = params.entityType || params.entity_type
  const entityId = params.entityId || params.entity_id

  const { error } = await supabase.from('audit_event').insert([{
    actor_user_id: user.id,
    actor_role: actorRole,
    entity_type: entityType,
    entity_id: entityId,
    action: params.action.toUpperCase(),
    reason: params.reason ?? null,
    metadata_json: params.metadata ?? null,
  }])

  if (error) {
    console.error('Failed to log audit event:', error)
  }
}

// Hook wrapper for convenience
export function useAuditLog() {
  return {
    logEvent: logAuditEvent
  }
}
