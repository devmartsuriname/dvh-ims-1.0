import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logAuditEvent } from './useAuditLog'
import { useUserRole } from './useUserRole'
import type { Json } from '@/integrations/supabase/types'

export interface CaseAssignment {
  id: string
  subsidy_case_id: string
  assigned_user_id: string
  assigned_role: string
  assignment_status: string
  assigned_by: string
  reason: string
  created_at: string
}

const WRITE_ROLES = ['system_admin', 'project_leader'] as const

export function useCaseAssignments() {
  const { hasAnyRole } = useUserRole()
  const [loading, setLoading] = useState(false)

  const canWrite = hasAnyRole([...WRITE_ROLES])

  const fetchAssignments = useCallback(async (subsidyCaseId?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('case_assignment')
        .select('*')
        .order('created_at', { ascending: false })

      if (subsidyCaseId) {
        query = query.eq('subsidy_case_id', subsidyCaseId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as CaseAssignment[]
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActiveAssignments = useCallback(async (subsidyCaseId?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('case_assignment')
        .select('*')
        .eq('assignment_status', 'assigned')
        .order('created_at', { ascending: false })

      if (subsidyCaseId) {
        query = query.eq('subsidy_case_id', subsidyCaseId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as CaseAssignment[]
    } finally {
      setLoading(false)
    }
  }, [])

  const assignWorker = useCallback(async (
    subsidyCaseId: string,
    targetUserId: string,
    targetRole: string,
    reason: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('case_assignment')
      .insert({
        subsidy_case_id: subsidyCaseId,
        assigned_user_id: targetUserId,
        assigned_role: targetRole,
        assignment_status: 'assigned',
        assigned_by: user.id,
        reason,
      })
      .select()
      .single()

    if (error) throw error

    await logAuditEvent({
      entityType: 'case_assignment',
      entityId: data.id,
      action: 'CASE_ASSIGNED',
      reason,
      metadata: {
        subsidy_case_id: subsidyCaseId,
        target_user_id: targetUserId,
        target_role: targetRole,
      } as Json,
    })

    return data as CaseAssignment
  }, [])

  const reassignWorker = useCallback(async (
    currentAssignmentId: string,
    subsidyCaseId: string,
    newUserId: string,
    newRole: string,
    reason: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create revocation record for old assignment
    const { error: revokeError } = await supabase
      .from('case_assignment')
      .insert({
        subsidy_case_id: subsidyCaseId,
        assigned_user_id: (await supabase.from('case_assignment').select('assigned_user_id').eq('id', currentAssignmentId).single()).data?.assigned_user_id || '',
        assigned_role: (await supabase.from('case_assignment').select('assigned_role').eq('id', currentAssignmentId).single()).data?.assigned_role || '',
        assignment_status: 'reassigned',
        assigned_by: user.id,
        reason,
      })

    if (revokeError) throw revokeError

    await logAuditEvent({
      entityType: 'case_assignment',
      entityId: currentAssignmentId,
      action: 'CASE_REASSIGNED',
      reason,
      metadata: {
        previous_assignment_id: currentAssignmentId,
        new_user_id: newUserId,
      } as Json,
    })

    // Create new assignment
    const { data: newAssignment, error: assignError } = await supabase
      .from('case_assignment')
      .insert({
        subsidy_case_id: subsidyCaseId,
        assigned_user_id: newUserId,
        assigned_role: newRole,
        assignment_status: 'assigned',
        assigned_by: user.id,
        reason,
      })
      .select()
      .single()

    if (assignError) throw assignError

    await logAuditEvent({
      entityType: 'case_assignment',
      entityId: newAssignment.id,
      action: 'CASE_ASSIGNED',
      reason,
      metadata: {
        subsidy_case_id: subsidyCaseId,
        target_user_id: newUserId,
        target_role: newRole,
        reassigned_from: currentAssignmentId,
      } as Json,
    })

    return newAssignment as CaseAssignment
  }, [])

  const revokeAssignment = useCallback(async (
    assignmentId: string,
    subsidyCaseId: string,
    assignedUserId: string,
    assignedRole: string,
    reason: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('case_assignment')
      .insert({
        subsidy_case_id: subsidyCaseId,
        assigned_user_id: assignedUserId,
        assigned_role: assignedRole,
        assignment_status: 'revoked',
        assigned_by: user.id,
        reason,
      })

    if (error) throw error

    await logAuditEvent({
      entityType: 'case_assignment',
      entityId: assignmentId,
      action: 'CASE_REVOKED',
      reason,
      metadata: {
        subsidy_case_id: subsidyCaseId,
        revoked_user_id: assignedUserId,
      } as Json,
    })
  }, [])

  const completeAssignment = useCallback(async (
    assignmentId: string,
    subsidyCaseId: string,
    assignedUserId: string,
    assignedRole: string,
    reason: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('case_assignment')
      .insert({
        subsidy_case_id: subsidyCaseId,
        assigned_user_id: assignedUserId,
        assigned_role: assignedRole,
        assignment_status: 'completed',
        assigned_by: user.id,
        reason,
      })

    if (error) throw error

    await logAuditEvent({
      entityType: 'case_assignment',
      entityId: assignmentId,
      action: 'CASE_ASSIGNMENT_COMPLETED',
      reason,
      metadata: {
        subsidy_case_id: subsidyCaseId,
        completed_user_id: assignedUserId,
      } as Json,
    })
  }, [])

  return {
    loading,
    canWrite,
    fetchAssignments,
    fetchActiveAssignments,
    assignWorker,
    reassignWorker,
    revokeAssignment,
    completeAssignment,
  }
}
