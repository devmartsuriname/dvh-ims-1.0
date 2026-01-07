/**
 * Status Lookup Form Component
 * Phase 5 - Checkpoint 6
 */

import { useState } from 'react'
import { Card, CardBody, Form, Button, Alert, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { validateReferenceNumber, validateToken, MIN_TOKEN_LENGTH } from '../constants'

interface StatusFormProps {
  onSubmit: (referenceNumber: string, accessToken: string) => void
  isLoading: boolean
  error: string | null
}

const StatusForm = ({ onSubmit, isLoading, error }: StatusFormProps) => {
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
      errors.referenceNumber = 'Reference number is required'
    } else if (!validateReferenceNumber(referenceNumber.trim().toUpperCase())) {
      errors.referenceNumber = 'Invalid format. Use BS-YYYY-NNNNNN or WR-YYYY-NNNNNN'
    }
    
    if (!accessToken.trim()) {
      errors.accessToken = 'Access token is required'
    } else if (!validateToken(accessToken.trim())) {
      errors.accessToken = `Access token must be at least ${MIN_TOKEN_LENGTH} characters`
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
          <h4 className="mt-3 mb-1 fw-bold">Check Application Status</h4>
          <p className="text-muted mb-0">
            Enter your reference number and access token to view your application status
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
              Reference Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., BS-2026-123456 or WR-2026-789012"
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
              Your reference number was provided when you submitted your application
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">
              Access Token <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your 12-character access token"
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
              The access token was shown once when your application was submitted
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
                  <span>Checking Status...</span>
                </>
              ) : (
                <>
                  <IconifyIcon icon="mingcute:search-line" />
                  <span>Check Status</span>
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
