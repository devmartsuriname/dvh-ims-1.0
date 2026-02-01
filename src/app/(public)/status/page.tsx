/**
 * Status Tracker Page
 * Phase 5B - Full NL localization
 * 
 * Public page for citizens to check their application status
 * using reference number and access token.
 * 
 * Uses shared PublicHeader/PublicFooter for Darkone 1:1 parity.
 * NO breadcrumb per CP6 requirements.
 * i18n enabled - NL default
 */

import { useState } from 'react'
import { Container, Card, CardBody, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [result, setResult] = useState<StatusLookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Maps technical errors to citizen-safe messages
   * No internal error details are exposed to users
   */
  const getSafeErrorMessage = (response: any, error: any): string => {
    // Network/offline detection
    if (!navigator.onLine || error?.message?.toLowerCase().includes('fetch')) {
      return t('errors.networkError')
    }
    
    const status = response?.error?.status
    const errorStr = response?.data?.error || response?.error?.message || ''
    
    // Rate limiting
    if (status === 429 || errorStr.toLowerCase().includes('too many')) {
      return t('errors.rateLimited')
    }
    
    // Invalid credentials (specific to status lookup)
    if (status === 401 || errorStr.toLowerCase().includes('invalid') || errorStr.toLowerCase().includes('not found')) {
      return t('errors.invalidCredentials')
    }
    
    // Server errors
    if (status >= 500) {
      return t('errors.serverError')
    }
    
    // Generic fallback
    return t('errors.statusLookupFailed')
  }

  /**
   * Handle status lookup via Edge Function
   */
  const handleLookup = async (referenceNumber: string, accessToken: string) => {
    setLookupState('loading')
    setError(null)
    let response: any = null

    try {
      response = await supabase.functions.invoke('lookup-public-status', {
        body: { reference_number: referenceNumber, access_token: accessToken }
      })

      if (response.error) throw new Error('lookup_failed')
      if (!response.data?.success) throw new Error('lookup_failed')

      setResult(response.data as StatusLookupResponse)
      setLookupState('success')
    } catch (err: any) {
      setError(getSafeErrorMessage(response, err))
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
                <span>{t('status.help.text')}</span>
              </p>
              <Link to="/">
                <Button 
                  variant="outline-secondary" 
                  className="d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <IconifyIcon icon="mingcute:arrow-left-line" />
                  <span>{t('status.help.backToHome')}</span>
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
