

# DVH-IMS V1.4 — Bouwsubsidie Admin UI Deepening (Proposed Scope)

**Document Type:** Pre-Scope Analysis
**Version:** 1.4 (Proposed)
**Date:** 2026-02-02
**Authority:** Delroy
**Status:** DRAFT — AWAITING APPROVAL

---

## 1. Executive Summary

This document proposes a comprehensive Admin UI Deepening for the Bouwsubsidie module within DVH-IMS V1.4. The goal is to enhance the operational usability of the Admin interface by providing role-specific workspaces, dedicated review interfaces, and improved task management capabilities.

**Key Objectives:**
- Provide dedicated UI interfaces for each step in the 8-step Bouwsubsidie decision chain
- Enable role-specific task queues and work assignment visibility
- Create structured review interfaces for Social, Technical, Director, Advisor, and Minister roles
- Maintain historical decision archives with full audit traceability
- Preserve existing workflow states, roles, and database schema

**Scope Boundary:**
- Bouwsubsidie Admin UI only
- No changes to Woningregistratie, Public Wizard, workflow states, roles, or database schema
- Darkone Admin patterns 1:1 enforced

---

## 2. Current State Analysis

### 2.1 Existing Admin Pages (Bouwsubsidie)

| Page | Location | Description |
|------|----------|-------------|
| Subsidy Cases List | `/subsidy-cases` | Filterable list of all cases |
| Subsidy Case Detail | `/subsidy-cases/[id]` | Tabbed detail view with Overview, Documents, Social Report, Technical Report, History, Raadvoorstel |

### 2.2 Existing Workflow States (V1.3 Final)

The complete 8-step decision chain implemented in V1.3:

```text
1. Frontdesk Intake: received
2. Social Review: in_social_review -> social_completed -> returned_to_intake
3. Technical Inspection: in_technical_review -> technical_approved -> returned_to_social
4. Admin Review: in_admin_review -> admin_complete -> returned_to_technical
5. Screening/Fieldwork: screening -> needs_more_docs -> fieldwork
6. Director Approval: awaiting_director_approval -> director_approved -> returned_to_screening
7. Ministerial Advice: in_ministerial_advice -> ministerial_advice_complete -> returned_to_director
8. Minister Decision: awaiting_minister_decision -> minister_approved -> returned_to_advisor
9. Council: approved_for_council -> council_doc_generated -> finalized
Terminal: rejected
```

### 2.3 Active Roles (Bouwsubsidie)

| Role | Scope | Primary Responsibilities |
|------|-------|-------------------------|
| frontdesk_bouwsubsidie | District | Intake, case creation |
| social_field_worker | District | Social assessments, home visits |
| technical_inspector | District | Technical inspections |
| admin_staff | District | Document screening, administrative review |
| project_leader | National | Oversight, workflow coordination |
| director | National | Organizational approval |
| ministerial_advisor | National | Advisory review, paraaf |
| minister | National | Final decision authority |
| system_admin | National | System configuration |
| audit | National | Read-only audit access |

### 2.4 Current UI Gaps Identified

1. **No role-specific task queues** - All roles share the same case list view
2. **No visit scheduling interface** - Fieldwork planning is manual
3. **No dedicated review interfaces** - All reviews use the same generic tabs
4. **No decision archive** - Historical decisions are only visible in status history
5. **No workload visibility** - Roles cannot see their pending assignments

---

## 3. Module-by-Module Breakdown

### SECTION A: Control Department

---

#### Module A.1: Control Queue

**Purpose:**
Provide a role-filtered view of incoming cases requiring attention from the logged-in user's role.

**Users:**
- frontdesk_bouwsubsidie (intake queue)
- social_field_worker (social review queue)
- technical_inspector (technical review queue)
- admin_staff (admin review queue)
- director (director approval queue)
- ministerial_advisor (advice queue)
- minister (decision queue)

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case number | subsidy_case.case_number | Read |
| Applicant name | person (via applicant_person_id) | Read |
| Current status | subsidy_case.status | Read |
| District | subsidy_case.district_code | Read |
| Created date | subsidy_case.created_at | Read |
| Last updated | subsidy_case.updated_at | Read |
| Days in current status | Calculated | Read |

**Required Data (Write):**
- None (navigation to case detail only)

**Dependencies on Existing Workflow States:**
- Queue filtering based on status values relevant to each role
- Example: `social_field_worker` sees cases in `in_social_review` status

**Audit and Traceability:**
- No write operations = no new audit requirements
- Existing audit log access for read-only visibility

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| QueueTable | Table (Grid.js) | Filterable, sortable case list |
| StatusBadge | Badge | Visual status indicator |
| PriorityIndicator | Badge | Days-in-status urgency marker |
| RoleFilter | Hidden | Auto-filter by logged-in role |
| DistrictFilter | Select | District filter (for district-scoped roles) |

**Page Structure:**
```text
/control-queue
+-- PageTitle (Control Queue - [Role])
+-- Card
|   +-- CardHeader (Queue Filters)
|   +-- CardBody
|       +-- QueueTable
+-- Quick navigation to case detail
```

**Explicitly Out of Scope:**
- Case assignment functionality
- Priority override by supervisors
- Bulk operations
- Push notifications

---

#### Module A.2: My Visits

**Purpose:**
Provide Social Field Workers and Technical Inspectors with a dedicated view of their assigned visits and linked dossiers.

**Users:**
- social_field_worker
- technical_inspector

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case number | subsidy_case.case_number | Read |
| Applicant name | person | Read |
| Household address | address | Read |
| Visit type | Derived from role | Read |
| Case status | subsidy_case.status | Read |
| Report status | social_report / technical_report | Read |

**Required Data (Write):**
- None (navigation to case detail for report entry)

**Dependencies on Existing Workflow States:**
- social_field_worker: Cases in `in_social_review` status
- technical_inspector: Cases in `in_technical_review` status

**Audit and Traceability:**
- No additional audit requirements (read-only)

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| VisitsTable | Table | List of assigned cases requiring visits |
| AddressDisplay | Text | Household address for navigation |
| ReportStatusBadge | Badge | Draft/Finalized indicator |
| MapLink | Button (optional) | Link to external map (future) |

**Page Structure:**
```text
/my-visits
+-- PageTitle (My Visits)
+-- Card
|   +-- CardHeader (Visit List)
|   +-- CardBody
|       +-- VisitsTable
+-- Click to open case detail
```

**Explicitly Out of Scope:**
- GPS/Map integration
- Calendar view
- Route optimization
- Visit completion forms (use existing case detail)

---

#### Module A.3: Schedule Visits

**Purpose:**
Enable assignment of cases to Social Field Workers and Technical Inspectors for visit scheduling.

**Users:**
- admin_staff (district-level assignment)
- project_leader (national oversight)

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case number | subsidy_case | Read |
| Current status | subsidy_case | Read |
| Applicant | person | Read |
| Household address | address | Read |
| District | subsidy_case.district_code | Read |
| Available field workers | app_user_profile + user_roles | Read |

**Required Data (Write):**
- **FUTURE CONSIDERATION:** Assignment requires a new `case_assignment` table (not in current schema)
- For V1.4: UI-only planning view without persistent assignment

**Dependencies on Existing Workflow States:**
- Cases in `fieldwork` status or pre-fieldwork states

**Audit and Traceability:**
- If write operations added: Full audit trail required
- V1.4 scope: Read-only = no additional audit

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| UnassignedCasesTable | Table | Cases pending assignment |
| FieldWorkerDropdown | Select | Available workers by district |
| AssignButton | Button | Assignment action (future) |
| CalendarPreview | Panel | Weekly view placeholder |

**Page Structure:**
```text
/schedule-visits
+-- PageTitle (Schedule Visits)
+-- Row
|   +-- Col (Unassigned Cases)
|   |   +-- UnassignedCasesTable
|   +-- Col (Assignment Preview - V1.4 read-only)
|       +-- Placeholder for future calendar
```

**Explicitly Out of Scope:**
- Database schema changes for assignments
- Calendar drag-and-drop
- Email/SMS notifications
- Workload balancing algorithms

**FUTURE CONSIDERATION (V1.5+):**
- New table: `case_assignment` with fields: `case_id`, `assigned_to`, `assigned_by`, `assignment_type`, `scheduled_date`, `completed_at`
- RLS policies for assignment table
- Assignment notification integration

---

### SECTION B: Reviews and Decisions

---

#### Module B.1: Technical Review Interface

**Purpose:**
Provide Technical Inspectors with a dedicated review interface for conducting and submitting technical inspections.

**Users:**
- technical_inspector

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case details | subsidy_case | Read |
| Applicant/Household | person, household | Read |
| Uploaded documents | subsidy_document_upload | Read |
| Document requirements | subsidy_document_requirement | Read |
| Social report (if completed) | social_report | Read |

**Required Data (Write):**

| Data Element | Target Table | Access Type |
|--------------|--------------|-------------|
| Technical findings | technical_report.report_json | Write (Create/Update) |
| Report finalization | technical_report.is_finalized | Write (Update) |
| Status change | subsidy_case.status | Write (Update) |
| Status history | subsidy_case_status_history | Write (Insert) |

**Dependencies on Existing Workflow States:**
- Entry: Case status = `in_technical_review`
- Exit: `technical_approved` or `returned_to_social`

**Audit and Traceability:**
- All report updates logged via existing `useAuditLog`
- Status changes logged to `audit_event` and `subsidy_case_status_history`
- Finalization is immutable (no edits after finalization)

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| CaseSummaryPanel | Card | Read-only case overview |
| DocumentViewer | Panel | View uploaded documents |
| InspectionForm | Form | Structured findings entry |
| FindingsEditor | TextArea/JSON | Detailed findings |
| SubmitButton | Button | Finalize and submit |
| ReturnButton | Button | Return to social review |

**Page Structure (Case Detail Enhancement):**
```text
/subsidy-cases/[id] (enhanced Technical Report tab)
+-- Tab: Technical Report
|   +-- CaseSummaryPanel (read-only)
|   +-- DocumentViewer (read-only)
|   +-- InspectionForm
|   |   +-- Structural Assessment
|   |   +-- Materials Assessment
|   |   +-- Cost Estimate
|   |   +-- Recommendations
|   +-- FindingsEditor
|   +-- ActionButtons (Submit / Return)
```

**Explicitly Out of Scope:**
- Photo upload within form (use existing document upload)
- Offline mode
- PDF report generation
- Signature capture

---

#### Module B.2: Social Review Interface

**Purpose:**
Provide Social Field Workers with a dedicated review interface for conducting and submitting social assessments.

**Users:**
- social_field_worker

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case details | subsidy_case | Read |
| Applicant/Household | person, household, household_member | Read |
| Uploaded documents | subsidy_document_upload | Read |
| Contact information | contact_point | Read |

**Required Data (Write):**

| Data Element | Target Table | Access Type |
|--------------|--------------|-------------|
| Social findings | social_report.report_json | Write (Create/Update) |
| Report finalization | social_report.is_finalized | Write (Update) |
| Status change | subsidy_case.status | Write (Update) |
| Status history | subsidy_case_status_history | Write (Insert) |

**Dependencies on Existing Workflow States:**
- Entry: Case status = `in_social_review`
- Exit: `social_completed` or `returned_to_intake`

**Audit and Traceability:**
- All report updates logged via existing `useAuditLog`
- Status changes logged to `audit_event` and `subsidy_case_status_history`
- Finalization is immutable

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| HouseholdSummaryPanel | Card | Household composition display |
| ContactInfoPanel | Card | Contact details |
| SocialAssessmentForm | Form | Structured assessment entry |
| HouseholdNeedsEditor | TextArea | Detailed needs assessment |
| SubmitButton | Button | Finalize and submit |
| ReturnButton | Button | Return to intake |

**Page Structure (Case Detail Enhancement):**
```text
/subsidy-cases/[id] (enhanced Social Report tab)
+-- Tab: Social Report
|   +-- HouseholdSummaryPanel (read-only)
|   +-- ContactInfoPanel (read-only)
|   +-- SocialAssessmentForm
|   |   +-- Living Conditions
|   |   +-- Income Assessment
|   |   +-- Family Situation
|   |   +-- Recommendations
|   +-- HouseholdNeedsEditor
|   +-- ActionButtons (Submit / Return)
```

**Explicitly Out of Scope:**
- Income verification automation
- External data integrations
- Multi-step wizard within form

---

#### Module B.3: Director Review Interface

**Purpose:**
Provide Directors with a consolidated decision view for organizational approval of dossiers.

**Users:**
- director

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case details | subsidy_case | Read |
| Applicant/Household | person, household | Read |
| Social report summary | social_report | Read |
| Technical report summary | technical_report | Read |
| Document checklist status | subsidy_document_upload | Read |
| Status history | subsidy_case_status_history | Read |
| Full audit trail | audit_event | Read |

**Required Data (Write):**

| Data Element | Target Table | Access Type |
|--------------|--------------|-------------|
| Status change | subsidy_case.status | Write (Update) |
| Status history | subsidy_case_status_history | Write (Insert) |
| Approval reason | subsidy_case_status_history.reason | Write |

**Dependencies on Existing Workflow States:**
- Entry: Case status = `awaiting_director_approval`
- Exit: `director_approved` or `returned_to_screening` or `rejected`

**Audit and Traceability:**
- All Director actions logged via `DIRECTOR_APPROVED`, `DIRECTOR_RETURNED` audit actions
- Full correlation ID linkage maintained

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| DecisionSummaryCard | Card | Aggregated case summary |
| SocialReportSummary | Panel | Key social findings |
| TechnicalReportSummary | Panel | Key technical findings |
| DocumentCompliancePanel | Panel | Checklist completion status |
| AuditTrailPanel | Collapsible | Full status history |
| DecisionForm | Form | Approval/Return decision |
| ReasonTextArea | TextArea | Mandatory decision reason |

**Page Structure (Case Detail Enhancement):**
```text
/subsidy-cases/[id] (enhanced for Director role)
+-- DirectorDecisionPanel (visible when role=director)
|   +-- DecisionSummaryCard
|   +-- Row
|   |   +-- Col: SocialReportSummary
|   |   +-- Col: TechnicalReportSummary
|   +-- DocumentCompliancePanel
|   +-- AuditTrailPanel (collapsible)
|   +-- DecisionForm
|       +-- ReasonTextArea
|       +-- ActionButtons (Approve / Return / Reject)
```

**Explicitly Out of Scope:**
- Batch approval
- Delegation to deputy
- Conditional approvals

---

#### Module B.4: Ministerial Advisor Review Interface

**Purpose:**
Provide Ministerial Advisors with an advisory review interface for paraaf (initialing) before ministerial decision.

**Users:**
- ministerial_advisor

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case details | subsidy_case | Read |
| Applicant/Household | person, household | Read |
| Social report | social_report | Read |
| Technical report | technical_report | Read |
| Director approval record | subsidy_case_status_history | Read |
| Document checklist | subsidy_document_upload | Read |
| Requested/Approved amounts | subsidy_case | Read |

**Required Data (Write):**

| Data Element | Target Table | Access Type |
|--------------|--------------|-------------|
| Status change | subsidy_case.status | Write (Update) |
| Status history | subsidy_case_status_history | Write (Insert) |
| Advisory note | subsidy_case_status_history.reason | Write |

**Dependencies on Existing Workflow States:**
- Entry: Case status = `in_ministerial_advice`
- Exit: `ministerial_advice_complete` or `returned_to_director` or `rejected`

**Audit and Traceability:**
- All Advisor actions logged via `MINISTERIAL_ADVICE_COMPLETED`, `MINISTERIAL_ADVICE_RETURNED`
- Advisory notes preserved in status history

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| CaseOverviewCard | Card | Full case summary |
| ReportsSummaryRow | Row | Side-by-side social/technical summaries |
| DirectorDecisionCard | Card | Director's approval and reason |
| AmountsSummaryCard | Card | Requested vs recommended amounts |
| AdvisoryForm | Form | Advice input |
| AdvisoryNoteTextArea | TextArea | Formal advice text |
| ActionButtons | Buttons | Complete Advice / Return / Reject |

**Page Structure:**
```text
/subsidy-cases/[id] (enhanced for Ministerial Advisor role)
+-- AdvisorReviewPanel (visible when role=ministerial_advisor)
|   +-- CaseOverviewCard
|   +-- ReportsSummaryRow
|   +-- DirectorDecisionCard
|   +-- AmountsSummaryCard
|   +-- AdvisoryForm
|       +-- AdvisoryNoteTextArea
|       +-- ActionButtons
```

**Explicitly Out of Scope:**
- Digital signature/paraaf capture
- Multi-advisor workflow
- Advisory templates

---

#### Module B.5: Minister Decision Interface

**Purpose:**
Provide the Minister with a final decision interface for approving or rejecting subsidy applications.

**Users:**
- minister

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case details | subsidy_case | Read |
| Applicant/Household summary | person, household | Read |
| All reports (social, technical) | social_report, technical_report | Read |
| Director approval | subsidy_case_status_history | Read |
| Advisor advice | subsidy_case_status_history | Read |
| Full decision history | subsidy_case_status_history | Read |
| Amounts (requested, approved) | subsidy_case | Read |

**Required Data (Write):**

| Data Element | Target Table | Access Type |
|--------------|--------------|-------------|
| Status change | subsidy_case.status | Write (Update) |
| Approved amount | subsidy_case.approved_amount | Write (Update) |
| Status history | subsidy_case_status_history | Write (Insert) |
| Decision reason | subsidy_case_status_history.reason | Write |

**Dependencies on Existing Workflow States:**
- Entry: Case status = `awaiting_minister_decision`
- Exit: `minister_approved` or `returned_to_advisor` or `rejected`

**Audit and Traceability:**
- All Minister actions logged via `MINISTER_APPROVED`, `MINISTER_RETURNED`
- Decision reason mandatory and immutable once recorded
- Correlation ID linkage to full decision chain

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| ExecutiveSummaryCard | Card | High-level case summary |
| DecisionChainTimeline | Timeline | Visual decision path |
| AdvisorAdviceCard | Card | Ministerial Advisor's recommendation |
| AmountsDecisionCard | Card | Amount input (if approving) |
| DecisionForm | Form | Final decision input |
| DecisionReasonTextArea | TextArea | Mandatory decision reason |
| FinalActionButtons | Buttons | Approve / Return / Reject |

**Page Structure:**
```text
/subsidy-cases/[id] (enhanced for Minister role)
+-- MinisterDecisionPanel (visible when role=minister)
|   +-- ExecutiveSummaryCard
|   +-- DecisionChainTimeline
|   +-- AdvisorAdviceCard
|   +-- AmountsDecisionCard (editable approved_amount)
|   +-- DecisionForm
|       +-- DecisionReasonTextArea
|       +-- FinalActionButtons
```

**Explicitly Out of Scope:**
- Digital signature
- Delegation authority
- Conditional approvals
- Multi-case batch decisions

---

#### Module B.6: Review Archive

**Purpose:**
Provide a historical archive of all completed decisions, filterable by status, date, and role.

**Users:**
- All roles with case access (read-only for historical records)
- Primary users: project_leader, director, ministerial_advisor, minister, audit

**Required Data (Read-Only):**

| Data Element | Source Table | Access Type |
|--------------|--------------|-------------|
| Case number | subsidy_case | Read |
| Final status | subsidy_case.status | Read |
| Applicant | person | Read |
| District | subsidy_case.district_code | Read |
| Finalization date | subsidy_case.updated_at | Read |
| Approved amount | subsidy_case.approved_amount | Read |
| Decision history | subsidy_case_status_history | Read |

**Required Data (Write):**
- None (archive is read-only)

**Dependencies on Existing Workflow States:**
- Cases in terminal states: `finalized`, `rejected`

**Audit and Traceability:**
- Read-only = no new audit requirements
- Archive access itself may be logged (optional)

**UI Components:**

| Component | Type | Description |
|-----------|------|-------------|
| ArchiveFilters | Form | Date range, status, district filters |
| ArchiveTable | Table | Historical case list |
| OutcomeBadge | Badge | Finalized/Rejected indicator |
| AmountDisplay | Text | Approved amount (if applicable) |
| ViewDetailButton | Button | Navigate to case detail |
| ExportButton | Button | CSV/PDF export |

**Page Structure:**
```text
/review-archive
+-- PageTitle (Review Archive)
+-- Card
|   +-- CardHeader (Filters + Export)
|   |   +-- ArchiveFilters
|   |   +-- ExportButton
|   +-- CardBody
|       +-- ArchiveTable
```

**Explicitly Out of Scope:**
- Statistical analytics
- Trend visualization
- Comparison tools

---

## 4. Dependency Map

### 4.1 UI Component Dependencies

```text
Shared Components (existing):
+-- PageTitle
+-- Card, CardHeader, CardBody
+-- Table (react-bootstrap)
+-- Grid (gridjs-react)
+-- Badge
+-- Button
+-- Form, FormControl, FormSelect
+-- Tabs, Tab
+-- Spinner
+-- IconifyIcon

New Components (to be created):
+-- QueueTable (extends existing CaseTable pattern)
+-- VisitsTable (similar pattern)
+-- DecisionSummaryCard (new)
+-- ReportSummaryPanel (new)
+-- DecisionChainTimeline (new)
+-- DecisionForm (new)
+-- ArchiveFilters (extends AuditLogFilters pattern)
```

### 4.2 Data Dependencies

```text
subsidy_case
+-- person (applicant_person_id FK)
+-- household (household_id FK)
|   +-- household_member
|   +-- address
+-- subsidy_document_upload
|   +-- subsidy_document_requirement
+-- social_report
+-- technical_report
+-- subsidy_case_status_history
+-- generated_document
```

### 4.3 Hook Dependencies

```text
Existing Hooks (reusable):
+-- useUserRole (role-based access)
+-- useAuditLog (event logging)
+-- useAuditEvents (event retrieval)
+-- useAdminNotifications (notifications)
+-- useFileUploader (document handling)
+-- useToggle (modal state)

New Hooks (to be created):
+-- useControlQueue (queue data + filtering)
+-- useMyVisits (visit data for field workers)
+-- useDecisionSummary (aggregated case data for decisions)
+-- useReviewArchive (archived case retrieval)
```

### 4.4 Route Dependencies

```text
Existing Routes:
+-- /subsidy-cases
+-- /subsidy-cases/[id]
+-- /dashboards
+-- /audit-log

New Routes (proposed):
+-- /control-queue (Module A.1)
+-- /my-visits (Module A.2)
+-- /schedule-visits (Module A.3 - read-only V1.4)
+-- /review-archive (Module B.6)
```

---

## 5. Explicit Out-of-Scope

The following items are explicitly excluded from V1.4 scope:

### 5.1 Workflow and Roles

| Item | Reason |
|------|--------|
| New workflow states | V1.3 chain is complete and enforced |
| New roles | All 11 roles are active |
| Role permission changes | RLS policies are locked |
| Workflow transition changes | Trigger logic is finalized |

### 5.2 Database Schema

| Item | Reason |
|------|--------|
| New tables | No schema changes authorized |
| Column additions | Existing schema sufficient for UI |
| RLS policy changes | Security policies are frozen |
| Enum modifications | app_role enum is complete |

**FUTURE CONSIDERATION (V1.5+):**
- `case_assignment` table for Module A.3 (Schedule Visits)
- `visit_schedule` table for calendar integration

### 5.3 Other Modules

| Item | Reason |
|------|--------|
| Woningregistratie UI | Separate module, separate version |
| Public Wizard changes | Public interface is stable |
| Landing page changes | V1.3 NL localization is complete |
| Status Tracker changes | Public interface is stable |

### 5.4 Integrations

| Item | Reason |
|------|--------|
| External map services | Future consideration |
| Email/SMS notifications | External channel integration |
| Calendar sync | Requires external services |
| Digital signature | Requires legal framework |

---

## 6. Risks and Open Questions

### 6.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with large case lists | Medium | Pagination, filtering, lazy loading |
| Role-based UI complexity | Medium | Clear role detection, conditional rendering |
| Darkone pattern deviation | High | Strict code review, pattern adherence |
| Mobile responsiveness | Low | Darkone is desktop-first; defer mobile optimization |

### 6.2 Governance Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep into schema changes | High | Explicit scope boundary enforcement |
| Feature requests during implementation | Medium | Defer to V1.5 backlog |
| Role permission misalignment | High | Verify RLS policies before each phase |

### 6.3 Open Questions

| Question | Status | Decision Needed By |
|----------|--------|-------------------|
| Should Schedule Visits be read-only or include DB changes? | PROPOSED: Read-only for V1.4 | Before Phase 2 |
| Should review interfaces be new pages or enhanced tabs? | PROPOSED: Enhanced tabs | Before Phase 3 |
| Export format for Review Archive? | PROPOSED: CSV + PDF | Before Phase 4 |
| Should Control Queue show cross-district for national roles? | PROPOSED: Yes | Before Phase 1 |

---

## 7. Proposed Phase Breakdown for V1.4

### Phase 1: Control Queue and My Visits

**Scope:**
- Module A.1: Control Queue (role-filtered case list)
- Module A.2: My Visits (field worker view)
- Menu integration for new pages
- Role-based access control

**Estimated Effort:** 2-3 days

**Deliverables:**
- `/control-queue` page with role-based filtering
- `/my-visits` page for social_field_worker and technical_inspector
- Updated menu-items.ts with new entries
- Route configuration updates

---

### Phase 2: Schedule Visits (Read-Only)

**Scope:**
- Module A.3: Schedule Visits (read-only planning view)
- Unassigned cases list
- Field worker availability display

**Estimated Effort:** 1-2 days

**Deliverables:**
- `/schedule-visits` page (read-only)
- Placeholder for future assignment functionality
- Documentation of future schema requirements

---

### Phase 3: Review Interface Enhancements

**Scope:**
- Module B.1: Technical Review Interface (enhanced tab)
- Module B.2: Social Review Interface (enhanced tab)
- Structured form components for reports

**Estimated Effort:** 3-4 days

**Deliverables:**
- Enhanced Social Report tab with form structure
- Enhanced Technical Report tab with form structure
- New form components for assessments
- Report finalization improvements

---

### Phase 4: Decision Interfaces

**Scope:**
- Module B.3: Director Review Interface
- Module B.4: Ministerial Advisor Review Interface
- Module B.5: Minister Decision Interface
- Role-specific decision panels

**Estimated Effort:** 3-4 days

**Deliverables:**
- Role-specific decision panels in case detail
- Decision summary components
- Decision chain timeline component
- Amount editing for Minister (approved_amount)

---

### Phase 5: Review Archive and Polish

**Scope:**
- Module B.6: Review Archive page
- Export functionality (CSV)
- UI polish and consistency review
- Documentation finalization

**Estimated Effort:** 2-3 days

**Deliverables:**
- `/review-archive` page
- Export functionality
- Final UI consistency pass
- V1.4 completion documentation

---

## 8. Summary

### Total Estimated Effort

| Phase | Days |
|-------|------|
| Phase 1 | 2-3 |
| Phase 2 | 1-2 |
| Phase 3 | 3-4 |
| Phase 4 | 3-4 |
| Phase 5 | 2-3 |
| **Total** | **11-16 days** |

### Key Constraints

1. **Darkone Admin 1:1** - All UI must follow established patterns
2. **No Schema Changes** - Existing tables only
3. **No Workflow Changes** - V1.3 states are frozen
4. **No Role Changes** - 11 roles are final
5. **Bouwsubsidie Only** - Woningregistratie is out of scope

### Success Criteria

- All 8 modules implemented and functional
- Role-based access enforced for each module
- Audit trail maintained for all write operations
- No console errors in production
- Darkone pattern compliance verified

---

## 9. Document Status

| Attribute | Value |
|-----------|-------|
| Document Version | 1.0 (Draft) |
| Created | 2026-02-02 |
| Author | Lovable AI (Pre-Scope Analysis) |
| Authority | Delroy |
| Status | **AWAITING APPROVAL** |

---

## 10. Stop Condition

This document is a PLANNING ARTIFACT only.

**NO IMPLEMENTATION IS AUTHORIZED.**

Upon approval:
1. Document will be saved to `docs/DVH-IMS-V1.4/V1.4_Bouwsubsidie_Admin_UI_Deepening_Proposed_Scope.md`
2. V1.4 execution phases may be authorized individually
3. Each phase requires explicit authorization before implementation

---

**END OF V1.4 PROPOSED SCOPE DOCUMENT**

---

**STOP CONDITION REACHED**

- Pre-scope analysis complete
- NO implementation authorized
- Awaiting explicit approval for:
  - Document finalization
  - V1.4 Phase 1 execution authorization

