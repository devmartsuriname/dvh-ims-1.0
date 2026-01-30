import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications'
import { formatDistanceToNow } from 'date-fns'

/**
 * Get icon based on notification type
 */
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'status_change':
      return 'solar:refresh-circle-outline'
    case 'transition_blocked':
      return 'solar:danger-triangle-outline'
    default:
      return 'solar:bell-outline'
  }
}

/**
 * Get link based on entity type and ID
 */
const getEntityLink = (entityType: string, entityId: string): string => {
  switch (entityType) {
    case 'subsidy_case':
      return `/subsidy-cases/${entityId}`
    case 'housing_registration':
      return `/housing-registrations/${entityId}`
    default:
      return '#'
  }
}

/**
 * Notification Item Component
 */
const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: AdminNotification
  onMarkAsRead: (id: string) => void
}) => {
  const navigate = useNavigate()
  const icon = getNotificationIcon(notification.notification_type)
  const link = getEntityLink(notification.entity_type, notification.entity_id)
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  const handleClick = useCallback(() => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    if (link !== '#') {
      navigate(link)
    }
  }, [notification.id, notification.is_read, link, navigate, onMarkAsRead])

  return (
    <DropdownItem 
      className={`py-3 border-bottom text-wrap ${notification.is_read ? 'opacity-75' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex">
        <div className="flex-shrink-0">
          <div className="avatar-sm me-2">
            <span className={`avatar-title ${notification.notification_type === 'transition_blocked' ? 'bg-soft-danger text-danger' : 'bg-soft-info text-info'} fs-20 rounded-circle`}>
              <IconifyIcon icon={icon} />
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <span className={`mb-0 ${notification.is_read ? '' : 'fw-semibold'}`}>
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className="badge bg-primary rounded-pill ms-2" style={{ fontSize: '0.6rem' }}>New</span>
            )}
          </div>
          <span className="mb-0 text-wrap d-block small text-muted">
            {notification.message}
          </span>
          <small className="text-muted">{timeAgo}</small>
        </div>
      </div>
    </DropdownItem>
  )
}

/**
 * Notifications Component
 * V1.3 Phase 2 S-03: Live in-app notifications for admin users
 */
const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useAdminNotifications()

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <IconifyIcon icon="solar:bell-bing-outline" className="fs-22 align-middle" />
        {unreadCount > 0 && (
          <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </DropdownToggle>
      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h6>
            </Col>
            {unreadCount > 0 && (
              <Col xs={'auto'}>
                <Link 
                  to="#" 
                  className="text-dark text-decoration-underline"
                  onClick={(e) => {
                    e.preventDefault()
                    markAllAsRead()
                  }}
                >
                  <small>Mark all as read</small>
                </Link>
              </Col>
            )}
          </Row>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : notifications.length > 0 ? (
          <SimplebarReactClient style={{ maxHeight: 280 }}>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={markAsRead}
              />
            ))}
          </SimplebarReactClient>
        ) : (
          <div className="text-center py-4 text-muted">
            <IconifyIcon icon="solar:bell-off-outline" className="fs-24 mb-2 d-block" />
            <small>No notifications</small>
          </div>
        )}
        
        <div className="text-center py-3">
          <Link to="/audit-log" className="btn btn-primary btn-sm">
            View Activity Log <IconifyIcon icon="bx:right-arrow-alt" className="ms-1" />
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default Notifications
