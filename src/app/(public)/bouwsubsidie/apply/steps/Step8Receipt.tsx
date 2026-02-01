import { Card, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { SubmissionResult } from '../types'

interface Step8ReceiptProps {
  result: SubmissionResult | null
}

/**
 * Step 8: Receipt
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Displays case reference number, access token, and next steps.
 */
const Step8Receipt = ({ result }: Step8ReceiptProps) => {
  const { t, i18n } = useTranslation()

  if (!result) {
    return null
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(result.reference_number)
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(result.access_token)
  }

  // Format date according to current language
  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'nl' ? 'nl-SR' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const locale = i18n.language === 'nl' ? 'nl-SR' : 'en-US'
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div 
        className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
        style={{ width: 80, height: 80 }}
      >
        <IconifyIcon icon="mingcute:check-circle-fill" className="text-success" style={{ fontSize: 48 }} />
      </div>

      <h3 className="fw-bold mb-2">{t('bouwsubsidie.step8.successTitle')}</h3>
      <p className="text-muted mb-4">
        {t('bouwsubsidie.step8.successText')}
      </p>

      {/* Reference Number Card */}
      <Card className="mb-3">
        <Card.Body className="py-4">
          <h6 className="text-muted mb-2">{t('bouwsubsidie.step8.referenceNumber')}</h6>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <h2 className="mb-0 font-monospace text-primary">{result.reference_number}</h2>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleCopyReference}
              title={t('common.copy')}
            >
              <IconifyIcon icon="mingcute:copy-line" />
            </Button>
          </div>
          <p className="text-muted small mb-0">
            {t('bouwsubsidie.step8.referenceNumberHelp')}
          </p>
        </Card.Body>
      </Card>

      {/* Access Token Card */}
      <Card className="mb-4 border-warning">
        <Card.Header className="bg-warning bg-opacity-10 border-warning">
          <div className="d-flex align-items-center justify-content-center">
            <IconifyIcon icon="mingcute:key-2-line" className="text-warning me-2" />
            <span className="fw-semibold">{t('bouwsubsidie.step8.securityToken')}</span>
          </div>
        </Card.Header>
        <Card.Body className="py-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <code className="fs-5 bg-light px-3 py-2 rounded">{result.access_token}</code>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleCopyToken}
              title={t('common.copy')}
            >
              <IconifyIcon icon="mingcute:copy-line" />
            </Button>
          </div>
          <div className="bg-warning bg-opacity-10 rounded p-3 mt-3">
            <p className="text-warning mb-0 small">
              <IconifyIcon icon="mingcute:warning-line" className="me-1" />
              <strong>!</strong> {t('bouwsubsidie.step8.securityTokenWarning')}
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Submission Details */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="text-start">
            <Col xs={6}>
              <p className="text-muted small mb-1">{t('bouwsubsidie.step8.submittedOn')}</p>
              <p className="fw-medium mb-0">{formatDate(result.submitted_at)}</p>
            </Col>
            <Col xs={6}>
              <p className="text-muted small mb-1">{t('bouwsubsidie.step8.time')}</p>
              <p className="fw-medium mb-0">{formatTime(result.submitted_at)}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Next Steps */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0 fw-semibold">{t('bouwsubsidie.step8.nextStepsTitle')}</h6>
        </Card.Header>
        <Card.Body className="text-start">
          <div className="d-flex mb-3">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">1</span>
            </div>
            <div>
              <p className="fw-medium mb-1">{t('bouwsubsidie.step8.nextStep1Title')}</p>
              <p className="text-muted small mb-0">{t('bouwsubsidie.step8.nextStep1Text')}</p>
            </div>
          </div>
          <div className="d-flex mb-3">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">2</span>
            </div>
            <div>
              <p className="fw-medium mb-1">{t('bouwsubsidie.step8.nextStep2Title')}</p>
              <p className="text-muted small mb-0">{t('bouwsubsidie.step8.nextStep2Text')}</p>
            </div>
          </div>
          <div className="d-flex">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">3</span>
            </div>
            <div>
              <p className="fw-medium mb-1">{t('bouwsubsidie.step8.nextStep3Title')}</p>
              <p className="text-muted small mb-0">{t('bouwsubsidie.step8.nextStep3Text')}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
        <Button variant="outline-primary" onClick={handlePrint}>
          <IconifyIcon icon="mingcute:printer-line" className="me-2" />
          {t('common.print')}
        </Button>
        <Link to="/status" className="btn btn-outline-secondary">
          <IconifyIcon icon="mingcute:search-line" className="me-2" />
          {t('common.checkStatus')}
        </Link>
        <Link to="/" className="btn btn-primary">
          <IconifyIcon icon="mingcute:home-4-line" className="me-2" />
          {t('common.returnHome')}
        </Link>
      </div>
    </div>
  )
}

export default Step8Receipt
