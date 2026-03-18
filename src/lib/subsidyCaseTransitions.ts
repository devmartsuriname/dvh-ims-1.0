/**
 * Subsidy Case Transition Constants
 *
 * Extracted from src/app/(admin)/subsidy-cases/[id]/page.tsx (Phase 6).
 * These were module-scoped constants in the page component that could not be
 * tested without export. Moving them here is a pure data relocation — zero
 * behavior change. All consuming code imports from this module.
 *
 * DO NOT alter logic, role names, or status names without a governance-approved
 * change that updates the corresponding tests.
 */

import type { AppRole } from '@/hooks/useUserRole'

/**
 * STATUS_TRANSITIONS — subsidy case state machine
 * Maps each current status to the set of statuses it may transition to.
 */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  received: ['in_social_review', 'screening', 'rejected'],
  in_social_review: ['social_completed', 'returned_to_intake', 'rejected'],
  returned_to_intake: ['in_social_review', 'rejected'],
  social_completed: ['in_technical_review', 'rejected'],
  in_technical_review: ['technical_approved', 'returned_to_social', 'rejected'],
  returned_to_social: ['in_social_review', 'rejected'],
  technical_approved: ['in_admin_review', 'rejected'],
  in_admin_review: ['admin_complete', 'returned_to_technical', 'rejected'],
  returned_to_technical: ['in_technical_review', 'rejected'],
  admin_complete: ['screening', 'rejected'],
  screening: ['needs_more_docs', 'fieldwork', 'rejected'],
  needs_more_docs: ['screening', 'rejected'],
  fieldwork: ['awaiting_director_approval', 'rejected'],
  awaiting_director_approval: ['director_approved', 'returned_to_screening', 'rejected'],
  returned_to_screening: ['screening', 'rejected'],
  director_approved: ['in_ministerial_advice', 'rejected'],
  in_ministerial_advice: ['ministerial_advice_complete', 'returned_to_director', 'rejected'],
  returned_to_director: ['awaiting_director_approval', 'rejected'],
  ministerial_advice_complete: ['awaiting_minister_decision', 'rejected'],
  awaiting_minister_decision: ['minister_approved', 'returned_to_advisor', 'rejected'],
  returned_to_advisor: ['in_ministerial_advice', 'rejected'],
  minister_approved: ['approved_for_council', 'rejected'],
  approved_for_council: ['council_doc_generated', 'rejected'],
  council_doc_generated: ['finalized', 'rejected'],
}

/**
 * NEXT_RESPONSIBLE_ROLE — GAP-2 Notification Routing Fix
 * Maps each target status to the role responsible for acting on it.
 * Fallback: 'frontdesk_bouwsubsidie' for any unmapped status.
 */
export const NEXT_RESPONSIBLE_ROLE: Record<string, string> = {
  in_social_review: 'social_field_worker',
  social_completed: 'project_leader',
  returned_to_intake: 'frontdesk_bouwsubsidie',
  in_technical_review: 'technical_inspector',
  technical_approved: 'project_leader',
  returned_to_social: 'social_field_worker',
  in_admin_review: 'admin_staff',
  admin_complete: 'project_leader',
  returned_to_technical: 'technical_inspector',
  screening: 'project_leader',
  needs_more_docs: 'frontdesk_bouwsubsidie',
  fieldwork: 'project_leader',
  awaiting_director_approval: 'director',
  director_approved: 'project_leader',
  returned_to_screening: 'project_leader',
  in_ministerial_advice: 'ministerial_advisor',
  ministerial_advice_complete: 'project_leader',
  returned_to_director: 'director',
  awaiting_minister_decision: 'minister',
  minister_approved: 'project_leader',
  returned_to_advisor: 'ministerial_advisor',
  approved_for_council: 'project_leader',
  council_doc_generated: 'project_leader',
  finalized: 'project_leader',
  rejected: 'project_leader',
}

/**
 * ROLE_ALLOWED_TRANSITIONS — GAP-1 RBAC enforcement
 * Maps each "from_status → to_status" transition to the roles permitted to execute it.
 * system_admin is always allowed (governance fallback) and handled separately.
 */
export const ROLE_ALLOWED_TRANSITIONS: Record<string, Record<string, AppRole[]>> = {
  received: {
    in_social_review: ['frontdesk_bouwsubsidie'],
    screening: ['frontdesk_bouwsubsidie'],
    rejected: ['frontdesk_bouwsubsidie', 'project_leader'],
  },
  in_social_review: {
    social_completed: ['social_field_worker'],
    returned_to_intake: ['social_field_worker'],
    rejected: ['social_field_worker', 'project_leader'],
  },
  returned_to_intake: {
    in_social_review: ['frontdesk_bouwsubsidie'],
    rejected: ['frontdesk_bouwsubsidie', 'project_leader'],
  },
  social_completed: {
    in_technical_review: ['project_leader'],
    rejected: ['project_leader'],
  },
  in_technical_review: {
    technical_approved: ['technical_inspector'],
    returned_to_social: ['technical_inspector'],
    rejected: ['technical_inspector', 'project_leader'],
  },
  returned_to_social: {
    in_social_review: ['social_field_worker'],
    rejected: ['project_leader'],
  },
  technical_approved: {
    in_admin_review: ['project_leader'],
    rejected: ['project_leader'],
  },
  in_admin_review: {
    admin_complete: ['admin_staff'],
    returned_to_technical: ['admin_staff'],
    rejected: ['admin_staff', 'project_leader'],
  },
  returned_to_technical: {
    in_technical_review: ['admin_staff', 'project_leader'],
    rejected: ['project_leader'],
  },
  admin_complete: {
    screening: ['project_leader'],
    rejected: ['project_leader'],
  },
  screening: {
    needs_more_docs: ['frontdesk_bouwsubsidie', 'project_leader'],
    fieldwork: ['project_leader'],
    rejected: ['project_leader'],
  },
  needs_more_docs: {
    screening: ['frontdesk_bouwsubsidie', 'project_leader'],
    rejected: ['project_leader'],
  },
  fieldwork: {
    awaiting_director_approval: ['project_leader'],
    rejected: ['project_leader'],
  },
  awaiting_director_approval: {
    director_approved: ['director'],
    returned_to_screening: ['director'],
    rejected: ['director'],
  },
  returned_to_screening: {
    screening: ['project_leader'],
    rejected: ['project_leader'],
  },
  director_approved: {
    in_ministerial_advice: ['project_leader'],
    rejected: ['project_leader'],
  },
  in_ministerial_advice: {
    ministerial_advice_complete: ['ministerial_advisor'],
    returned_to_director: ['ministerial_advisor'],
    rejected: ['ministerial_advisor'],
  },
  returned_to_director: {
    awaiting_director_approval: ['project_leader'],
    rejected: ['project_leader'],
  },
  ministerial_advice_complete: {
    awaiting_minister_decision: ['project_leader'],
    rejected: ['project_leader'],
  },
  awaiting_minister_decision: {
    minister_approved: ['minister'],
    returned_to_advisor: ['minister'],
    rejected: ['minister'],
  },
  returned_to_advisor: {
    in_ministerial_advice: ['project_leader'],
    rejected: ['project_leader'],
  },
  minister_approved: {
    approved_for_council: ['project_leader'],
    rejected: ['project_leader'],
  },
  approved_for_council: {
    council_doc_generated: ['project_leader', 'admin_staff'],
    rejected: ['project_leader'],
  },
  council_doc_generated: {
    finalized: ['project_leader'],
    rejected: ['project_leader'],
  },
}
