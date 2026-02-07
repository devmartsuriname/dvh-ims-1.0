
# DVH-IMS V1.4 Phase 4 — Implementation Plan

## Phase Boundaries

- No new database tables, columns, or schema migrations
- No RLS policy changes
- No workflow or status transition changes
- No new roles
- No automatic decisions or status transitions
- No financial calculation, notification, or AI logic
- Decision motivations stored ONLY in status_history + audit_event

---

## Implementation Steps

### Step 1: Create Pre-Implementation Restore Point

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE4_START.md` documenting current state before any changes.

### Step 2: Create DirectorReviewPanel.tsx

New file: `src/app/(admin)/subsidy-cases/[id]/components/DirectorReviewPanel.tsx`

**Props:** Receives `caseId`, `caseStatus`, `subsidyCase` (overview data), `socialReport`, `technicalReport`, `documents`, `requirements`, `statusHistory`, `onStatusChange` callback, `statusReason`/`setStatusReason` from parent.

**Sections:**
1. Dossier summary panel (read-only): case number, applicant, district, requested amount, household size
2. Social report summary (read-only): extracts recommendation + key fields from `socialReport.report_json`. Warning badge if recommendation is "unfavorable" or "needs_further_review"
3. Technical report summary (read-only): extracts recommendation + key fields from `technicalReport.report_json`. Warning badge if recommendation is "rejected" or "needs_revision"
4. Document completeness indicator: counts verified vs total mandatory documents
5. Director motivation textarea: editable ONLY when role is `director` AND status is `awaiting_director_approval` or `returned_to_director`
6. Action buttons: "Approve" (triggers `director_approved`) and "Return to Screening" (triggers `returned_to_screening`), each with confirmation modal requiring mandatory motivation text
7. Governance subtitle text

**Decision recording:** Calls parent's `handleStatusChange` which writes to `status_history` and `audit_event`. Additionally calls `logEvent` with action `DIRECTOR_APPROVED` or `DIRECTOR_RETURNED`.

**Read-only mode:** Non-director roles see the panel with all fields disabled and any previously recorded Director decision from status history.

### Step 3: Create AdvisorReviewPanel.tsx

New file: `src/app/(admin)/subsidy-cases/[id]/components/AdvisorReviewPanel.tsx`

**Props:** Same pattern as Director panel plus `statusHistory` for extracting Director's recorded motivation.

**Sections:**
1. Dossier summary panel (read-only)
2. Social + Technical report summaries (read-only, same extraction as Director panel)
3. Director approval confirmation: reads from `statusHistory` to find the `director_approved` entry, shows Director's motivation (reason field)
4. Advisor recommendation dropdown: `recommend_approval` / `recommend_rejection` / `recommend_return`
5. Advisor formal advice textarea: mandatory free-text field
6. Action buttons: "Submit Advice" (triggers `ministerial_advice_complete`) and "Return to Director" (triggers `returned_to_director`), each with confirmation modal
7. Governance subtitle text

**Editable ONLY** for `ministerial_advisor` role at `in_ministerial_advice` or `returned_to_advisor` status.

**No auto-save** of advice text (governance rule: decisions recorded only on explicit confirmation).

### Step 4: Create MinisterDecisionPanel.tsx

New file: `src/app/(admin)/subsidy-cases/[id]/components/MinisterDecisionPanel.tsx`

**Props:** Same pattern, plus needs advisor's recommendation and advice from `statusHistory`.

**Sections:**
1. Consolidated decision chain summary (read-only):
   - Social recommendation (summary label from report_json)
   - Technical recommendation (summary label from report_json)
   - Director approval status + motivation (from status history)
   - Advisor recommendation + full advice text (from status history)
2. Minister's decision motivation textarea (mandatory)
3. Deviation detection: compares Minister's chosen action against Advisor's recommendation. If Advisor recommended rejection but Minister approves (or vice versa), a MANDATORY deviation explanation textarea appears. This is NOT a checkbox -- it is a separate required text field.
4. Action buttons: "Approve" (triggers `minister_approved`) and "Return to Advisor" (triggers `returned_to_advisor`), each with confirmation modal
5. Governance subtitle text

**Editable ONLY** for `minister` role at `awaiting_minister_decision` status.

**Deviation logic:** The deviation explanation is appended to the reason field stored in both `status_history.reason` and `audit_event.reason`, formatted as: `"[Decision motivation]. DEVIATION FROM ADVISORY: [deviation explanation]"`.

### Step 5: Integrate Tabs in Case Detail Page

Modify `src/app/(admin)/subsidy-cases/[id]/page.tsx`:

**Tab visibility logic** (governance-binding rule):
- Director Review tab: visible when status has reached or passed `awaiting_director_approval` (includes `awaiting_director_approval`, `returned_to_director`, `director_approved`, and all subsequent statuses)
- Ministerial Advisor tab: visible when status has reached or passed `in_ministerial_advice`
- Minister Decision tab: visible when status has reached or passed `awaiting_minister_decision`

Implementation: define ordered status arrays and check if current status index is at or beyond the relevant threshold.

Tabs are inserted between the Technical Report tab and the History tab, in order: Director Review, Ministerial Advisor, Minister Decision.

Each tab component receives the existing state variables as props (subsidyCase, socialReport, technicalReport, documents, requirements, statusHistory, handleStatusChange, statusReason, setStatusReason, fetchCase).

### Step 6: Create Post-Implementation Restore Point

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE4_COMPLETE.md` documenting completed state.

---

## Files Summary

| Action | File |
|--------|------|
| Create | `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE4_START.md` |
| Create | `src/app/(admin)/subsidy-cases/[id]/components/DirectorReviewPanel.tsx` |
| Create | `src/app/(admin)/subsidy-cases/[id]/components/AdvisorReviewPanel.tsx` |
| Create | `src/app/(admin)/subsidy-cases/[id]/components/MinisterDecisionPanel.tsx` |
| Modify | `src/app/(admin)/subsidy-cases/[id]/page.tsx` |
| Create | `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE4_COMPLETE.md` |

---

## Technical Details

### Status Ordering for Tab Visibility

```text
STATUS_ORDER = [
  'received', 'in_social_review', 'returned_to_intake', 'social_completed',
  'in_technical_review', 'returned_to_social', 'technical_approved',
  'in_admin_review', 'returned_to_technical', 'admin_complete',
  'screening', 'needs_more_docs', 'fieldwork',
  'awaiting_director_approval', 'returned_to_director', 'director_approved',
  'returned_to_screening',
  'in_ministerial_advice', 'returned_to_advisor', 'ministerial_advice_complete',
  'returned_to_director',
  'awaiting_minister_decision', 'returned_to_advisor', 'minister_approved',
  'approved_for_council', 'council_doc_generated', 'finalized', 'rejected'
]
```

Rather than index-based ordering (which is fragile with return statuses), use explicit sets:

- Director tab visible statuses: `awaiting_director_approval`, `returned_to_director`, `director_approved`, `returned_to_screening`, `in_ministerial_advice`, `returned_to_advisor`, `ministerial_advice_complete`, `awaiting_minister_decision`, `minister_approved`, `approved_for_council`, `council_doc_generated`, `finalized`
- Advisor tab visible statuses: `in_ministerial_advice`, `returned_to_advisor`, `ministerial_advice_complete`, `returned_to_director`, `awaiting_minister_decision`, `minister_approved`, `approved_for_council`, `council_doc_generated`, `finalized`
- Minister tab visible statuses: `awaiting_minister_decision`, `returned_to_advisor`, `minister_approved`, `approved_for_council`, `council_doc_generated`, `finalized`

### Extracting Prior Decisions from Status History

Director's motivation is extracted by finding the most recent `statusHistory` entry where `to_status === 'director_approved'` and reading its `reason` field.

Advisor's recommendation and advice are extracted from the most recent entry where `to_status === 'ministerial_advice_complete'` and reading its `reason` field.

### Confirmation Dialog Pattern

Each action button opens a Bootstrap Modal (same pattern as Phase 3 finalization modals) with:
- Warning text describing the action's permanence
- Mandatory motivation/reason textarea
- Cancel and Confirm buttons
- Spinner on confirm while processing

### Audit Events

| Action | audit_event.action | Entity |
|--------|-------------------|--------|
| Director approves | DIRECTOR_APPROVED | subsidy_case |
| Director returns | DIRECTOR_RETURNED | subsidy_case |
| Advisor submits advice | MINISTERIAL_ADVICE_COMPLETED | subsidy_case |
| Advisor returns to director | MINISTERIAL_ADVICE_RETURNED | subsidy_case |
| Minister approves | MINISTER_APPROVED | subsidy_case |
| Minister returns to advisor | MINISTER_RETURNED | subsidy_case |

---

## Explicitly NOT Implemented

- No Review Archive UI (Phase 5)
- No reporting dashboards
- No appeals logic
- No automation or AI
- No financial disbursement
- No Raadvoorstel changes
- No notification enhancements
- No schema, RLS, or role changes
