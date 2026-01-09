import { useState } from 'react'
import { Card, Table, Badge, Pagination, Spinner } from 'react-bootstrap'
import { useAuditEvents, type AuditEventFilters, type AuditEvent } from '@/hooks/useAuditEvents'
import AuditLogFilters from './AuditLogFilters'
import AuditDetailDrawer from './AuditDetailDrawer'
import AuditExportButton from './AuditExportButton'
import { format } from 'date-fns'

const AuditLogTable = () => {
  const [filters, setFilters] = useState<AuditEventFilters>({})
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)

  const {
    events,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    setPage,
    distinctActions,
    distinctEntityTypes,
  } = useAuditEvents(filters)

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleRowClick = (event: AuditEvent) => {
    setSelectedEvent(event)
    setShowDrawer(true)
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
      case 'LOGIN':
        return 'primary'
      case 'LOGOUT':
        return 'secondary'
      default:
        return 'light'
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'dd-MM-yyyy HH:mm:ss')
    } catch {
      return timestamp
    }
  }

  const truncateId = (id: string | null): string => {
    if (!id) return '-'
    return id.length > 8 ? `${id.substring(0, 8)}...` : id
  }

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []
    const maxVisible = 5
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => setPage(i)}
        >
          {i}
        </Pagination.Item>
      )
    }

    return items
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Audit Events</h5>
          <AuditExportButton events={events} filters={filters} />
        </Card.Header>
        <Card.Body>
          <AuditLogFilters
            filters={filters}
            onFiltersChange={setFilters}
            distinctActions={distinctActions}
            distinctEntityTypes={distinctEntityTypes}
          />

          {loading && (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="table-responsive">
                <Table hover className="table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Record ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No audit events found
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr
                          key={event.id}
                          onClick={() => handleRowClick(event)}
                          style={{ cursor: 'pointer' }}
                          className="audit-row"
                        >
                          <td>
                            <small className="text-muted">
                              {formatTimestamp(event.occurred_at)}
                            </small>
                          </td>
                          <td>{event.actor_name || 'System'}</td>
                          <td>
                            {event.actor_role ? (
                              <Badge bg="secondary" className="text-uppercase">
                                {event.actor_role.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={getActionBadgeVariant(event.action)}>
                              {event.action}
                            </Badge>
                          </td>
                          <td>{event.entity_type}</td>
                          <td>
                            <code className="small">{truncateId(event.entity_id)}</code>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, totalCount)} of {totalCount} events
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.First
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                    />
                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    />
                    {getPaginationItems()}
                    <Pagination.Next
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    />
                    <Pagination.Last
                      disabled={page === totalPages}
                      onClick={() => setPage(totalPages)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <AuditDetailDrawer
        event={selectedEvent}
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
      />
    </>
  )
}

export default AuditLogTable
