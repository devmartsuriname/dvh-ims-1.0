# Phase 4F Activation Report: Minister Final Decision Enforcement

**Document ID:** DVH-IMS-V1.3-PHASE-4F-REPORT
**Version:** 1.0
**Date:** 2026-02-02
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Status:** COMPLETE

---

## Executive Summary

Phase 4F has successfully enforced the Minister Final Decision step in the Bouwsubsidie workflow. This phase completes the 7-step decision chain as documented in V1.2, ensuring that all subsidy dossiers receive formal ministerial approval before proceeding to council document generation.

---

## Implementation Summary

### Database Changes

| Component | Change |
|-----------|--------|
| `validate_subsidy_case_transition()` | Updated to include 3 new Minister decision states |
| Transition Matrix | `ministerial_advice_complete` → `awaiting_minister_decision` ENFORCED |
| Direct Path Blocked | `ministerial_advice_complete` → `approved_for_council` BLOCKED |

### New Workflow States

| Status | Description | Role Authority |
|--------|-------------|----------------|
| `awaiting_minister_decision` | Dossier pending Minister's formal decision | Minister |
| `minister_approved` | Minister has approved the subsidy | Minister |
| `returned_to_advisor` | Minister returned for additional advice | Minister |

### TypeScript Changes

| File | Change |
|------|--------|
| `src/hooks/useAuditLog.ts` | Added `MINISTER_DECISION_STARTED`, `MINISTER_APPROVED`, `MINISTER_RETURNED` |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Added STATUS_BADGES and STATUS_TRANSITIONS |

---

## Complete Bouwsubsidie Decision Chain (Post-Phase 4F)

| Step | Role | From Status | To Status | Phase |
|------|------|-------------|-----------|-------|
| 1 | Frontdesk | received | in_social_review | V1.1 |
| 2 | Social Field Worker | in_social_review | social_completed | 4A |
| 3 | Technical Inspector | in_technical_review | technical_approved | 4B |
| 4 | Admin Officer | in_admin_review | admin_complete | 4C |
| 5 | Project Leader/Frontdesk | screening | fieldwork | V1.1 |
| 6 | Director | awaiting_director_approval | director_approved | 4D |
| 7 | Ministerial Advisor | in_ministerial_advice | ministerial_advice_complete | 4E |
| 8 | **Minister** | **awaiting_minister_decision** | **minister_approved** | **4F** |
| 9 | System | approved_for_council | finalized | V1.1 |

---

## Workflow Diagram (Final)

```text
[Phases 4A/4B/4C - Social/Technical/Admin Chain]
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs → screening (loop)
                ↓
            fieldwork
                ↓
[Phase 4D - Director Chain]
    awaiting_director_approval
           ↓              ↓
    director_approved    returned_to_screening → screening
           ↓
[Phase 4E - Ministerial Advisor Chain]
    in_ministerial_advice
           ↓                    ↓
    ministerial_advice_complete  returned_to_director → awaiting_director_approval
           ↓
[Phase 4F - Minister Decision Chain]
    awaiting_minister_decision
           ↓              ↓
    minister_approved    returned_to_advisor → in_ministerial_advice
           ↓
    approved_for_council → council_doc_generated → finalized

[Any non-terminal state] → rejected (terminal)
```

---

## Enforcement Verification

### Blocked Transitions

| From Status | Blocked To | Reason |
|-------------|------------|--------|
| `ministerial_advice_complete` | `approved_for_council` | Must go through Minister decision |

### Valid Transitions (New)

| From Status | Allowed To |
|-------------|------------|
| `ministerial_advice_complete` | `awaiting_minister_decision`, `rejected` |
| `awaiting_minister_decision` | `minister_approved`, `returned_to_advisor`, `rejected` |
| `returned_to_advisor` | `in_ministerial_advice`, `rejected` |
| `minister_approved` | `approved_for_council`, `rejected` |

---

## Security Considerations

- **No new RLS policies required**: Minister role already has national-level access
- **Audit trail**: All Minister actions logged via existing `logEvent` pattern
- **Authentication**: Enforced by existing policies
- **Authorization**: Status change authority via UPDATE policy

---

## Files Modified

| File | Action |
|------|--------|
| `supabase/migrations/[timestamp]_phase_4f_minister_decision.sql` | CREATED |
| `src/hooks/useAuditLog.ts` | MODIFIED (3 audit actions added) |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFIED (badges + transitions) |

---

## Verification Checklist

| Check | Status |
|-------|--------|
| Migration executed successfully | ✅ |
| Trigger updated with new states | ✅ |
| Direct path `ministerial_advice_complete` → `approved_for_council` BLOCKED | ✅ |
| New states in STATUS_BADGES | ✅ |
| New transitions in STATUS_TRANSITIONS | ✅ |
| Audit actions added | ✅ |
| Woningregistratie unchanged | ✅ |

---

## Governance Compliance

| Requirement | Status |
|-------------|--------|
| Bouwsubsidie only | ✅ ENFORCED |
| No Woningregistratie changes | ✅ ENFORCED |
| No public wizard changes | ✅ ENFORCED |
| No new RLS policies needed | ✅ CONFIRMED |
| Restore points created | ✅ |
| Audit trail operational | ✅ |

---

## Active Roles (11 - Unchanged)

| Role | Service | Decision Authority |
|------|---------|-------------------|
| system_admin | Both | Administrative |
| **minister** | **Both** | **FINAL DECISION ENFORCED** |
| project_leader | Both | Oversight |
| frontdesk_bouwsubsidie | Bouwsubsidie | Intake |
| frontdesk_housing | Woningregistratie | Intake |
| admin_staff | Both | Administrative |
| audit | Both | Read-only |
| social_field_worker | Bouwsubsidie | Social Review |
| technical_inspector | Bouwsubsidie | Technical Review |
| director | Bouwsubsidie | Organizational Approval |
| ministerial_advisor | Bouwsubsidie | Advisory |

---

## Linter Warnings (Pre-Existing)

The security linter reports 13 warnings related to `USING (true)` or `WITH CHECK (true)` policies. These are pre-existing anonymous INSERT policies for public citizen submissions (e.g., `anon_can_insert_person`, `anon_can_insert_household`) and are NOT related to Phase 4F implementation. These policies are intentional for the public wizard functionality.

---

## Conclusion

Phase 4F has successfully completed the Bouwsubsidie ministerial decision chain. The system now enforces:

1. ✅ Social Field Worker review (Phase 4A)
2. ✅ Technical Inspector approval (Phase 4B)
3. ✅ Administrative Officer completeness (Phase 4C)
4. ✅ Director organizational approval (Phase 4D)
5. ✅ Ministerial Advisor advice (Phase 4E)
6. ✅ **Minister final decision (Phase 4F)**

No dossier can bypass the Minister's formal decision authority.

---

**PHASE 4F: COMPLETE**
