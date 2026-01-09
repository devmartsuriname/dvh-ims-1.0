import { Row, Col, Form, Button } from 'react-bootstrap'
import Flatpickr from 'react-flatpickr'
import type { AuditEventFilters } from '@/hooks/useAuditEvents'

interface AuditLogFiltersProps {
  filters: AuditEventFilters
  onFiltersChange: (filters: AuditEventFilters) => void
  distinctActions: string[]
  distinctEntityTypes: string[]
}

const AuditLogFilters = ({
  filters,
  onFiltersChange,
  distinctActions,
  distinctEntityTypes,
}: AuditLogFiltersProps) => {
  const handleDateFromChange = (dates: Date[]) => {
    const date = dates[0]
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString() : undefined,
    })
  }

  const handleDateToChange = (dates: Date[]) => {
    const date = dates[0]
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
    })
  }

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      action: e.target.value || undefined,
    })
  }

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      entityType: e.target.value || undefined,
    })
  }

  const handleActorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      actor: e.target.value || undefined,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  return (
    <div className="mb-4">
      <Row className="g-3">
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-muted">From Date</Form.Label>
            <Flatpickr
              className="form-control form-control-sm"
              placeholder="Select date..."
              value={filters.dateFrom}
              onChange={handleDateFromChange}
              options={{
                dateFormat: 'd-m-Y',
                allowInput: true,
              }}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-muted">To Date</Form.Label>
            <Flatpickr
              className="form-control form-control-sm"
              placeholder="Select date..."
              value={filters.dateTo}
              onChange={handleDateToChange}
              options={{
                dateFormat: 'd-m-Y',
                allowInput: true,
              }}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-muted">Action</Form.Label>
            <Form.Select
              size="sm"
              value={filters.action || ''}
              onChange={handleActionChange}
            >
              <option value="">All Actions</option>
              {distinctActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-muted">Entity Type</Form.Label>
            <Form.Select
              size="sm"
              value={filters.entityType || ''}
              onChange={handleEntityTypeChange}
            >
              <option value="">All Entities</option>
              {distinctEntityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label className="small text-muted">Actor (ID)</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="Search..."
              value={filters.actor || ''}
              onChange={handleActorChange}
            />
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          {hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleClearFilters}
              className="w-100"
            >
              Clear Filters
            </Button>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default AuditLogFilters
