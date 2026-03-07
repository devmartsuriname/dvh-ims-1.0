# V1.9 Phase 4 — Case Timeline Component (GAP-4)

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Scope:** Read-only, additive UI. No schema changes.

---

## Implementation

### 1. New Component: `CaseTimeline.tsx`

**Location:** `src/app/(admin)/subsidy-cases/[id]/components/CaseTimeline.tsx`

**Props:** `caseId: string`

**Behavior:**

- Fetches from `subsidy_case_status_history` (filtered by `case_id`)
- Fetches from `audit_event` (filtered by `entity_id = caseId` and relevant actions)
- Merges both sources into a single chronologically sorted list (descending — newest first)
- Resolves actor names via `app_user_profile` lookup
- Each timeline entry displays: timestamp, actor name + role, event type label, description/reason

**Audit event actions included:**
`STATUS_CHANGE`, `DOCUMENT_VERIFIED`, `CASE_ASSIGNED`, `CASE_REASSIGNED`, `VISIT_SCHEDULED`, `VISIT_COMPLETED`, `VISIT_CANCELLED`, `VISIT_RESCHEDULED`, `DIRECTOR_APPROVED`, `MINISTER_APPROVED`, `MINISTER_RETURNED`, `SOCIAL_ASSESSMENT_STARTED`, `SOCIAL_ASSESSMENT_COMPLETED`, `TECHNICAL_INSPECTION_STARTED`, `TECHNICAL_INSPECTION_COMPLETED`, `ADMIN_REVIEW_STARTED`, `ADMIN_REVIEW_COMPLETED`, `MINISTERIAL_ADVICE_STARTED`, `MINISTERIAL_ADVICE_COMPLETED`, `DIRECTOR_REVIEW_STARTED`, `ARCHIVE_VIEWED`, `SUBMISSION_VALIDATION_BLOCKED`, `CREATE`, `UPDATE`

**UI pattern:** Vertical timeline using existing Bootstrap classes (`d-flex`, `border-start`, badges). Each item has a colored dot indicator, timestamp on left, content on right. Status history entries get status badges; audit entries get action-type labels.

### 2. Integration into Case Detail

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

- Import `CaseTimeline`
- Add new `<Tab eventKey="timeline" title="Timeline">` between the existing History tab and Raadvoorstel tab (line ~840)
- Pass `caseId={subsidyCase.id}`
- Existing History tab remains untouched

Approved.

During verification, confirm that audit_event.entity_id consistently

references the subsidy case ID so all relevant events appear in the timeline.

System-generated events without an actor should display as "System".  
  
What does NOT change

- No database changes, no migrations, no RLS changes
- No workflow logic changes
- All existing tabs remain as-is
- Status transition logic untouched