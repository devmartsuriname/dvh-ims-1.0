/**
 * Status Lookup Form Component
 * Phase 5B - Full NL localization
 * i18n enabled - NL default
 */

import { useState } from 'react'
import { Card, CardBody, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { validateReferenceNumber, validateToken, MIN_TOKEN_LENGTH } from '../constants'

interface StatusFormProps {
  onSubmit: (referenceNumber: string, accessToken: string) => void
  isLoading: boolean
  error: string | null
}

const StatusForm = ({ onSubmit, isLoading, error }: StatusFormProps) => {
  const { t } = useTranslation()
  const [referenceNumber, setReferenceNumber] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    referenceNumber?: string
    accessToken?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: typeof validationErrors = {}
    
    if (!referenceNumber.trim()) {
      errors.referenceNumber = t('status.validation.referenceRequired')
    } else if (!validateReferenceNumber(referenceNumber.trim().toUpperCase())) {
      errors.referenceNumber = t('status.validation.referenceInvalid')
    }
    
    if (!accessToken.trim()) {
      errors.accessToken = t('status.validation.tokenRequired')
    } else if (!validateToken(accessToken.trim())) {
      errors.accessToken = t('status.validation.tokenMinLength', { min: MIN_TOKEN_LENGTH })
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    setValidationErrors({})
    onSubmit(referenceNumber.trim().toUpperCase(), accessToken.trim())
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="text-center mb-4">
          <span 
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" 
            style={{ width: 64, height: 64 }}
          >
            <IconifyIcon 
              icon="mingcute:search-line" 
              className="text-primary"
              style={{ fontSize: '1.75rem' }}
            />
          </span>
          <h4 className="mt-3 mb-1 fw-bold">{t('status.title')}</h4>
          <p className="text-muted mb-0">
            {t('status.description')}
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <IconifyIcon icon="mingcute:warning-line" />
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">
              {t('status.form.referenceNumber')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t('status.form.referenceNumberPlaceholder')}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
              isInvalid={!!validationErrors.referenceNumber}
              disabled={isLoading}
              className="text-uppercase"
            />
            {validationErrors.referenceNumber && (
              <div className="invalid-feedback d-block">
                {validationErrors.referenceNumber}
              </div>
            )}
            <Form.Text className="text-muted">
              {t('status.form.referenceNumberHelp')}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">
              {t('status.form.accessToken')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t('status.form.accessTokenPlaceholder')}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              isInvalid={!!validationErrors.accessToken}
              disabled={isLoading}
              className="font-monospace"
            />
            {validationErrors.accessToken && (
              <div className="invalid-feedback d-block">
                {validationErrors.accessToken}
              </div>
            )}
            <Form.Text className="text-muted">
              {t('status.form.accessTokenHelp')}
            </Form.Text>
          </Form.Group>

          <div className="d-grid">
            <Button 
              variant="primary" 
              type="submit" 
              size="lg"
              disabled={isLoading}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>{t('status.form.checkingStatus')}</span>
                </>
              ) : (
                <>
                  <IconifyIcon icon="mingcute:search-line" />
                  <span>{t('status.form.checkStatus')}</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default StatusForm
