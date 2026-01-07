/**
 * Status Tracking Types
 * Phase 5 - Checkpoint 6
 */

export interface StatusLookupRequest {
  reference_number: string
  access_token: string
}

export interface StatusHistoryEntry {
  status: string
  status_label: string
  timestamp: string
  description: string
}

export interface StatusLookupResponse {
  application_type: 'bouwsubsidie' | 'housing_registration'
  reference_number: string
  applicant_name: string
  submitted_at: string
  current_status: string
  current_status_label: string
  status_history: StatusHistoryEntry[]
}

export type LookupState = 'idle' | 'loading' | 'success' | 'error'
