/**
 * Sentry initialization for DVH-IMS frontend.
 * 
 * Conditional: Only initializes when VITE_SENTRY_DSN is defined.
 * PII Protection: beforeSend scrubber strips citizen data, tokens, and form values.
 * 
 * Phase 8B — Observability & Monitoring
 */
import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

/** Whether Sentry is active in this environment */
export const isSentryEnabled = Boolean(SENTRY_DSN)

/**
 * PII scrubber — strips sensitive data before sending to Sentry.
 * Removes: request bodies, form data, URL query params with "token".
 */
function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  // Strip request body / form data
  if (event.request) {
    delete event.request.data
    delete event.request.cookies

    // Strip token-related query params from URL
    if (event.request.url) {
      try {
        const url = new URL(event.request.url)
        const paramsToRemove: string[] = []
        url.searchParams.forEach((_value, key) => {
          if (key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
            paramsToRemove.push(key)
          }
        })
        paramsToRemove.forEach((key) => url.searchParams.delete(key))
        event.request.url = url.toString()
      } catch {
        // If URL parsing fails, keep original
      }
    }

    // Strip query string separately if present
    if (event.request.query_string) {
      const qs = event.request.query_string
      if (typeof qs === 'string' && (qs.includes('token') || qs.includes('secret'))) {
        event.request.query_string = '[REDACTED]'
      }
    }
  }

  // Strip breadcrumb data that may contain PII
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
        if (breadcrumb.data) {
          delete breadcrumb.data.requestBody
          delete breadcrumb.data.responseBody
        }
      }
      return breadcrumb
    })
  }

  return event
}

/**
 * Initialize Sentry. Safe to call even when DSN is not configured — it will no-op.
 */
export function initSentry(): void {
  if (!isSentryEnabled) {
    console.info('[Sentry] DSN not configured — monitoring disabled.')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.PROD ? 'production' : 'preview',
    
    // Performance: sample 10% of transactions
    tracesSampleRate: 0.1,

    // Session replay disabled — PII risk
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // PII scrubber
    beforeSend,

    // IP address scrubbing (client-side hint to server)
    sendDefaultPii: false,

    // Only send errors from our origin
    allowUrls: [
      /lovable\.app/,
      /volkshuisvesting\.sr/,
    ],

    // Ignore common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'Load failed',
      'Failed to fetch',
    ],
  })

  console.info('[Sentry] Initialized for environment:', import.meta.env.PROD ? 'production' : 'preview')
}

/**
 * Capture an exception with optional context.
 * No-ops when Sentry is not initialized.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}

/**
 * Capture a message with optional severity.
 * No-ops when Sentry is not initialized.
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!isSentryEnabled) return
  Sentry.captureMessage(message, level)
}
