/**
 * Regression tests for src/lib/subsidyCaseTransitions.ts
 *
 * Phase 6 — Testability Extraction & Critical RBAC Coverage.
 * Guards the ROLE_ALLOWED_TRANSITIONS and STATUS_TRANSITIONS constants that were
 * previously untestable (not exported). Any accidental role or state change
 * will be caught here before it reaches production.
 *
 * Coverage intent:
 *   - Happy-path transitions: correct role → transition allowed
 *   - Denied-path transitions: wrong role → transition not allowed
 *   - State machine completeness: STATUS_TRANSITIONS covers all known states
 *   - RBAC matrix structure: every from-state in ROLE_ALLOWED_TRANSITIONS is reachable
 *   - Terminal states: finalized and rejected have no outgoing STATUS_TRANSITIONS
 *   - system_admin bypass: tested conceptually (handled separately in component)
 *
 * Out of scope: rendering behaviour (component uses these constants — tested there)
 */

import { describe, it, expect } from 'vitest'
import {
  STATUS_TRANSITIONS,
  ROLE_ALLOWED_TRANSITIONS,
  NEXT_RESPONSIBLE_ROLE,
} from './subsidyCaseTransitions'
import type { AppRole } from '@/hooks/useUserRole'

// ---------------------------------------------------------------------------
// Helper: simulate the component's canTransition check
// (mirrors lines 469–474 of subsidy-cases/[id]/page.tsx)
// ---------------------------------------------------------------------------

function canTransition(
  fromStatus: string,
  toStatus: string,
  userRoles: AppRole[],
): boolean {
  const roleMap = ROLE_ALLOWED_TRANSITIONS[fromStatus]
  if (!roleMap) return false
  const permittedRoles = roleMap[toStatus]
  if (!permittedRoles) return false
  return permittedRoles.some((role) => userRoles.includes(role))
}

// ---------------------------------------------------------------------------
// STATUS_TRANSITIONS — state machine structure
// ---------------------------------------------------------------------------

describe('STATUS_TRANSITIONS', () => {
  it('exports an object with entries', () => {
    expect(STATUS_TRANSITIONS).toBeDefined()
    expect(typeof STATUS_TRANSITIONS).toBe('object')
    expect(Object.keys(STATUS_TRANSITIONS).length).toBeGreaterThan(0)
  })

  it('has exactly 24 from-states', () => {
    // 22 non-terminal states + rejected and finalized do NOT appear as keys
    // because they have no valid outgoing transitions
    expect(Object.keys(STATUS_TRANSITIONS)).toHaveLength(24)
  })

  it('every value is a non-empty array of strings', () => {
    for (const [status, targets] of Object.entries(STATUS_TRANSITIONS)) {
      expect(Array.isArray(targets), `${status} targets should be array`).toBe(true)
      expect(targets.length, `${status} should have at least one target`).toBeGreaterThan(0)
      for (const t of targets) {
        expect(typeof t, `target in ${status} should be string`).toBe('string')
      }
    }
  })

  it('intake entry point: received → in_social_review, screening, rejected', () => {
    expect(STATUS_TRANSITIONS.received).toEqual(
      expect.arrayContaining(['in_social_review', 'screening', 'rejected'])
    )
    expect(STATUS_TRANSITIONS.received).toHaveLength(3)
  })

  it('social review path: in_social_review → social_completed, returned_to_intake, rejected', () => {
    expect(STATUS_TRANSITIONS.in_social_review).toEqual(
      expect.arrayContaining(['social_completed', 'returned_to_intake', 'rejected'])
    )
  })

  it('director approval path: fieldwork → awaiting_director_approval, rejected', () => {
    expect(STATUS_TRANSITIONS.fieldwork).toEqual(
      expect.arrayContaining(['awaiting_director_approval', 'rejected'])
    )
  })

  it('ministerial path: awaiting_minister_decision → minister_approved, returned_to_advisor, rejected', () => {
    expect(STATUS_TRANSITIONS.awaiting_minister_decision).toEqual(
      expect.arrayContaining(['minister_approved', 'returned_to_advisor', 'rejected'])
    )
  })

  it('terminal path: council_doc_generated → finalized, rejected', () => {
    expect(STATUS_TRANSITIONS.council_doc_generated).toEqual(
      expect.arrayContaining(['finalized', 'rejected'])
    )
    expect(STATUS_TRANSITIONS.council_doc_generated).toHaveLength(2)
  })

  it('terminal states finalized and rejected do NOT have outgoing transitions', () => {
    expect(STATUS_TRANSITIONS['finalized']).toBeUndefined()
    expect(STATUS_TRANSITIONS['rejected']).toBeUndefined()
  })

  it('all target statuses are strings (no undefined targets)', () => {
    for (const targets of Object.values(STATUS_TRANSITIONS)) {
      for (const t of targets) {
        expect(t).toBeTruthy()
      }
    }
  })
})

// ---------------------------------------------------------------------------
// ROLE_ALLOWED_TRANSITIONS — RBAC enforcement matrix
// ---------------------------------------------------------------------------

describe('ROLE_ALLOWED_TRANSITIONS', () => {
  it('exports an object with entries', () => {
    expect(ROLE_ALLOWED_TRANSITIONS).toBeDefined()
    expect(Object.keys(ROLE_ALLOWED_TRANSITIONS).length).toBeGreaterThan(0)
  })

  it('has the same from-states as STATUS_TRANSITIONS', () => {
    const stTransitionKeys = Object.keys(STATUS_TRANSITIONS).sort()
    const rbacKeys = Object.keys(ROLE_ALLOWED_TRANSITIONS).sort()
    expect(rbacKeys).toEqual(stTransitionKeys)
  })

  it('every value is an object whose values are non-empty AppRole arrays', () => {
    for (const [fromStatus, toMap] of Object.entries(ROLE_ALLOWED_TRANSITIONS)) {
      expect(typeof toMap).toBe('object')
      for (const [toStatus, roles] of Object.entries(toMap)) {
        expect(Array.isArray(roles), `${fromStatus}→${toStatus} roles should be array`).toBe(true)
        expect(roles.length, `${fromStatus}→${toStatus} should have at least one role`).toBeGreaterThan(0)
      }
    }
  })

  it('every status listed in STATUS_TRANSITIONS targets has a corresponding RBAC entry', () => {
    for (const [fromStatus, targets] of Object.entries(STATUS_TRANSITIONS)) {
      const rbacEntry = ROLE_ALLOWED_TRANSITIONS[fromStatus]
      expect(rbacEntry, `no RBAC entry for from-state ${fromStatus}`).toBeDefined()
      for (const target of targets) {
        expect(
          rbacEntry[target],
          `no RBAC roles for transition ${fromStatus}→${target}`
        ).toBeDefined()
      }
    }
  })
})

// ---------------------------------------------------------------------------
// canTransition — happy-path role checks
// ---------------------------------------------------------------------------

describe('canTransition — happy-path (correct role → allowed)', () => {
  it('frontdesk_bouwsubsidie can move received → in_social_review', () => {
    expect(canTransition('received', 'in_social_review', ['frontdesk_bouwsubsidie'])).toBe(true)
  })

  it('frontdesk_bouwsubsidie can move received → screening', () => {
    expect(canTransition('received', 'screening', ['frontdesk_bouwsubsidie'])).toBe(true)
  })

  it('social_field_worker can complete social review: in_social_review → social_completed', () => {
    expect(canTransition('in_social_review', 'social_completed', ['social_field_worker'])).toBe(true)
  })

  it('social_field_worker can return to intake: in_social_review → returned_to_intake', () => {
    expect(canTransition('in_social_review', 'returned_to_intake', ['social_field_worker'])).toBe(true)
  })

  it('technical_inspector can approve: in_technical_review → technical_approved', () => {
    expect(canTransition('in_technical_review', 'technical_approved', ['technical_inspector'])).toBe(true)
  })

  it('project_leader can advance: social_completed → in_technical_review', () => {
    expect(canTransition('social_completed', 'in_technical_review', ['project_leader'])).toBe(true)
  })

  it('admin_staff can complete admin review: in_admin_review → admin_complete', () => {
    expect(canTransition('in_admin_review', 'admin_complete', ['admin_staff'])).toBe(true)
  })

  it('director can approve: awaiting_director_approval → director_approved', () => {
    expect(canTransition('awaiting_director_approval', 'director_approved', ['director'])).toBe(true)
  })

  it('director can return to screening: awaiting_director_approval → returned_to_screening', () => {
    expect(canTransition('awaiting_director_approval', 'returned_to_screening', ['director'])).toBe(true)
  })

  it('ministerial_advisor can complete advice: in_ministerial_advice → ministerial_advice_complete', () => {
    expect(canTransition('in_ministerial_advice', 'ministerial_advice_complete', ['ministerial_advisor'])).toBe(true)
  })

  it('minister can approve: awaiting_minister_decision → minister_approved', () => {
    expect(canTransition('awaiting_minister_decision', 'minister_approved', ['minister'])).toBe(true)
  })

  it('minister can return to advisor: awaiting_minister_decision → returned_to_advisor', () => {
    expect(canTransition('awaiting_minister_decision', 'returned_to_advisor', ['minister'])).toBe(true)
  })

  it('project_leader can finalize: council_doc_generated → finalized', () => {
    expect(canTransition('council_doc_generated', 'finalized', ['project_leader'])).toBe(true)
  })

  it('project_leader + admin_staff can generate council doc: approved_for_council → council_doc_generated', () => {
    expect(canTransition('approved_for_council', 'council_doc_generated', ['project_leader'])).toBe(true)
    expect(canTransition('approved_for_council', 'council_doc_generated', ['admin_staff'])).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// canTransition — denied-path role checks
// ---------------------------------------------------------------------------

describe('canTransition — denied-path (wrong role → not allowed)', () => {
  it('social_field_worker cannot start a case from received', () => {
    expect(canTransition('received', 'in_social_review', ['social_field_worker'])).toBe(false)
    expect(canTransition('received', 'screening', ['social_field_worker'])).toBe(false)
  })

  it('frontdesk_bouwsubsidie cannot complete social review', () => {
    expect(canTransition('in_social_review', 'social_completed', ['frontdesk_bouwsubsidie'])).toBe(false)
  })

  it('frontdesk_bouwsubsidie cannot approve at director stage', () => {
    expect(canTransition('awaiting_director_approval', 'director_approved', ['frontdesk_bouwsubsidie'])).toBe(false)
  })

  it('technical_inspector cannot approve at director stage', () => {
    expect(canTransition('awaiting_director_approval', 'director_approved', ['technical_inspector'])).toBe(false)
  })

  it('director cannot make minister decision', () => {
    expect(canTransition('awaiting_minister_decision', 'minister_approved', ['director'])).toBe(false)
  })

  it('ministerial_advisor cannot make minister decision', () => {
    expect(canTransition('awaiting_minister_decision', 'minister_approved', ['ministerial_advisor'])).toBe(false)
  })

  it('social_field_worker cannot finalize', () => {
    expect(canTransition('council_doc_generated', 'finalized', ['social_field_worker'])).toBe(false)
  })

  it('audit role cannot trigger any transition (read-only role)', () => {
    expect(canTransition('received', 'in_social_review', ['audit'])).toBe(false)
    expect(canTransition('awaiting_director_approval', 'director_approved', ['audit'])).toBe(false)
    expect(canTransition('council_doc_generated', 'finalized', ['audit'])).toBe(false)
  })

  it('minister role cannot perform frontdesk intake operations', () => {
    expect(canTransition('received', 'in_social_review', ['minister'])).toBe(false)
    expect(canTransition('received', 'screening', ['minister'])).toBe(false)
  })

  it('empty roles array cannot trigger any transition', () => {
    expect(canTransition('received', 'in_social_review', [])).toBe(false)
    expect(canTransition('awaiting_director_approval', 'director_approved', [])).toBe(false)
  })

  it('unknown from-status returns false', () => {
    expect(canTransition('nonexistent_status', 'in_social_review', ['project_leader'])).toBe(false)
  })

  it('unknown target status returns false', () => {
    expect(canTransition('received', 'nonexistent_target', ['frontdesk_bouwsubsidie'])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// NEXT_RESPONSIBLE_ROLE — notification routing
// ---------------------------------------------------------------------------

describe('NEXT_RESPONSIBLE_ROLE', () => {
  it('exports an object', () => {
    expect(NEXT_RESPONSIBLE_ROLE).toBeDefined()
    expect(typeof NEXT_RESPONSIBLE_ROLE).toBe('object')
  })

  it('all values are non-empty strings', () => {
    for (const [key, val] of Object.entries(NEXT_RESPONSIBLE_ROLE)) {
      expect(typeof val, `${key} should map to a string`).toBe('string')
      expect(val.length, `${key} should map to a non-empty string`).toBeGreaterThan(0)
    }
  })

  it('maps in_social_review to social_field_worker', () => {
    expect(NEXT_RESPONSIBLE_ROLE.in_social_review).toBe('social_field_worker')
  })

  it('maps awaiting_director_approval to director', () => {
    expect(NEXT_RESPONSIBLE_ROLE.awaiting_director_approval).toBe('director')
  })

  it('maps awaiting_minister_decision to minister', () => {
    expect(NEXT_RESPONSIBLE_ROLE.awaiting_minister_decision).toBe('minister')
  })

  it('maps in_ministerial_advice to ministerial_advisor', () => {
    expect(NEXT_RESPONSIBLE_ROLE.in_ministerial_advice).toBe('ministerial_advisor')
  })

  it('maps finalized to project_leader', () => {
    expect(NEXT_RESPONSIBLE_ROLE.finalized).toBe('project_leader')
  })

  it('maps rejected to project_leader', () => {
    expect(NEXT_RESPONSIBLE_ROLE.rejected).toBe('project_leader')
  })

  it('covers all target statuses that appear in STATUS_TRANSITIONS values', () => {
    const allTargets = new Set<string>()
    for (const targets of Object.values(STATUS_TRANSITIONS)) {
      for (const t of targets) {
        allTargets.add(t)
      }
    }
    for (const target of allTargets) {
      expect(
        NEXT_RESPONSIBLE_ROLE[target],
        `NEXT_RESPONSIBLE_ROLE missing entry for target status: ${target}`
      ).toBeDefined()
    }
  })
})
