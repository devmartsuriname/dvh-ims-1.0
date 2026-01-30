import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logAuditEvent } from '@/hooks/useAuditLog'

/**
 * Admin Notification Interface
 * V1.3 Phase 2 S-03: In-app notifications for admin users
 */
export interface AdminNotification {
  id: string
  recipient_user_id: string | null
  recipient_role: string | null
  district_code: string | null
  notification_type: string
  title: string
  message: string
  entity_type: string
  entity_id: string
  correlation_id: string
  is_read: boolean
  read_at: string | null
  created_at: string
  created_by: string | null
}

interface UseAdminNotificationsReturn {
  notifications: AdminNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => void
}

/**
 * Hook for managing admin notifications
 * V1.3 Phase 2 S-03: Admin Notifications
 * 
 * Features:
 * - Fetches notifications for current user (RLS-filtered)
 * - Real-time subscription for new notifications
 * - Audit logging for mark-as-read actions
 */
export function useAdminNotifications(): UseAdminNotificationsReturn {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('admin_notification')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw fetchError
      }

      setNotifications(data || [])
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err)
      setError(err.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchNotifications()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notification',
        },
        (payload) => {
          // Add new notification to the top of the list
          setNotifications((prev) => [payload.new as AdminNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_notification',
        },
        (payload) => {
          // Update the notification in the list
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? (payload.new as AdminNotification) : n
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications])

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id)
      if (!notification || notification.is_read) return

      const { error: updateError } = await supabase
        .from('admin_notification')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Log audit event for notification read
      await logAuditEvent({
        action: 'UPDATE',
        entity_type: 'admin_notification' as any,
        entity_id: id,
        metadata: {
          action_detail: 'NOTIFICATION_READ',
          correlation_id: notification.correlation_id,
        },
      })

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      )
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [notifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error: updateError } = await supabase
        .from('admin_notification')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in('id', unreadIds)

      if (updateError) throw updateError

      // Log audit event for bulk read
      await logAuditEvent({
        action: 'UPDATE',
        entity_type: 'admin_notification' as any,
        metadata: {
          action_detail: 'NOTIFICATION_READ_ALL',
          count: unreadIds.length,
        },
      })

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}

/**
 * Create an admin notification
 * V1.3 Phase 2 S-03: Notification creation utility
 * 
 * @param params Notification parameters
 * @returns The created notification ID or null on failure
 */
export async function createAdminNotification(params: {
  recipientRole?: string
  recipientUserId?: string
  districtCode?: string
  notificationType: string
  title: string
  message: string
  entityType: string
  entityId: string
  correlationId: string
}): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('admin_notification')
      .insert({
        recipient_user_id: params.recipientUserId || null,
        recipient_role: params.recipientRole || null,
        district_code: params.districtCode || null,
        notification_type: params.notificationType,
        title: params.title,
        message: params.message,
        entity_type: params.entityType,
        entity_id: params.entityId,
        correlation_id: params.correlationId,
        created_by: user?.id || null,
      })
      .select('id')
      .single()

    if (error) {
      // Log notification failure to audit
      await logAuditEvent({
        action: 'CREATE',
        entity_type: 'admin_notification' as any,
        entity_id: params.entityId,
        reason: `NOTIFICATION_FAILED: ${error.message}`,
        metadata: {
          action_detail: 'NOTIFICATION_FAILED',
          correlation_id: params.correlationId,
          error: error.message,
          notification_type: params.notificationType,
        },
      })
      console.error('Failed to create notification:', error)
      return null
    }

    // Log successful notification creation
    await logAuditEvent({
      action: 'CREATE',
      entity_type: 'admin_notification' as any,
      entity_id: data.id,
      metadata: {
        action_detail: 'NOTIFICATION_CREATED',
        correlation_id: params.correlationId,
        notification_type: params.notificationType,
        target_role: params.recipientRole,
        target_user: params.recipientUserId,
      },
    })

    return data.id
  } catch (err: any) {
    console.error('Failed to create notification:', err)
    
    // Log unexpected failure
    try {
      await logAuditEvent({
        action: 'CREATE',
        entity_type: 'admin_notification' as any,
        entity_id: params.entityId,
        reason: `NOTIFICATION_FAILED: ${err.message}`,
        metadata: {
          action_detail: 'NOTIFICATION_FAILED',
          correlation_id: params.correlationId,
          error: err.message,
        },
      })
    } catch {
      // Ignore audit logging failure
    }
    
    return null
  }
}
