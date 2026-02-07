

# DVH-IMS V1.4 Phase 4 — Director Review, Ministerial Advisor, and Minister Decision Interfaces

## Phase Boundaries Confirmation

- Phase 4 is PLANNING ONLY
- No implementation will be started
- No new database tables or columns
- No RLS changes
- No workflow or status changes
- No new roles
- No automation of decisions
- No budget calculation logic
- No notification logic

---

## 1. Functional Intent

### A. Director Review Interface

**Decision responsibility:** Organizational approval of the subsidy dossier on behalf of the department, before it enters the ministerial advisory and political decision chain.

**What it does NOT do:** Does not calculate budgets, does not assign amounts, does not trigger automatic status transitions, does not replace the existing status change mechanism on the case detail page, does not interact with Raadvoorstel generation.

**Role:** `director`

**Workflow status:** `awaiting_director_approval` (primary), `returned_to_director` (re-review after ministerial return)

**Nature:** REVIEWS and DECIDES (organizational approval or return). The Director makes a formal binary decision: approve to proceed to ministerial chain, or return for further screening.

---

### B. Ministerial Advisor Interface

**Decision responsibility:** Provides a formal advisory opinion (paraaf/paraph) on the dossier for the Minister. This opinion is mandatory before the Minister can act. The advisor does not decide the case outcome; they advise.

**What it does NOT do:** Does not approve or reject the subsidy. Does not trigger status transitions automatically. Does not override the Director's approval. Does not interact with budget or financial logic.

**Role:** `ministerial_advisor`

**Workflow status:** `in_ministerial_advice` (primary), `returned_to_advisor` (re-review after Minister return)

**Nature:** ADVISES. Produces a formal advisory opinion. The advisor may recommend approval, recommend rejection, or recommend return. This is advice, not a decision.

---

### C. Minister Decision Interface

**Decision responsibility:** Final political authority on whether the subsidy is granted. The Minister's approval is the last gate before Raadvoorstel generation and council submission.

**What it does NOT do:** Does not calculate amounts, does not generate the Raadvoorstel, does not override RLS, does not trigger automatic document generation. Status transitions remain manual.

**Role:** `minister`

**Workflow status:** `awaiting_minister_decision` (primary)

**Nature:** DECIDES. The Minister makes the final approval or return decision. Any deviation from the Ministerial Advisor's recommendation must be explicitly motivated and logged.

---

## 2. Decision Surface Definition

### A. Director — Information Visibility

**Required visible:**
- Case overview (case number, applicant, district, household, requested amount)
- Social report summary (finalized, read-only) — recommendation + key fields
- Technical report summary (finalized, read-only) — recommendation + key fields
- Document checklist status (all required documents verified or not)
- Status history (full chronological trail)

**Must be hidden:** Nothing explicitly hidden from the Director. The Director sees the complete dossier up to this point.

**Prior recommendations:** Social and Technical recommendations are shown as read-only summaries with their respective field worker recommendations clearly labeled.

**Dissent/negative presentation:** If either social or technical recommendation is "unfavorable" or "needs_revision"/"rejected", this is visually flagged with a warning badge.

---

### B. Ministerial Advisor — Information Visibility

**Required visible:**
- Case overview
- Social report summary (finalized, read-only)
- Technical report summary (finalized, read-only)
- Director's approval confirmation and any motivation provided
- Status history

**Must be hidden:** Nothing explicitly hidden. The advisor needs full dossier context to provide informed advice.

**Prior recommendations:** Social, Technical, and Director decision are all visible as read-only summaries. The advisor sees the full chain of assessments.

**Dissent/negative presentation:** Negative assessments from prior steps are shown with warning badges. The advisor can reference disagreements in their advice motivation.

---

### C. Minister — Information Visibility

**Required visible:**
- Case overview
- Social report recommendation (summary only, not full form)
- Technical report recommendation (summary only, not full form)
- Director approval status
- Ministerial Advisor's formal advice and motivation (full text, read-only)
- Status history

**Must be hidden:** Detailed field-level social/technical data is condensed into summaries. The Minister sees recommendations and advice, not raw assessment data.

**Prior recommendations:** All prior recommendations are visible as a consolidated decision chain summary.

**Dissent/negative presentation:** If the Ministerial Advisor recommended rejection, this is prominently displayed. If the Minister decides to deviate from the advisor's recommendation, the motivation field explicitly requires acknowledgment of the deviation, and this is logged immutably.

---

## 3. Data and Audit Analysis

### Data Sources READ (all three interfaces)

| Table | Fields | Purpose |
|-------|--------|---------|
| `subsidy_case` | case_number, status, district_code, applicant_person_id, household_id, requested_amount, approved_amount | Case context |
| `person` | first_name, last_name, national_id | Applicant identity |
| `household` | household_size, district_code | Household context |
| `social_report` | report_json, is_finalized, finalized_at | Social assessment (read-only) |
| `technical_report` | report_json, is_finalized, finalized_at | Technical assessment (read-only) |
| `subsidy_document_upload` | file_name, is_verified | Document completeness |
| `subsidy_case_status_history` | from_status, to_status, reason, changed_at | Decision trail |
| `audit_event` | action, reason, metadata_json | Audit context (read-only) |

### Decision Recording (Conceptual)

Decisions are NOT recorded in separate decision tables. They are captured through:

1. **Status transition** — The existing `handleStatusChange` on the case detail page records status changes to `subsidy_case.status` and `subsidy_case_status_history`
2. **Audit event** — The `logEvent` call writes to `audit_event` with action types:
   - Director: `DIRECTOR_REVIEW_STARTED`, `DIRECTOR_APPROVED`, `DIRECTOR_RETURNED`
   - Advisor: `MINISTERIAL_ADVICE_STARTED`, `MINISTERIAL_ADVICE_COMPLETED`, `MINISTERIAL_ADVICE_RETURNED`
   - Minister: `MINISTER_DECISION_STARTED`, `MINISTER_APPROVED`, `MINISTER_RETURNED`
3. **Reason capture** — The mandatory `statusReason` field in the existing status change UI captures the motivation, which is stored in both `status_history.reason` and `audit_event.reason`

No new tables or columns are required. The existing status transition mechanism + audit logging is sufficient.

### Audit Traceability

- Every decision action writes to `audit_event` (append-only, INSERT-only)
- Actor role is captured automatically via `useAuditLog`
- `correlation_id` groups related events
- Status history provides chronological decision chain
- Minister deviation from advisor recommendation is captured in the reason field and metadata

---

## 4. Governance and Legal Considerations

### Risks of Premature or Biased Decisions

- **Risk:** Director approves without reviewing social/technical reports
  - **Mitigation:** UI displays report finalization status prominently. If either report is not finalized, a visual warning is shown (but no programmatic block — the backend transition engine already validates status sequencing)

- **Risk:** Minister decides without seeing advisor's formal advice
  - **Mitigation:** The backend transition engine enforces `ministerial_advice_complete` before `awaiting_minister_decision`. The advisor's advice is displayed prominently on the Minister's decision surface.

- **Risk:** Advisor or Minister copies prior recommendations without independent judgment
  - **Mitigation:** Each decision actor must provide their own mandatory motivation text. The motivation is logged separately and attributed to the specific actor and role.

### Risks of Decision Reversal

- **Risk:** A decision, once recorded, might need reversal
  - **Mitigation:** Decisions are immutable once logged. The only mechanism for correction is the "return" path (e.g., `returned_to_screening`, `returned_to_director`, `returned_to_advisor`), which creates a new review cycle with its own audit trail. There is no "undo" or "overwrite" of decisions.

### Separation Between Review and Decision Authority

- Social field worker and technical inspector PRODUCE information (Phase 3)
- Director REVIEWS the complete dossier and provides organizational approval
- Ministerial Advisor ADVISES based on the full chain
- Minister DECIDES with full visibility of prior advice
- Each step is sequentially enforced by the backend transition engine
- No role can skip steps or act out of turn

### Return for Revision

- Director can return to screening (`returned_to_screening`)
- Advisor can return to Director (`returned_to_director`)
- Minister can return to Advisor (`returned_to_advisor`)
- Each return creates a new status history entry and audit event
- Returned cases re-enter the review cycle at the appropriate step

---

## 5. Scope Separation — Explicitly OUT OF SCOPE

- Review Archive UI (Phase 5)
- Reporting dashboards
- Appeals / bezwaar / beroep
- Automation or AI assistance
- Financial disbursement logic
- Budget calculation or approval amount logic
- Raadvoorstel generation interface changes
- Notification enhancements
- Role changes or new roles
- Schema changes
- RLS changes
- Woningregistratie module

---

## 6. UI Surface Concept (No Design)

### Implementation Approach

All three decision interfaces will be implemented as NEW TABS on the existing case detail page (`/subsidy-cases/:id`), following the exact same Darkone pattern used for Social and Technical Report tabs in Phase 3.

### A. Director Review Tab

- **Visible when:** Case status is `awaiting_director_approval` or `returned_to_director`, OR case has passed through Director approval (historical view)
- **Sections:**
  1. Dossier summary panel (read-only): case info, applicant, district, requested amount
  2. Social report summary (read-only): recommendation + key findings from finalized report
  3. Technical report summary (read-only): recommendation + key findings from finalized report
  4. Document completeness indicator (read-only)
  5. Director motivation textarea (editable only for `director` role at qualifying status)
  6. Governance subtitle: "This review panel supports the organizational approval step. Status transitions remain manual and role-controlled."
- **Role guard:** Only `director` can interact with the motivation field and see action buttons. Other authorized roles see read-only view of any recorded Director decision.

### B. Ministerial Advisor Tab

- **Visible when:** Case status is `in_ministerial_advice` or `returned_to_advisor`, OR case has passed through advisory step
- **Sections:**
  1. Dossier summary panel (read-only)
  2. Social + Technical summaries (read-only)
  3. Director approval confirmation with Director's motivation (read-only)
  4. Advisor's formal advice textarea (editable only for `ministerial_advisor` role at qualifying status)
  5. Advisor recommendation dropdown: recommend_approval / recommend_rejection / recommend_return
  6. Governance subtitle
- **Role guard:** Only `ministerial_advisor` can interact. Others see read-only.

### C. Minister Decision Tab

- **Visible when:** Case status is `awaiting_minister_decision`, OR case has passed through Minister decision
- **Sections:**
  1. Consolidated decision chain summary (read-only): Social recommendation, Technical recommendation, Director approval, Advisor recommendation and advice text
  2. Minister's decision motivation textarea (editable only for `minister` role)
  3. If Minister's decision diverges from Advisor's recommendation: explicit deviation acknowledgment required
  4. Governance subtitle
- **Role guard:** Only `minister` can interact. Others see read-only.

### Safeguards Against Premature Action

- Motivation/advice textareas are mandatory before any status change can be triggered
- Confirmation dialog before each decision action (same pattern as Phase 3 finalization)
- No auto-save of decision motivations (unlike Phase 3 drafts — decisions are recorded only upon explicit confirmation)
- Report finalization warnings displayed if reports are not finalized

---

## 7. Technical Implementation Summary

### Files to Create
| File | Purpose |
|------|---------|
| `src/app/(admin)/subsidy-cases/[id]/components/DirectorReviewPanel.tsx` | Director organizational approval interface |
| `src/app/(admin)/subsidy-cases/[id]/components/AdvisorReviewPanel.tsx` | Ministerial Advisor advisory interface |
| `src/app/(admin)/subsidy-cases/[id]/components/MinisterDecisionPanel.tsx` | Minister final decision interface |

### Files to Modify
| File | Change |
|------|--------|
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Add three new tabs for Director, Advisor, and Minister panels |

### No New Routes, No Menu Changes, No Schema Changes

---

## 8. Open Questions

1. **Decision motivation persistence:** Director/Advisor/Minister motivations are currently captured in the status change reason field (`statusReason`). Should these decision-specific motivations also be stored in a structured `report_json`-like field on an existing table, or is the status_history + audit_event combination sufficient? (Current analysis: sufficient, no schema changes needed.)

2. **Minister deviation acknowledgment:** When the Minister deviates from the Advisor's recommendation, should the deviation acknowledgment be a simple checkbox ("I acknowledge my decision differs from the advisory recommendation") or a separate mandatory text field explaining the deviation? Both approaches are possible within existing audit structures.

3. **Tab visibility for non-decision roles:** Should `admin_staff`, `project_leader`, `system_admin`, and `audit` roles see the Director/Advisor/Minister tabs in read-only mode at all times, or only after the case has reached the relevant status? (Recommendation: show tabs once case reaches or passes the relevant status, to avoid confusion on cases still in social/technical review.)

---

## 9. Phase 4 Planning Status

Phase 4 planning is READY FOR REVIEW, pending resolution of the three open questions above.

No Phase 4 implementation has been started.
Awaiting explicit Phase 4 authorization.

