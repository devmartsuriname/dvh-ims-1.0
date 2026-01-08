/**
 * Status Lookup Form Component
 * Phase 9B-3: Neonwizard visual language restyle
 * NO logic changes - visual only
 */

import { useState } from 'react'
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
    <div className="status-form-card">
      {/* Icon Badge */}
      <div className="form-icon-badge">
        <IconifyIcon 
          icon="mingcute:search-line" 
          className="badge-icon"
        />
      </div>

      <h2 className="form-title">Check Application Status</h2>
      <p className="form-subtitle">
        Enter your reference number and access token to view your application status
      </p>

      {/* Error Alert */}
      {error && (
        <div className="status-alert status-alert-error">
          <IconifyIcon icon="mingcute:warning-line" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-inner-area status-form">
        {/* Reference Number Field */}
        <div className="form-field">
          <label className="form-label">
            Reference Number <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., BS-2026-123456 or WR-2026-789012"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
            disabled={isLoading}
            className={`form-input ${validationErrors.referenceNumber ? 'input-error' : ''}`}
          />
          {validationErrors.referenceNumber && (
            <span className="field-error">{validationErrors.referenceNumber}</span>
          )}
          <span className="field-hint">
            Your reference number was provided when you submitted your application
          </span>
        </div>

        {/* Access Token Field */}
        <div className="form-field">
          <label className="form-label">
            Access Token <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your 12-character access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            disabled={isLoading}
            className={`form-input monospace ${validationErrors.accessToken ? 'input-error' : ''}`}
          />
          {validationErrors.accessToken && (
            <span className="field-error">{validationErrors.accessToken}</span>
          )}
          <span className="field-hint">
            The access token was shown once when your application was submitted
          </span>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="status-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <IconifyIcon icon="mingcute:search-line" />
                <span>Check Status</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StatusForm