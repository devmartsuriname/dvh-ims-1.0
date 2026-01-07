import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'

type AuditAction = 'create' | 'update' | 'delete'
type EntityType = 'person' | 'household' | 'household_member' | 'contact_point' | 'address'

interface AuditLogParams {
  entityType: EntityType
  entityId: string
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

  const { error } = await supabase.from('audit_event').insert([{
    actor_user_id: user.id,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    reason: params.reason ?? null,
    metadata_json: params.metadata ?? null,
  }])

  if (error) {
    console.error('Failed to log audit event:', error)
  }
}
