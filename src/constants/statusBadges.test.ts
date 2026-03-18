/**
 * Regression tests for src/constants/statusBadges.ts
 *
 * Phase 5 — Test Foundation.
 * These tests guard the single-source-of-truth badge constants introduced in
 * Phase 4. Any accidental deletion, rename, or key/value change will be caught
 * here before it reaches production.
 *
 * Coverage intent: data integrity of the shared badge module.
 * Out of scope: rendering behaviour (covered by consuming component tests).
 */

import { describe, it, expect } from 'vitest'
import {
  HOUSING_STATUS_BADGES,
  SUBSIDY_STATUS_BADGES,
  VISIT_TYPE_BADGES,
  DECISION_BADGES,
  ALLOCATION_RUN_STATUS_BADGES,
} from './statusBadges'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Assert every entry in a bg+label map has the required shape. */
function assertBgLabelShape(map: Record<string, { bg: string; label: string }>) {
  for (const [key, val] of Object.entries(map)) {
    expect(typeof val.bg, `${key}.bg should be string`).toBe('string')
    expect(val.bg.length, `${key}.bg should be non-empty`).toBeGreaterThan(0)
    expect(typeof val.label, `${key}.label should be string`).toBe('string')
    expect(val.label.length, `${key}.label should be non-empty`).toBeGreaterThan(0)
  }
}

/** Assert every entry in a string-value map is a non-empty string. */
function assertStringValues(map: Record<string, string>, name: string) {
  for (const [key, val] of Object.entries(map)) {
    expect(typeof val, `${name}[${key}] should be string`).toBe('string')
    expect(val.length, `${name}[${key}] should be non-empty`).toBeGreaterThan(0)
  }
}

// ---------------------------------------------------------------------------
// HOUSING_STATUS_BADGES
// ---------------------------------------------------------------------------

describe('HOUSING_STATUS_BADGES', () => {
  it('exports an object', () => {
    expect(HOUSING_STATUS_BADGES).toBeDefined()
    expect(typeof HOUSING_STATUS_BADGES).toBe('object')
  })

  it('has exactly 8 entries (one per housing workflow status)', () => {
    expect(Object.keys(HOUSING_STATUS_BADGES)).toHaveLength(8)
  })

  it('every entry has a non-empty bg string and label string', () => {
    assertBgLabelShape(HOUSING_STATUS_BADGES)
  })

  it('contains the complete set of housing status keys', () => {
    const expected = [
      'received', 'under_review', 'urgency_assessed', 'waiting_list',
      'matched', 'allocated', 'finalized', 'rejected',
    ]
    for (const key of expected) {
      expect(HOUSING_STATUS_BADGES, `missing key: ${key}`).toHaveProperty(key)
    }
  })

  it('terminal statuses have the expected severity colors', () => {
    expect(HOUSING_STATUS_BADGES.finalized.bg).toBe('success')
    expect(HOUSING_STATUS_BADGES.rejected.bg).toBe('danger')
  })

  it('initial received status maps to secondary (neutral)', () => {
    expect(HOUSING_STATUS_BADGES.received.bg).toBe('secondary')
  })
})

// ---------------------------------------------------------------------------
// SUBSIDY_STATUS_BADGES
// ---------------------------------------------------------------------------

describe('SUBSIDY_STATUS_BADGES', () => {
  it('exports an object', () => {
    expect(SUBSIDY_STATUS_BADGES).toBeDefined()
  })

  it('has exactly 26 entries covering the full subsidy workflow', () => {
    expect(Object.keys(SUBSIDY_STATUS_BADGES)).toHaveLength(26)
  })

  it('every entry has a non-empty bg string and label string', () => {
    assertBgLabelShape(SUBSIDY_STATUS_BADGES)
  })

  it('covers all lifecycle phases: intake, review, director, ministerial, council', () => {
    const phases = [
      // Intake
      'received',
      // Review chain
      'in_social_review', 'social_completed',
      'in_technical_review', 'technical_approved',
      'in_admin_review', 'admin_complete',
      // Screening
      'screening', 'needs_more_docs', 'fieldwork',
      // Director
      'awaiting_director_approval', 'director_approved',
      // Ministerial
      'in_ministerial_advice', 'ministerial_advice_complete',
      'awaiting_minister_decision', 'minister_approved',
      // Council
      'approved_for_council', 'council_doc_generated',
      // Terminal
      'finalized', 'rejected',
    ]
    for (const key of phases) {
      expect(SUBSIDY_STATUS_BADGES, `missing phase key: ${key}`).toHaveProperty(key)
    }
  })

  it('return/rework statuses map to warning color', () => {
    const returnStatuses = [
      'returned_to_intake', 'returned_to_social', 'returned_to_technical',
      'returned_to_screening', 'returned_to_director', 'returned_to_advisor',
    ]
    for (const key of returnStatuses) {
      expect(SUBSIDY_STATUS_BADGES[key].bg, `${key} should be warning`).toBe('warning')
    }
  })

  it('terminal finalized=success and rejected=danger', () => {
    expect(SUBSIDY_STATUS_BADGES.finalized.bg).toBe('success')
    expect(SUBSIDY_STATUS_BADGES.rejected.bg).toBe('danger')
  })
})

// ---------------------------------------------------------------------------
// VISIT_TYPE_BADGES
// ---------------------------------------------------------------------------

describe('VISIT_TYPE_BADGES', () => {
  it('exports an object', () => {
    expect(VISIT_TYPE_BADGES).toBeDefined()
  })

  it('has exactly 3 entries', () => {
    expect(Object.keys(VISIT_TYPE_BADGES)).toHaveLength(3)
  })

  it('every entry has a non-empty bg string and label string', () => {
    assertBgLabelShape(VISIT_TYPE_BADGES)
  })

  it('contains social, technical, and follow_up keys', () => {
    expect(VISIT_TYPE_BADGES).toHaveProperty('social')
    expect(VISIT_TYPE_BADGES).toHaveProperty('technical')
    expect(VISIT_TYPE_BADGES).toHaveProperty('follow_up')
  })
})

// ---------------------------------------------------------------------------
// DECISION_BADGES
// ---------------------------------------------------------------------------

describe('DECISION_BADGES', () => {
  it('exports an object', () => {
    expect(DECISION_BADGES).toBeDefined()
  })

  it('has exactly 3 entries', () => {
    expect(Object.keys(DECISION_BADGES)).toHaveLength(3)
  })

  it('all values are non-empty strings', () => {
    assertStringValues(DECISION_BADGES, 'DECISION_BADGES')
  })

  it('approved maps to success, rejected to danger, deferred to warning', () => {
    expect(DECISION_BADGES.approved).toBe('success')
    expect(DECISION_BADGES.rejected).toBe('danger')
    expect(DECISION_BADGES.deferred).toBe('warning')
  })
})

// ---------------------------------------------------------------------------
// ALLOCATION_RUN_STATUS_BADGES
// ---------------------------------------------------------------------------

describe('ALLOCATION_RUN_STATUS_BADGES', () => {
  it('exports an object', () => {
    expect(ALLOCATION_RUN_STATUS_BADGES).toBeDefined()
  })

  it('has exactly 4 entries', () => {
    expect(Object.keys(ALLOCATION_RUN_STATUS_BADGES)).toHaveLength(4)
  })

  it('all values are non-empty strings', () => {
    assertStringValues(ALLOCATION_RUN_STATUS_BADGES, 'ALLOCATION_RUN_STATUS_BADGES')
  })

  it('contains all 4 allocation run lifecycle statuses', () => {
    expect(ALLOCATION_RUN_STATUS_BADGES).toHaveProperty('pending')
    expect(ALLOCATION_RUN_STATUS_BADGES).toHaveProperty('running')
    expect(ALLOCATION_RUN_STATUS_BADGES).toHaveProperty('completed')
    expect(ALLOCATION_RUN_STATUS_BADGES).toHaveProperty('failed')
  })

  it('terminal states have correct severity: completed=success, failed=danger', () => {
    expect(ALLOCATION_RUN_STATUS_BADGES.completed).toBe('success')
    expect(ALLOCATION_RUN_STATUS_BADGES.failed).toBe('danger')
  })
})
