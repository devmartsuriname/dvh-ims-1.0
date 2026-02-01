/**
 * Status Result Component
 * Phase 5B - Full NL localization
 * i18n enabled - NL default
 */

import { Card, CardBody, Button, Row, Col, Badge } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import StatusTimeline from './StatusTimeline'
import { STATUS_CONFIG } from '../constants'
import type { StatusLookupResponse } from '../types'

interface StatusResultProps {
  result: StatusLookupResponse
  onReset: () => void
}

const StatusResult = ({ result, onReset }: StatusResultProps) => {
  const { t, i18n } = useTranslation()
  const statusConfig = STATUS_CONFIG[result.current_status] || STATUS_CONFIG.submitted
  const locale = i18n.language === 'nl' ? 'nl-NL' : 'en-US'
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getApplicationTypeLabel = (): string => {
    return result.application_type === 'bouwsubsidie' 
      ? t('status.applicationTypes.bouwsubsidie')
      : t('status.applicationTypes.housing_registration')
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
              <h5 className="mb-1 fw-bold">{t('status.result.foundTitle')}</h5>
              <p className="mb-0 text-muted">
                {t('status.result.foundText')}
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
            {t('status.result.applicationDetails')}
          </h5>
          
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">{t('status.result.applicationType')}</small>
                <span className="fw-medium">{getApplicationTypeLabel()}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">{t('status.result.referenceNumber')}</small>
                <span className="fw-medium font-monospace">{result.reference_number}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">{t('status.result.applicantName')}</small>
                <span className="fw-medium">{result.applicant_name}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">{t('status.result.submittedOn')}</small>
                <span className="fw-medium">{formatDate(result.submitted_at)}</span>
              </div>
            </Col>
          </Row>

          {/* Current Status */}
          <div className="mt-3 p-3 bg-light rounded-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <small className="text-muted d-block mb-1">{t('status.result.currentStatus')}</small>
                <Badge 
                  bg={statusConfig.variant} 
                  className="d-inline-flex align-items-center gap-1 px-3 py-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <IconifyIcon icon={statusConfig.icon} />
                  {t(statusConfig.labelKey)}
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
            {t('status.result.statusHistory')}
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
          {t('status.result.checkAnother')}
        </Button>
      </div>
    </div>
  )
}

export default StatusResult
