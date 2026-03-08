/**
 * Shared structured logger for Edge Functions.
 * Phase 8C — Observability & Monitoring
 *
 * Features:
 * - Single-line JSON output (searchable in Supabase logs)
 * - PII scrubbing (email/phone patterns removed from messages)
 * - Conditional Sentry forwarding (ERROR level, when SENTRY_DSN is present)
 * - Factory pattern with auto-attached correlation ID
 *
 * Usage:
 *   const log = createLogger('my-function', crypto.randomUUID())
 *   log.info('request_started', { http_method: 'POST' })
 *   log.error('db_insert_failed', { step: 'person_insert', error_code: 'DB_CONSTRAINT' })
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  function_name: string
  event: string
  correlation_id?: string
  error_code?: string
  metadata?: Record<string, string | number | boolean | null>
  timestamp: string
}

/** Scrub potential PII patterns from a message string */
function scrubMessage(msg: string): string {
  if (!msg) return msg
  // Truncate to 200 chars
  let cleaned = msg.length > 200 ? msg.substring(0, 200) + '…' : msg
  // Remove email patterns
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
  // Remove phone patterns (7+ digits with optional separators)
  cleaned = cleaned.replace(/(\+?\d[\d\s\-().]{6,}\d)/g, '[PHONE]')
  // Remove national ID-like patterns (sequences of 6+ digits)
  cleaned = cleaned.replace(/\b\d{6,}\b/g, '[ID]')
  return cleaned
}

export interface Logger {
  info(event: string, metadata?: Record<string, string | number | boolean | null>): void
  warn(event: string, metadata?: Record<string, string | number | boolean | null>): void
  error(event: string, metadata?: Record<string, string | number | boolean | null>, errorCode?: string): void
}

/**
 * POST error to Sentry via HTTP envelope API.
 * Only called when SENTRY_DSN is present. Fire-and-forget.
 */
async function forwardToSentry(entry: LogEntry): Promise<void> {
  try {
    const dsn = Deno.env.get('SENTRY_DSN')
    if (!dsn) return

    // Parse DSN: https://<key>@<host>/<project_id>
    const dsnUrl = new URL(dsn)
    const publicKey = dsnUrl.username
    const projectId = dsnUrl.pathname.replace('/', '')
    const host = dsnUrl.hostname

    const envelopeUrl = `https://${host}/api/${projectId}/envelope/`

    const eventId = crypto.randomUUID().replace(/-/g, '')
    const timestamp = new Date().toISOString()

    const envelopeHeader = JSON.stringify({
      event_id: eventId,
      dsn,
      sent_at: timestamp,
    })

    const itemHeader = JSON.stringify({ type: 'event' })

    const eventPayload = JSON.stringify({
      event_id: eventId,
      timestamp,
      level: 'error',
      platform: 'other',
      server_name: entry.function_name,
      environment: 'production',
      tags: {
        function_name: entry.function_name,
        event: entry.event,
        ...(entry.error_code ? { error_code: entry.error_code } : {}),
        ...(entry.correlation_id ? { correlation_id: entry.correlation_id } : {}),
      },
      message: {
        formatted: `[${entry.function_name}] ${entry.event}${entry.error_code ? ` (${entry.error_code})` : ''}`,
      },
      extra: entry.metadata || {},
    })

    const envelope = `${envelopeHeader}\n${itemHeader}\n${eventPayload}`

    await fetch(envelopeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=edge-logger/1.0, sentry_key=${publicKey}`,
      },
      body: envelope,
    })
  } catch {
    // Sentry forwarding is best-effort — never break the function
  }
}

/**
 * Create a structured logger for an Edge Function request.
 *
 * @param functionName - The Edge Function name (e.g. 'lookup-public-status')
 * @param correlationId - Optional correlation ID; auto-generated if not provided
 */
export function createLogger(functionName: string, correlationId?: string): Logger {
  const corrId = correlationId || crypto.randomUUID()

  function emit(level: LogLevel, event: string, metadata?: Record<string, string | number | boolean | null>, errorCode?: string): void {
    const entry: LogEntry = {
      level,
      function_name: functionName,
      event,
      correlation_id: corrId,
      timestamp: new Date().toISOString(),
    }

    if (errorCode) {
      entry.error_code = errorCode
    }

    if (metadata) {
      // Scrub any string values in metadata that might contain PII
      const safeMeta: Record<string, string | number | boolean | null> = {}
      for (const [key, value] of Object.entries(metadata)) {
        if (typeof value === 'string') {
          safeMeta[key] = scrubMessage(value)
        } else {
          safeMeta[key] = value
        }
      }
      entry.metadata = safeMeta
    }

    const line = JSON.stringify(entry)

    switch (level) {
      case 'info':
        console.log(line)
        break
      case 'warn':
        console.warn(line)
        break
      case 'error':
        console.error(line)
        // Fire-and-forget Sentry forwarding for errors
        forwardToSentry(entry).catch(() => {})
        break
    }
  }

  return {
    info: (event, metadata) => emit('info', event, metadata),
    warn: (event, metadata) => emit('warn', event, metadata),
    error: (event, metadata, errorCode) => emit('error', event, metadata, errorCode),
  }
}
