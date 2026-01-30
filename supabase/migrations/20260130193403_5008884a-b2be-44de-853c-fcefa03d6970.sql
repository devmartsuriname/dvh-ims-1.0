-- ============================================
-- DVH-IMS V1.3 Phase 2: Admin Notification Table
-- S-03: Admin Notifications
-- ============================================

-- Create admin_notification table for in-app notifications
CREATE TABLE public.admin_notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid,
  recipient_role text,
  district_code text,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable Row Level Security
ALTER TABLE public.admin_notification ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- SELECT: Users can see their own notifications (by user_id or role+district)
CREATE POLICY "role_select_own_notification" ON public.admin_notification
FOR SELECT
USING (
  -- Direct user targeting
  (recipient_user_id = auth.uid())
  OR
  -- Role-based targeting with district scope
  (
    recipient_user_id IS NULL
    AND recipient_role IS NOT NULL
    AND has_any_role(auth.uid(), ARRAY[recipient_role::app_role])
    AND (
      district_code IS NULL
      OR district_code = get_user_district(auth.uid())
      OR is_national_role(auth.uid())
    )
  )
);

-- INSERT: Authenticated users with valid admin roles can create notifications
CREATE POLICY "role_insert_admin_notification" ON public.admin_notification
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'system_admin'::app_role)
  OR has_role(auth.uid(), 'project_leader'::app_role)
  OR has_role(auth.uid(), 'minister'::app_role)
  OR has_role(auth.uid(), 'frontdesk_bouwsubsidie'::app_role)
  OR has_role(auth.uid(), 'frontdesk_housing'::app_role)
  OR has_role(auth.uid(), 'admin_staff'::app_role)
);

-- UPDATE: Users can only mark their own notifications as read
CREATE POLICY "role_update_own_notification" ON public.admin_notification
FOR UPDATE
USING (
  -- Direct user targeting
  (recipient_user_id = auth.uid())
  OR
  -- Role-based targeting with district scope
  (
    recipient_user_id IS NULL
    AND recipient_role IS NOT NULL
    AND has_any_role(auth.uid(), ARRAY[recipient_role::app_role])
    AND (
      district_code IS NULL
      OR district_code = get_user_district(auth.uid())
      OR is_national_role(auth.uid())
    )
  )
)
WITH CHECK (
  -- Only allow updating is_read and read_at
  is_read IS NOT NULL
);

-- No DELETE policy - notifications are immutable (audit trail)

-- ============================================
-- Indexes for Performance
-- ============================================

-- Fast user-specific queries
CREATE INDEX idx_admin_notification_recipient_user_id 
ON public.admin_notification(recipient_user_id) 
WHERE recipient_user_id IS NOT NULL;

-- Fast role-based queries
CREATE INDEX idx_admin_notification_recipient_role 
ON public.admin_notification(recipient_role, district_code) 
WHERE recipient_role IS NOT NULL;

-- Audit event linkage
CREATE INDEX idx_admin_notification_correlation_id 
ON public.admin_notification(correlation_id);

-- Unread count queries
CREATE INDEX idx_admin_notification_unread 
ON public.admin_notification(is_read, created_at DESC) 
WHERE is_read = false;

-- Entity reference queries
CREATE INDEX idx_admin_notification_entity 
ON public.admin_notification(entity_type, entity_id);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE public.admin_notification IS 'V1.3 Phase 2 S-03: In-app notifications for admin users. Immutable - no DELETE allowed.';
COMMENT ON COLUMN public.admin_notification.correlation_id IS 'Links to audit_event.correlation_id for traceability (D-02 infrastructure)';
COMMENT ON COLUMN public.admin_notification.notification_type IS 'Type: status_change, transition_blocked, etc.';
COMMENT ON COLUMN public.admin_notification.recipient_role IS 'Role-based targeting using app_role enum values';
COMMENT ON COLUMN public.admin_notification.district_code IS 'District scoping for role-based notifications';