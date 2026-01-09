import { Offcanvas, Badge, Table } from 'react-bootstrap'
import { format } from 'date-fns'
import type { AuditEvent } from '@/hooks/useAuditEvents'

interface AuditDetailDrawerProps {
  event: AuditEvent | null
  show: boolean
  onHide: () => void
}

// Fields that should NOT be displayed for security reasons
const SENSITIVE_FIELDS = ['token', 'password', 'secret', 'ip_hash', 'ip', 'key', 'credential']

const AuditDetailDrawer = ({ event, show, onHide }: AuditDetailDrawerProps) => {
  if (!event) return null

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), "dd MMMM yyyy 'at' HH:mm:ss")
    } catch {
      return timestamp
    }
  }

  const getActionBadgeVariant = (action: string): string => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'success'
      case 'UPDATE':
        return 'info'
      case 'DELETE':
        return 'danger'
      case 'STATUS_CHANGE':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  // Filter out sensitive metadata fields
  const getSafeMetadata = (): Record<string, unknown> => {
    if (!event.metadata_json) return {}

    const safe: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(event.metadata_json)) {
      const isSensitive = SENSITIVE_FIELDS.some(
        (field) => key.toLowerCase().includes(field)
      )
      if (!isSensitive) {
        safe[key] = value
      }
    }
    return safe
  }

  const safeMetadata = getSafeMetadata()
  const hasMetadata = Object.keys(safeMetadata).length > 0

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '450px' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Audit Event Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Table borderless size="sm">
          <tbody>
            <tr>
              <td className="text-muted" style={{ width: '35%' }}>
                Timestamp
              </td>
              <td>{formatTimestamp(event.occurred_at)}</td>
            </tr>
            <tr>
              <td className="text-muted">Event ID</td>
              <td>
                <code className="small">{event.id}</code>
              </td>
            </tr>
            <tr>
              <td className="text-muted">Action</td>
              <td>
                <Badge bg={getActionBadgeVariant(event.action)}>{event.action}</Badge>
              </td>
            </tr>
            <tr>
              <td className="text-muted">Entity Type</td>
              <td>{event.entity_type}</td>
            </tr>
            <tr>
              <td className="text-muted">Entity ID</td>
              <td>
                <code className="small">{event.entity_id || '-'}</code>
              </td>
            </tr>
            <tr>
              <td className="text-muted">Actor</td>
              <td>{event.actor_name || 'System/Public'}</td>
            </tr>
            <tr>
              <td className="text-muted">Actor ID</td>
              <td>
                <code className="small">{event.actor_user_id || '-'}</code>
              </td>
            </tr>
            <tr>
              <td className="text-muted">Actor Role</td>
              <td>
                {event.actor_role ? (
                  <Badge bg="secondary" className="text-uppercase">
                    {event.actor_role.replace('_', ' ')}
                  </Badge>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
            </tr>
            {event.reason && (
              <tr>
                <td className="text-muted">Reason</td>
                <td>{event.reason}</td>
              </tr>
            )}
          </tbody>
        </Table>

        {hasMetadata && (
          <>
            <hr />
            <h6 className="text-muted mb-3">Metadata</h6>
            <Table borderless size="sm">
              <tbody>
                {Object.entries(safeMetadata).map(([key, value]) => (
                  <tr key={key}>
                    <td className="text-muted" style={{ width: '35%' }}>
                      {key}
                    </td>
                    <td>
                      {typeof value === 'object' ? (
                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        <div className="mt-4 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>Note:</strong> Sensitive fields (tokens, passwords, IP addresses) are
            intentionally hidden from this view for security purposes.
          </small>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default AuditDetailDrawer
