/**
 * Shared status badge constants for the DVH-IMS admin UI.
 *
 * These constants were extracted from duplicate definitions across multiple
 * admin pages. Each badge maps a database status value to a Bootstrap badge
 * color and a human-readable label.
 *
 * Usage:
 *   import { HOUSING_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
 *   import { SUBSIDY_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
 *   import { VISIT_TYPE_BADGES, DECISION_BADGES } from '@/constants/statusBadges'
 *   import { ALLOCATION_RUN_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
 */

/** Housing registration workflow statuses */
export const HOUSING_STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  under_review: { bg: 'info', label: 'Under Review' },
  urgency_assessed: { bg: 'primary', label: 'Urgency Assessed' },
  waiting_list: { bg: 'warning', label: 'Waiting List' },
  matched: { bg: 'success', label: 'Matched' },
  allocated: { bg: 'dark', label: 'Allocated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

/** Full subsidy case (bouwsubsidie) workflow statuses */
export const SUBSIDY_STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  in_social_review: { bg: 'info', label: 'In Social Review' },
  social_completed: { bg: 'primary', label: 'Social Completed' },
  returned_to_intake: { bg: 'warning', label: 'Returned to Intake' },
  in_technical_review: { bg: 'info', label: 'In Technical Review' },
  technical_approved: { bg: 'success', label: 'Technical Approved' },
  returned_to_social: { bg: 'warning', label: 'Returned to Social' },
  in_admin_review: { bg: 'info', label: 'In Admin Review' },
  admin_complete: { bg: 'success', label: 'Admin Complete' },
  returned_to_technical: { bg: 'warning', label: 'Returned to Technical' },
  screening: { bg: 'info', label: 'Screening' },
  needs_more_docs: { bg: 'warning', label: 'Needs More Docs' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
  awaiting_director_approval: { bg: 'info', label: 'Awaiting Director Approval' },
  director_approved: { bg: 'success', label: 'Director Approved' },
  returned_to_screening: { bg: 'warning', label: 'Returned to Screening' },
  in_ministerial_advice: { bg: 'info', label: 'In Ministerial Advice' },
  ministerial_advice_complete: { bg: 'success', label: 'Advice Complete' },
  returned_to_director: { bg: 'warning', label: 'Returned to Director' },
  awaiting_minister_decision: { bg: 'info', label: 'Awaiting Minister Decision' },
  minister_approved: { bg: 'success', label: 'Minister Approved' },
  returned_to_advisor: { bg: 'warning', label: 'Returned to Advisor' },
  approved_for_council: { bg: 'success', label: 'Approved for Council' },
  council_doc_generated: { bg: 'dark', label: 'Council Doc Generated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

/** Field visit types (social, technical, follow-up) */
export const VISIT_TYPE_BADGES: Record<string, { bg: string; label: string }> = {
  social: { bg: 'info', label: 'Social' },
  technical: { bg: 'warning', label: 'Technical' },
  follow_up: { bg: 'secondary', label: 'Follow-up' },
}

/** Allocation decision outcomes */
export const DECISION_BADGES: Record<string, string> = {
  approved: 'success',
  rejected: 'danger',
  deferred: 'warning',
}

/** Allocation run execution statuses */
export const ALLOCATION_RUN_STATUS_BADGES: Record<string, string> = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'danger',
}
