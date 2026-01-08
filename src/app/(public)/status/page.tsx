/**
 * Status Tracker Page
 * Phase 5 - Checkpoint 6
 * 
 * Public page for citizens to check their application status
 * using reference number and access token.
 * 
 * Uses shared PublicHeader/PublicFooter for Darkone 1:1 parity.
 * NO breadcrumb per CP6 requirements.
 */

import { useState } from 'react'
import { Container, Card, CardBody, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'
import StatusForm from './components/StatusForm'
import StatusResult from './components/StatusResult'
import { 
  getApplicationType, 
  MOCK_BOUWSUBSIDIE_RESULT, 
  MOCK_HOUSING_RESULT 
} from './constants'
import type { LookupState, StatusLookupResponse } from './types'

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
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />

      <main className="flex-grow-1 py-5 bg-light">
        <Container style={{ maxWidth: 700 }}>
          {/* NO BREADCRUMB - per CP6 requirements */}

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

          {/* Help & Navigation Card Footer - Darkone 1:1 */}
          <Card className="border-0 shadow-sm mt-4">
            <CardBody className="text-center py-4">
              <p className="text-muted small mb-3 d-flex align-items-center justify-content-center gap-2">
                <IconifyIcon icon="mingcute:question-line" />
                <span>Need help? Contact the Ministry of Social Affairs and Housing</span>
              </p>
              <Link to="/">
                <Button 
                  variant="outline-secondary" 
                  className="d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <IconifyIcon icon="mingcute:arrow-left-line" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Container>
      </main>

      <PublicFooter />
    </div>
  )
}

export default StatusTrackerPage
