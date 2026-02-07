

# DVH-IMS V1.4 Phase 3 — Social Review and Technical Review Interfaces

## Phase Boundaries Confirmation

- Phase 3 is PLANNING ONLY
- No implementation will be started
- No new database tables or columns
- No RLS changes
- No workflow or status changes
- No new roles
- No decision logic
- No Director or Minister UI included

---

## 1. Functional Intent

### A. Social Review Interface

**Problem it solves:** Social field workers currently have no structured form to fill in social assessment data. The existing case detail page renders `report_json` as raw JSON. This interface provides a structured form for capturing household social conditions during field visits.

**What it does NOT solve:** It does not decide case outcomes, assign cases, trigger status transitions automatically, or replace the existing status change mechanism on the case detail page.

**Role:** `social_field_worker`

**Workflow status:** `in_social_review` (primary), `returned_to_intake` (re-review after return)

**Nature:** PRODUCES information (writes to `social_report.report_json` and `social_report.is_finalized`). Does NOT decide outcomes.

### B. Technical Review Interface

**Problem it solves:** Technical inspectors have no structured form for recording construction/property inspection findings. Same raw JSON rendering issue as social reports.

**What it does NOT solve:** Same boundaries as social review — no decisions, no automatic status transitions, no case assignment.

**Role:** `technical_inspector`

**Workflow status:** `in_technical_review` (primary), `returned_to_social` (re-review scenarios)

**Nature:** PRODUCES information. Does NOT decide outcomes.

---

## 2. Data and Report Structure Analysis

### A. Social Report

**Tables READ:**
- `subsidy_case` — case_number, status, district_code, applicant_person_id, household_id
- `person` — first_name, last_name, national_id (applicant context)
- `household` — household_size, district_code
- `address` — address_line_1, address_line_2, district_code (visit location)
- `social_report` — report_json, is_finalized, updated_at (existing report data)
- `subsidy_case_status_history` — history context (read-only display)

**Tables WRITTEN:**
- `social_report` — UPDATE `report_json` (structured form data), UPDATE `is_finalized`, `finalized_at`, `finalized_by`
- `audit_event` — INSERT (mandatory: actor, action, entity, timestamp, reason)

**Finalization:** Set `is_finalized = true`, `finalized_at = NOW()`, `finalized_by = auth.uid()`. Once finalized, RLS prevents further updates (existing policy checks `is_finalized = false` implicitly via status constraints — when status moves to `social_completed`, the social field worker loses UPDATE access).

**Visibility:** Social field workers can only see reports for cases in their district at qualifying statuses. Other roles (frontdesk, admin_staff, national roles) can read finalized reports via existing `role_select_social_report` policy.

### B. Technical Report

**Tables READ:** Same as social report, substituting `technical_report` for `social_report`.

**Tables WRITTEN:**
- `technical_report` — UPDATE `report_json`, `is_finalized`, `finalized_at`, `finalized_by`
- `audit_event` — INSERT

**Finalization:** Same mechanism as social report. When case moves to `technical_approved`, inspector loses UPDATE access via RLS.

**Visibility:** Technical inspectors see reports only for cases in their district at qualifying statuses.

### What existing schema CANNOT represent (no changes proposed):
- Structured field definitions within `report_json` are application-level, not schema-level. The form fields will be defined in frontend code and serialized into the existing `jsonb` column. This is sufficient for V1.4.

---

## 3. UI Surface Concept

### Entry Point
Both interfaces are accessed from the existing case detail page (`/subsidy-cases/:id`). The current "Social Report" and "Technical Report" tabs (lines 500-550) will be replaced with structured review forms instead of raw JSON display.

No new routes required. The existing tab structure within the case detail page serves as the entry point.

### Social Review Interface (Tab: "Social Report")

**Sections:**
1. **Case Context Panel (read-only)** — Case number, applicant name, address, household size, district. Provides field worker with visit context.
2. **Social Assessment Form (editable when not finalized)** — Structured form fields serialized into `report_json`:
   - Housing condition assessment (dropdown/select)
   - Household income category (dropdown/select)
   - Number of dependents (numeric)
   - Employment status of applicant (dropdown/select)
   - Social observations (textarea, free text)
   - Recommendation (dropdown: favorable / unfavorable / needs_further_review)
3. **Finalization Section** — "Finalize Report" button with confirmation dialog. Once finalized, form becomes read-only. Button disabled until all mandatory fields are completed.
4. **Audit Note** — Reason field required before finalization, logged to `audit_event`.

### Technical Review Interface (Tab: "Technical Report")

**Sections:**
1. **Case Context Panel (read-only)** — Same as social review.
2. **Technical Inspection Form (editable when not finalized)** — Structured form fields serialized into `report_json`:
   - Property type (dropdown: existing_structure / new_construction / renovation)
   - Structural condition (dropdown: good / fair / poor / unsafe)
   - Estimated construction cost (numeric, SRD)
   - Land ownership verified (boolean)
   - Building permit status (dropdown: present / absent / not_applicable)
   - Technical observations (textarea, free text)
   - Technical recommendation (dropdown: approved / rejected / needs_revision)
3. **Finalization Section** — Same pattern as social review.
4. **Audit Note** — Same pattern.

### Safeguards Against Premature Submission
- "Finalize Report" button disabled until all mandatory form fields are filled
- Confirmation dialog before finalization: "Once finalized, this report cannot be edited. Are you sure?"
- Auto-save draft on form changes (UPDATE `report_json` without setting `is_finalized`)
- Clear visual distinction between draft state (editable, warning badge) and finalized state (read-only, success badge)

---

## 4. Governance and Audit Considerations

### Independence Between Reviews
- Social and technical reviews are enforced as independent by RLS: `social_field_worker` cannot access `technical_report` table, and vice versa
- STATUS_TRANSITIONS enforce sequencing: social must complete before technical begins (`social_completed` -> `in_technical_review`)
- No cross-contamination risk at the data level

### Risks of Partial or Premature Submission
- **Risk:** Field worker saves partial form data, then case status is changed by another role before completion
  - **Mitigation:** Draft saves to `report_json` are harmless. Finalization is a separate explicit action. Status changes are controlled by frontdesk/admin roles, not by the field worker
- **Risk:** Finalized report contains errors but cannot be edited
  - **Mitigation:** This is by design (audit integrity). Corrections require a `returned_to_social` or `returned_to_technical` status change, which creates a new review cycle

### Audit Traceability
- Every finalization writes to `audit_event` (entity_type: `social_report` or `technical_report`, action: `SOCIAL_ASSESSMENT_COMPLETED` or `TECHNICAL_INSPECTION_COMPLETED`)
- Draft saves do not require audit events (they are intermediate working states)
- The existing `useAuditLog` hook already supports these action types

---

## 5. Scope Separation — Explicitly OUT OF SCOPE

- Director review interface (Phase 4)
- Ministerial advisor review interface (Phase 4)
- Minister decision interface (Phase 4)
- Escalation or override logic
- Automatic status transitions upon finalization (status changes remain manual via existing UI)
- Structured report field schema enforcement at database level
- Report versioning or amendment tracking
- File/photo attachments to reports

---

## 6. Technical Implementation Summary

### Files to Modify
| File | Change |
|------|--------|
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Replace raw JSON display in Social Report and Technical Report tabs with structured review forms |

### Files to Create
| File | Purpose |
|------|---------|
| `src/app/(admin)/subsidy-cases/[id]/components/SocialReviewForm.tsx` | Structured social assessment form component |
| `src/app/(admin)/subsidy-cases/[id]/components/TechnicalReviewForm.tsx` | Structured technical inspection form component |
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE3_START.md` | Pre-implementation restore point |
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE3_COMPLETE.md` | Post-implementation restore point |

### No New Routes, No Menu Changes
Both interfaces live within the existing case detail page tabs.

### Dependencies
- Existing `useAuditLog` hook for audit event logging
- Existing `useUserRole` hook for role detection (to show/hide edit capabilities)
- Existing RLS policies (no changes)
- Existing `STATUS_BADGES` and `STATUS_TRANSITIONS` maps (no changes)

---

## 7. Open Questions

1. **Structured report fields:** The form fields listed above (housing condition, income category, property type, structural condition, etc.) are proposed based on typical subsidy assessment requirements. Do you want to provide an authoritative field list, or are the proposed fields acceptable for V1.4?

2. **Auto-save behavior:** Should draft saves happen on every field change (immediate) or on explicit "Save Draft" button click?

3. **Report return cycle:** When a case is returned (e.g., `returned_to_social`), should the existing report be editable again, or should a new report record be created? Current schema supports 1:1 (one report per case), so editing the existing report is the only option without schema changes.

---

## 8. Phase 3 Planning Status

Phase 3 planning is READY FOR REVIEW, pending resolution of the three open questions above.

No Phase 3 implementation has been started.
Awaiting explicit Phase 3 authorization.

