/**
 * Status Tracking Constants
 * Phase 5 - Checkpoint 6
 */

import type { StatusLookupResponse } from './types'

// Reference number patterns
export const REFERENCE_PATTERNS = {
  bouwsubsidie: /^BS-\d{4}-\d{6}$/,
  housing_registration: /^WR-\d{4}-\d{6}$/,
}

// Minimum token length
export const MIN_TOKEN_LENGTH = 12

// Status definitions with colors
export const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: string }> = {
  submitted: {
    label: 'Submitted',
    variant: 'info',
    icon: 'mingcute:file-check-line',
  },
  under_review: {
    label: 'Under Review',
    variant: 'warning',
    icon: 'mingcute:eye-line',
  },
  pending_documents: {
    label: 'Pending Documents',
    variant: 'warning',
    icon: 'mingcute:folder-open-line',
  },
  approved: {
    label: 'Approved',
    variant: 'success',
    icon: 'mingcute:check-circle-line',
  },
  rejected: {
    label: 'Rejected',
    variant: 'danger',
    icon: 'mingcute:close-circle-line',
  },
  waitlisted: {
    label: 'Waitlisted',
    variant: 'secondary',
    icon: 'mingcute:time-line',
  },
}

// Mock data for demonstration
export const MOCK_BOUWSUBSIDIE_RESULT: StatusLookupResponse = {
  application_type: 'bouwsubsidie',
  reference_number: 'BS-2026-123456',
  applicant_name: 'Jan Jansen',
  submitted_at: '2026-01-05T14:30:00Z',
  current_status: 'under_review',
  current_status_label: 'Under Review',
  status_history: [
    {
      status: 'submitted',
      status_label: 'Submitted',
      timestamp: '2026-01-05T14:30:00Z',
      description: 'Application successfully submitted',
    },
    {
      status: 'under_review',
      status_label: 'Under Review',
      timestamp: '2026-01-06T09:15:00Z',
      description: 'Application is being reviewed by a case officer',
    },
  ],
}

export const MOCK_HOUSING_RESULT: StatusLookupResponse = {
  application_type: 'housing_registration',
  reference_number: 'WR-2026-789012',
  applicant_name: 'Maria Pengel',
  submitted_at: '2026-01-03T10:00:00Z',
  current_status: 'waitlisted',
  current_status_label: 'Waitlisted',
  status_history: [
    {
      status: 'submitted',
      status_label: 'Submitted',
      timestamp: '2026-01-03T10:00:00Z',
      description: 'Registration successfully submitted',
    },
    {
      status: 'under_review',
      status_label: 'Under Review',
      timestamp: '2026-01-04T08:30:00Z',
      description: 'Registration is being verified',
    },
    {
      status: 'waitlisted',
      status_label: 'Waitlisted',
      timestamp: '2026-01-05T11:45:00Z',
      description: 'Added to housing waiting list at position #142',
    },
  ],
}

// Validation helpers
export const validateReferenceNumber = (value: string): boolean => {
  return REFERENCE_PATTERNS.bouwsubsidie.test(value) || REFERENCE_PATTERNS.housing_registration.test(value)
}

export const getApplicationType = (reference: string): 'bouwsubsidie' | 'housing_registration' | null => {
  if (REFERENCE_PATTERNS.bouwsubsidie.test(reference)) return 'bouwsubsidie'
  if (REFERENCE_PATTERNS.housing_registration.test(reference)) return 'housing_registration'
  return null
}

export const validateToken = (value: string): boolean => {
  return value.length >= MIN_TOKEN_LENGTH
}
