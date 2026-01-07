/**
 * Status Tracker Page
 * Phase 5 - Checkpoint 6
 * 
 * Public page for citizens to check their application status
 * using reference number and access token.
 */

import { useState } from 'react'
import { Container } from 'react-bootstrap'
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

/**
 * Public Header for Status Page
 */
const PublicHeader = () => (
  <header className="py-3 border-bottom bg-white">
    <Container>
      <div className="d-flex align-items-center gap-3">
        <Link to="/" className="text-decoration-none">
          <img 
            src="/assets/images/logo-dark.png" 
            alt="VolksHuisvesting Logo" 
            height="36" 
          />
        </Link>
        <div>
          <h6 className="mb-0 fw-bold">Application Status</h6>
          <small className="text-muted">VolksHuisvesting Suriname</small>
        </div>
      </div>
    </Container>
  </header>
)

/**
 * Public Footer for Status Page
 */
const PublicFooter = () => (
  <footer className="py-3 border-top bg-white">
    <Container>
      <div className="text-center">
        <small className="text-muted">
          © {new Date().getFullYear()} Ministry of Social Affairs and Housing
        </small>
      </div>
    </Container>
  </footer>
)

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
    <div className="d-flex flex-column min-vh-100" data-bs-theme="light">
      <PublicHeader />

      <main className="flex-grow-1 py-5 bg-light">
        <Container style={{ maxWidth: 700 }}>
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <IconifyIcon icon="mingcute:home-4-line" className="me-1" />
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">Status Tracker</li>
            </ol>
          </nav>

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

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-muted small mb-2">
              <IconifyIcon icon="mingcute:question-line" className="me-1" />
              Need help? Contact the Ministry of Social Affairs and Housing
            </p>
            <Link to="/" className="text-decoration-none small">
              <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
              Back to Home
            </Link>
          </div>
        </Container>
      </main>

      <PublicFooter />
    </div>
  )
}

export default StatusTrackerPage
