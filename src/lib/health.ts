/**
 * Frontend Health Signal — Phase 8D
 * 
 * Emits a one-time `system_ready` event via Sentry on app startup.
 * Conditional: only fires when Sentry is active. No PII, no user data.
 */
import { isSentryEnabled, captureMessage } from './sentry'

let emitted = false

/**
 * Emit system_ready health signal. Safe to call multiple times — only fires once.
 */
export function emitSystemReady(): void {
  if (emitted || !isSentryEnabled) return
  emitted = true
  captureMessage('system_ready', 'info')
}
