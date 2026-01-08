/**
 * Status Tracker Page
 * Phase 9B-3: Restyled with Neonwizard visual language
 * 
 * Public page for citizens to check their application status
 * using reference number and access token.
 * 
 * Visual-only restyle - NO logic changes
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import StatusForm from './components/StatusForm'
import StatusResult from './components/StatusResult'
import { 
  getApplicationType, 
  MOCK_BOUWSUBSIDIE_RESULT, 
  MOCK_HOUSING_RESULT 
} from './constants'
import type { LookupState, StatusLookupResponse } from './types'
import '@/assets/scss/neonwizard/style.scss'

/**
 * Main Status Tracker Page Component
 */
const StatusTrackerPage = () => {
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [result, setResult] = useState<StatusLookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle status lookup (mock implementation)
   */
  const handleLookup = (referenceNumber: string, accessToken: string) => {
    setLookupState('loading')
    setError(null)

    // Simulate API call with delay
    setTimeout(() => {
      const applicationType = getApplicationType(referenceNumber)
      
      if (!applicationType) {
        setError('Invalid reference number format')
        setLookupState('error')
        return
      }

      // Mock: For demonstration, return mock data based on application type
      // In production, this would call the Edge Function
      const mockResult = applicationType === 'bouwsubsidie' 
        ? { ...MOCK_BOUWSUBSIDIE_RESULT, reference_number: referenceNumber }
        : { ...MOCK_HOUSING_RESULT, reference_number: referenceNumber }

      setResult(mockResult)
      setLookupState('success')
    }, 1500)
  }

  /**
   * Reset to initial form state
   */
  const handleReset = () => {
    setLookupState('idle')
    setResult(null)
    setError(null)
  }

  return (
    <div className="neonwizard-scope status-page">
      <div className="wrapper status-wrapper">
        {/* Header Banner */}
        <div className="status-header">
          <div className="status-header-content">
            <h1>Application Status</h1>
            <p>Track your Bouwsubsidie or Housing Registration application</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="status-content">
          {/* Conditional Rendering based on state */}
          {lookupState === 'success' && result ? (
            <StatusResult result={result} onReset={handleReset} />
          ) : (
            <StatusForm 
              onSubmit={handleLookup}
              isLoading={lookupState === 'loading'}
              error={error}
            />
          )}

          {/* Help & Navigation Footer */}
          <div className="status-help-card">
            <p className="help-text">
              <IconifyIcon icon="mingcute:question-line" className="help-icon" />
              <span>Need help? Contact the Ministry of Social Affairs and Housing</span>
            </p>
            <Link to="/" className="back-link">
              <IconifyIcon icon="mingcute:arrow-left-line" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusTrackerPage