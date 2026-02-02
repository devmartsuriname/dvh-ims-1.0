
# Phase 4F: Minister Final Decision Enforcement for Bouwsubsidie

## Executive Summary

Phase 4F will enforce the **Minister Final Decision** step in the Bouwsubsidie workflow. After Ministerial Advisor completes their advice, dossiers must receive the Minister's formal decision before proceeding to council document generation.

This phase completes the 7-step decision chain as documented in V1.2:
1. ✅ Frontdesk Intake (existing)
2. ✅ Social Review (Phase 4A)
3. ✅ Technical Inspection (Phase 4B)
4. ✅ Administrative Review (Phase 4C)
5. ✅ Director Organizational Approval (Phase 4D)
6. ✅ Ministerial Advisor Advice (Phase 4E)
7. **⏳ Minister Final Decision (Phase 4F - THIS PHASE)**

---

## Current State Analysis

### Workflow Chain (Post-Phase 4E)

```text
received → in_social_review → social_completed → in_technical_review →
technical_approved → in_admin_review → admin_complete → screening →
needs_more_docs/fieldwork → awaiting_director_approval → director_approved →
in_ministerial_advice → ministerial_advice_complete → approved_for_council →
council_doc_generated → finalized
```

### Gap Identified

Per V1.2 Workflow & Roles Harmonization (Step 7 of 7), `ministerial_advice_complete` should NOT proceed directly to `approved_for_council`. Instead:

- The Minister must formally decide on the dossier
- Only after ministerial decision can the dossier proceed to council document generation

Currently, `ministerial_advice_complete` transitions directly to `approved_for_council`, bypassing ministerial authority.

---

## Phase 4F Scope (STRICT)

### In Scope

1. Add new workflow states:
   - `awaiting_minister_decision` - Dossier pending Minister's formal decision
   - `minister_approved` - Minister has approved the subsidy
   - `returned_to_advisor` - Minister returned for additional advice
2. Update `validate_subsidy_case_transition()` trigger with new states
3. Add audit actions for Minister decision workflow
4. Update UI STATUS_BADGES and STATUS_TRANSITIONS
5. Documentation and restore points

### Explicitly Out of Scope

- New RLS policies for Minister (already has national access via existing policies)
- Menu visibility changes (Minister already has access to Subsidy Cases)
- Woningregistratie changes
- Public wizard changes
- User account creation

### Important Note: Minister Role Already Active

The `minister` role already exists in the `app_role` enum and is included in `is_national_role()`. The Minister role already has:
- RLS SELECT access to `subsidy_case`, `person`, `household`, etc.
- RLS UPDATE access via existing national-level policies
- Menu access to Subsidy Cases, Dashboard, Persons, Households, Audit Log

**No new RLS policies are required for Minister.**

---

## Implementation Plan

### Step 1: Create Restore Point (Pre-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4F_START.md`

---

### Step 2: Database Migration

**Migration:** Update `validate_subsidy_case_transition()` trigger

#### Updated Transition Matrix

| From Status | To Status (CURRENT) | To Status (NEW) |
|-------------|---------------------|-----------------|
| `ministerial_advice_complete` | `approved_for_council`, `rejected` | `awaiting_minister_decision`, `rejected` |
| `awaiting_minister_decision` | *(new)* | `minister_approved`, `returned_to_advisor`, `rejected` |
| `returned_to_advisor` | *(new)* | `in_ministerial_advice`, `rejected` |
| `minister_approved` | *(new)* | `approved_for_council`, `rejected` |
| `approved_for_council` | `council_doc_generated`, `rejected` | *(unchanged)* |

The complete new trigger will:
- Block direct transition from `ministerial_advice_complete` to `approved_for_council`
- Require passage through `awaiting_minister_decision` → `minister_approved`
- Allow Minister to return dossiers for additional advice
- Log invalid transition attempts to audit_event

---

### Step 3: Audit Action Updates

**File:** `src/hooks/useAuditLog.ts`

Add new audit actions:
- `MINISTER_DECISION_STARTED`
- `MINISTER_APPROVED`
- `MINISTER_RETURNED`

---

### Step 4: Admin UI Updates

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

#### 4.1 Add STATUS_BADGES

```typescript
awaiting_minister_decision: { bg: 'info', label: 'Awaiting Minister Decision' },
minister_approved: { bg: 'success', label: 'Minister Approved' },
returned_to_advisor: { bg: 'warning', label: 'Returned to Advisor' },
```

#### 4.2 Update STATUS_TRANSITIONS

```typescript
ministerial_advice_complete: ['awaiting_minister_decision', 'rejected'],
awaiting_minister_decision: ['minister_approved', 'returned_to_advisor', 'rejected'],
returned_to_advisor: ['in_ministerial_advice', 'rejected'],
minister_approved: ['approved_for_council', 'rejected'],
```

---

### Step 5: Create Restore Point (Post-Implementation)

**File:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4F_COMPLETE.md`

---

### Step 6: Documentation

**File:** `phases/DVH-IMS-V1.3/PHASE-4F/PHASE-4F-ACTIVATION-REPORT.md`

---

## Workflow Diagram (Post-Phase 4F - COMPLETE 7-STEP CHAIN)

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
[NEW Phase 4F - Minister Decision Chain]
    awaiting_minister_decision
           ↓              ↓
    minister_approved    returned_to_advisor → in_ministerial_advice
           ↓
    approved_for_council → council_doc_generated → finalized

[Any non-terminal state] → rejected (terminal)
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4F_START.md` | CREATE |
| `supabase/migrations/[timestamp]_phase_4f_minister_decision.sql` | CREATE |
| `src/hooks/useAuditLog.ts` | MODIFY (add 3 audit actions) |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFY (add badges and transitions) |
| `phases/DVH-IMS-V1.3/PHASE-4F/PHASE-4F-ACTIVATION-REPORT.md` | CREATE |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE4F_COMPLETE.md` | CREATE |

---

## Verification Checklist

| Check | Expected Result |
|-------|-----------------|
| Transition from `ministerial_advice_complete` → `awaiting_minister_decision` works | Required |
| Transition from `awaiting_minister_decision` → `minister_approved` works | Required |
| Transition from `awaiting_minister_decision` → `returned_to_advisor` works | Required |
| Transition from `returned_to_advisor` → `in_ministerial_advice` works | Required |
| Transition from `minister_approved` → `approved_for_council` works | Required |
| Direct transition from `ministerial_advice_complete` → `approved_for_council` BLOCKED | Required |
| Audit events logged for all Minister decision actions | Required |
| UI badges render correctly | Required |
| Status transitions appear in Change Status dropdown | Required |
| Woningregistratie workflow unchanged | Required |
| No console errors | Required |

---

## Governance Compliance

| Requirement | Status |
|-------------|--------|
| Bouwsubsidie only | ENFORCED |
| No Woningregistratie changes | ENFORCED |
| No public wizard changes | ENFORCED |
| No new RLS policies needed | CONFIRMED (Minister role already has access) |
| Restore points required | PLANNED |
| Audit trail mandatory | DESIGNED |

---

## Security Considerations

- Minister already has national-level SELECT access to subsidy_case
- Minister already has national-level UPDATE access for status changes
- All Minister decision actions will be logged to audit_event
- No additional RLS policies required
- Authentication enforced by existing policies

---

## Active Roles After Phase 4F (11 total - unchanged)

| Role | Service | Status |
|------|---------|--------|
| system_admin | Both | ACTIVE |
| **minister** | **Both** | **DECISION AUTHORITY ENFORCED** |
| project_leader | Both | ACTIVE |
| frontdesk_bouwsubsidie | Bouwsubsidie | ACTIVE |
| frontdesk_housing | Woningregistratie | ACTIVE |
| admin_staff | Both | ACTIVE |
| audit | Both | ACTIVE |
| social_field_worker | Bouwsubsidie | ACTIVE |
| technical_inspector | Bouwsubsidie | ACTIVE |
| director | Bouwsubsidie | ACTIVE |
| ministerial_advisor | Bouwsubsidie | ACTIVE |

---

## Complete Bouwsubsidie Decision Chain (Post-Phase 4F)

| Step | Role | Status(es) | Phase |
|------|------|------------|-------|
| 1 | Frontdesk | received → in_social_review | V1.1 |
| 2 | Social Field Worker | in_social_review → social_completed | 4A |
| 3 | Technical Inspector | in_technical_review → technical_approved | 4B |
| 4 | Admin Officer | in_admin_review → admin_complete | 4C |
| 5 | Project Leader/Frontdesk | screening → fieldwork | V1.1 |
| 6 | Director | awaiting_director_approval → director_approved | 4D |
| 7 | Ministerial Advisor | in_ministerial_advice → ministerial_advice_complete | 4E |
| 8 | **Minister** | **awaiting_minister_decision → minister_approved** | **4F** |
| 9 | System | approved_for_council → council_doc_generated → finalized | V1.1 |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Trigger update fails | Restore point allows rollback |
| Existing dossiers in `ministerial_advice_complete` blocked | These will need to transition through new path |
| UI transition breaks | STATUS_TRANSITIONS follows established pattern |
| Audit gaps | All transitions log via existing pattern |

---

## Migration Path for Existing Dossiers

Any dossier currently in `ministerial_advice_complete` status will:
- No longer be able to transition directly to `approved_for_council`
- Must transition to `awaiting_minister_decision` first
- Then to `minister_approved`
- Then to `approved_for_council`

This is intentional enforcement of the 7-step decision chain.

---

## End-of-Task Report Format

After implementation:

```
IMPLEMENTED
- 3 new workflow states added
- validate_subsidy_case_transition() trigger updated
- Direct path from ministerial_advice_complete to approved_for_council BLOCKED
- TypeScript audit actions added
- Status badges and transitions updated
- Documentation complete

PARTIAL
- None

SKIPPED
- New RLS policies (not needed - Minister already has access)
- Menu visibility changes (not needed - Minister already has access)
- Woningregistratie changes (out of scope)
- User account creation (operational, not implementation)

VERIFICATION
- Workflow transitions verified
- Blocking enforcement verified
- UI rendering verified

RESTORE POINTS
- RESTORE_POINT_V1.3_PHASE4F_START.md
- RESTORE_POINT_V1.3_PHASE4F_COMPLETE.md

BLOCKERS / ERRORS
- NONE
```

---

## Stop Condition

After completing implementation:
- STOP and report
- Await explicit authorization for next phase

---

## Phase 4F Summary

This phase completes the Bouwsubsidie ministerial decision chain by:
1. Enforcing Minister approval as the final decision authority
2. Blocking any bypass of ministerial decision step
3. Providing return path for additional advice if needed
4. Maintaining full audit trail for all Minister actions

**Ready for implementation upon approval.**
