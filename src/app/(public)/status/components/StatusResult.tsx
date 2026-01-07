/**
 * Status Result Component
 * Phase 5 - Checkpoint 6
 */

import { Card, CardBody, Button, Row, Col, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import StatusTimeline from './StatusTimeline'
import { STATUS_CONFIG } from '../constants'
import type { StatusLookupResponse } from '../types'

interface StatusResultProps {
  result: StatusLookupResponse
  onReset: () => void
}

const StatusResult = ({ result, onReset }: StatusResultProps) => {
  const statusConfig = STATUS_CONFIG[result.current_status] || STATUS_CONFIG.submitted
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getApplicationTypeLabel = (): string => {
    return result.application_type === 'bouwsubsidie' 
      ? 'Building Subsidy (Bouwsubsidie)'
      : 'Housing Registration'
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Success Header */}
      <Card className="border-0 shadow-sm border-start border-4 border-success">
        <CardBody className="p-4">
          <div className="d-flex align-items-start gap-3">
            <span 
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 flex-shrink-0" 
              style={{ width: 48, height: 48 }}
            >
              <IconifyIcon 
                icon="mingcute:check-circle-line" 
                className="text-success"
                style={{ fontSize: '1.5rem' }}
              />
            </span>
            <div>
              <h5 className="mb-1 fw-bold">Application Found</h5>
              <p className="mb-0 text-muted">
                Here is the current status of your application
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Application Details */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <IconifyIcon icon="mingcute:document-line" className="text-primary" />
            Application Details
          </h5>
          
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Application Type</small>
                <span className="fw-medium">{getApplicationTypeLabel()}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Reference Number</small>
                <span className="fw-medium font-monospace">{result.reference_number}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Applicant Name</small>
                <span className="fw-medium">{result.applicant_name}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Submitted On</small>
                <span className="fw-medium">{formatDate(result.submitted_at)}</span>
              </div>
            </Col>
          </Row>

          {/* Current Status */}
          <div className="mt-3 p-3 bg-light rounded-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <small className="text-muted d-block mb-1">Current Status</small>
                <Badge 
                  bg={statusConfig.variant} 
                  className="d-inline-flex align-items-center gap-1 px-3 py-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <IconifyIcon icon={statusConfig.icon} />
                  {result.current_status_label}
                </Badge>
              </div>
              <IconifyIcon 
                icon={statusConfig.icon} 
                className={`text-${statusConfig.variant}`}
                style={{ fontSize: '2.5rem', opacity: 0.5 }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Status History Timeline */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <IconifyIcon icon="mingcute:time-line" className="text-primary" />
            Status History
          </h5>
          
          <StatusTimeline history={result.status_history} />
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="text-center">
        <Button 
          variant="outline-secondary" 
          onClick={onReset}
          className="d-inline-flex align-items-center gap-2"
        >
          <IconifyIcon icon="mingcute:refresh-2-line" />
          Check Another Application
        </Button>
      </div>
    </div>
  )
}

export default StatusResult
