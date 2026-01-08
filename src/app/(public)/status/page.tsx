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
import { supabase } from '@/integrations/supabase/client'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'
import StatusForm from './components/StatusForm'
import StatusResult from './components/StatusResult'
import type { LookupState, StatusLookupResponse } from './types'

/**
 * Main Status Tracker Page Component
 */
const StatusTrackerPage = () => {
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [result, setResult] = useState<StatusLookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle status lookup via Edge Function
   */
  const handleLookup = async (referenceNumber: string, accessToken: string) => {
    setLookupState('loading')
    setError(null)

    try {
      const response = await supabase.functions.invoke('lookup-public-status', {
        body: { reference_number: referenceNumber, access_token: accessToken }
      })

      if (response.error) throw new Error(response.error.message)
      if (!response.data?.success) throw new Error(response.data?.error || 'Lookup failed')

      setResult(response.data as StatusLookupResponse)
      setLookupState('success')
    } catch (err: any) {
      setError(err.message || 'Failed to lookup status. Please check your credentials.')
      setLookupState('error')
    }
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
