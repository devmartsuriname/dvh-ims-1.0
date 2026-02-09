# DVH-IMS V1.5 — Test Execution Pack & Bug Triage Protocol

**Version:** V1.5 (Test & Stabilization Window)
**Status:** Active — No new features authorized
**Authority:** Delroy
**Date:** 2026-02-09

---

## Table of Contents

1. [Part A: Role-Based Test Scenarios (11 scenarios)](#part-a-role-based-test-scenarios-11-scenarios)
2. [Part B: End-to-End Workflow Tests (5 tests)](#part-b-end-to-end-workflow-tests-5-tests)
3. [Part C: Bug Triage Protocol & Acceptance Criteria](#part-c-bug-triage-protocol--acceptance-criteria)

---

## Part A: Role-Based Test Scenarios (11 scenarios)

This section contains **11 role-based test scenarios** — one for each role in the implemented `app_role` enum. All role identifiers, test account emails, and district assignments are taken directly from the production database.

### Role Identifier Mapping

| Role (implemented key) | Test Account Email | Scope | District (if applicable) |
|---|---|---|---|
| `system_admin` | info@devmart.sr | National | — |
| `minister` | minister@volkshuisvesting.sr | National | — |
| `project_leader` | projectleider@volkshuisvesting.sr | National | — |
| `director` | directeur@volkshuisvesting.sr | National | — |
| `ministerial_advisor` | adviseur@volkshuisvesting.sr | National | — |
| `audit` | audit@volkshuisvesting.sr | National | — |
| `frontdesk_bouwsubsidie` | frontdesk.bs@volkshuisvesting.sr | District | PAR |
| `frontdesk_housing` | frontdesk.wr@volkshuisvesting.sr | District | PAR |
| `admin_staff` | admin.staff@volkshuisvesting.sr | District | PAR |
| `social_field_worker` | veldwerker@volkshuisvesting.sr | District | PAR |
| `technical_inspector` | inspecteur@volkshuisvesting.sr | District | PAR |

**Login route for all roles:** `/auth/sign-in`

---

### Scenario 1 — `frontdesk_bouwsubsidie`

**Module:** Bouwsubsidie
**Routes:** `/control-queue`, `/subsidy-cases`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `frontdesk_bouwsubsidie` (`frontdesk.bs@volkshuisvesting.sr`). District: PAR. At least one subsidy case exists in district PAR. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/control-queue`. |
| **Step 2** | Verify case list is filtered to district PAR only. |
| **Step 3** | Open a case detail (`/subsidy-cases/:id`). |
| **Step 4** | Upload a document against a requirement (intake completeness check). |
| **Step 5** | Verify the uploaded document appears in the document list. |
| **Step 6** | Attempt to access `/archive` — expect denied or menu item hidden. |
| **Step 7** | Attempt to access `/audit-log` — expect denied or menu item hidden. |
| **Step 8** | Attempt to access `/case-assignments` — expect denied or read-only. |
| **Expected Result** | Control Queue shows only PAR-district cases. Document upload succeeds. Restricted modules inaccessible. |
| **PASS Criteria** | All steps succeed as described; no cross-district data visible; restricted modules blocked. |
| **FAIL Criteria** | Cross-district data visible; restricted module accessible; document upload fails. |
| **Evidence** | Screenshot of Control Queue (district filter visible). Screenshot of document list after upload. Screenshot of denied access attempt. |

> **Note:** Document *verification* (marking as verified) is performed by `frontdesk_housing` for housing documents. For Bouwsubsidie, document verification is part of the intake/completeness flow performed by frontdesk. Formal review of document adequacy occurs during subsequent review stages.

---

### Scenario 2 — `frontdesk_housing`

**Module:** Woningregistratie
**Routes:** `/housing-registrations`, `/housing-registrations/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `frontdesk_housing` (`frontdesk.wr@volkshuisvesting.sr`). District: PAR. At least one housing registration exists in district PAR. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/housing-registrations`. |
| **Step 2** | Verify list is filtered to district PAR only. |
| **Step 3** | Open a registration detail (`/housing-registrations/:id`). |
| **Step 4** | Upload a housing document against a requirement. |
| **Step 5** | Toggle a document's verification status (mark as verified). |
| **Step 6** | Verify the `DOCUMENT_VERIFIED` audit event is logged. |
| **Step 7** | Attempt to access `/subsidy-cases` — expect denied or menu item hidden. |
| **Step 8** | Attempt to access `/archive` — expect denied or menu item hidden. |
| **Step 9** | Attempt to access `/audit-log` — expect denied or menu item hidden. |
| **Expected Result** | Registration list shows only PAR-district records. Document upload and verification succeed. Bouwsubsidie, Archive, and Audit Log inaccessible. |
| **PASS Criteria** | All steps succeed; module isolation enforced; verification toggle works. |
| **FAIL Criteria** | Cross-district data visible; Bouwsubsidie module accessible; document verification fails. |
| **Evidence** | Screenshot of registration list (district filter). Screenshot of verified document toggle. Screenshot of denied access. |

---

### Scenario 3 — `admin_staff`

**Module:** Bouwsubsidie (Administrative Review)
**Routes:** `/control-queue`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `admin_staff` (`admin.staff@volkshuisvesting.sr`). District: PAR. At least one case in `admin_review` status in district PAR. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/control-queue`. |
| **Step 2** | Verify cases filtered to district PAR. |
| **Step 3** | Open a case in `admin_review` status. |
| **Step 4** | Complete the administrative review (approve or return). |
| **Step 5** | Verify status transition is recorded in the Status History tab. |
| **Step 6** | Attempt to access `/case-assignments` — expect read-only or denied. |
| **Step 7** | Attempt to modify a social or technical report — expect denied (fields read-only). |
| **Expected Result** | Admin review completes. Status history updated. Cannot modify field reports or manage assignments. |
| **PASS Criteria** | Review action succeeds; status history entry created; write restrictions enforced. |
| **FAIL Criteria** | Review fails; can modify field reports; cross-district access. |
| **Evidence** | Screenshot of completed review. Screenshot of status history entry. Screenshot of read-only field report. |

---

### Scenario 4 — `social_field_worker`

**Module:** Bouwsubsidie (Social Review)
**Routes:** `/my-visits`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `social_field_worker` (`veldwerker@volkshuisvesting.sr`). District: PAR. At least one case assigned for social review. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/my-visits`. |
| **Step 2** | Verify only cases at visit-relevant workflow stages are displayed. |
| **Step 3** | Open a case and navigate to the Social Review tab. |
| **Step 4** | Draft a social report (save without finalizing). |
| **Step 5** | Navigate away and re-open the case. Verify draft is persisted. |
| **Step 6** | Finalize the social report. |
| **Step 7** | Attempt to edit the finalized report — expect all fields read-only. |
| **Step 8** | Attempt to access `/archive` — expect denied or hidden. |
| **Step 9** | Attempt to access `/audit-log` — expect denied or hidden. |
| **Expected Result** | My Visits displays correct cases. Draft save/load works. Finalization locks the report immutably. |
| **PASS Criteria** | Draft/finalize flow completes; finalized report is immutable; restricted modules hidden. |
| **FAIL Criteria** | Draft not persisted; finalized report editable; restricted access bypassed. |
| **Evidence** | Screenshot of My Visits list. Screenshot of draft saved. Screenshot of finalized (read-only) report. |

---

### Scenario 5 — `technical_inspector`

**Module:** Bouwsubsidie (Technical Review)
**Routes:** `/my-visits`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `technical_inspector` (`inspecteur@volkshuisvesting.sr`). District: PAR. At least one case assigned for technical inspection. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/my-visits`. |
| **Step 2** | Verify only cases at inspection-relevant workflow stages are displayed. |
| **Step 3** | Open a case and navigate to the Technical Review tab. |
| **Step 4** | Draft a technical report (save without finalizing). |
| **Step 5** | Navigate away and re-open the case. Verify draft is persisted. |
| **Step 6** | Finalize the technical report. |
| **Step 7** | Attempt to edit the finalized report — expect all fields read-only. |
| **Step 8** | Attempt to access `/archive` — expect denied or hidden. |
| **Step 9** | Attempt to access `/case-assignments` — expect denied or hidden. |
| **Expected Result** | My Visits displays correct cases. Draft save/load works. Finalization locks the report immutably. |
| **PASS Criteria** | Draft/finalize flow completes; finalized report is immutable; restricted modules hidden. |
| **FAIL Criteria** | Draft not persisted; finalized report editable; restricted access bypassed. |
| **Evidence** | Screenshot of My Visits list. Screenshot of draft saved. Screenshot of finalized (read-only) report. |

---

### Scenario 6 — `project_leader`

**Module:** Bouwsubsidie (Policy Review + Assignments)
**Routes:** `/control-queue`, `/subsidy-cases/:id`, `/case-assignments`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `project_leader` (`projectleider@volkshuisvesting.sr`). National scope. Cases exist at `policy_review` status. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/control-queue`. Verify all districts are visible (national scope). |
| **Step 2** | Open a case in `policy_review` status and complete the policy review. |
| **Step 3** | Navigate to `/case-assignments`. |
| **Step 4** | Create a new assignment (select case, user, role, provide mandatory reason). |
| **Step 5** | Reassign an existing assignment to a different user (provide mandatory reason). |
| **Step 6** | Revoke an assignment (provide mandatory reason). |
| **Step 7** | Navigate to `/audit-log`. Verify audit entries exist for each assignment action (create, reassign, revoke). |
| **Step 8** | Navigate to `/archive`. Verify read-only access (no edit/action buttons). |
| **Expected Result** | Policy review completes. All assignment operations succeed with mandatory reasons. Audit entries present. Archive is read-only. |
| **PASS Criteria** | All operations succeed; audit entries present for each action; archive immutable. |
| **FAIL Criteria** | Assignment operation fails; reason not enforced; missing audit entries; archive allows mutation. |
| **Evidence** | Screenshot of completed policy review. Screenshot of assignment create/reassign/revoke. Audit log entries for each action. |

---

### Scenario 7 — `director`

**Module:** Bouwsubsidie (Organizational Approval)
**Routes:** `/subsidy-cases/:id`, `/case-assignments`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `director` (`directeur@volkshuisvesting.sr`). National scope. At least one case at `awaiting_director_approval` status. Login via `/auth/sign-in`. |
| **Step 1** | Open a case at `awaiting_director_approval` status. |
| **Step 2** | Navigate to the Director Review tab. |
| **Step 3** | Approve or return the case (provide motivation). |
| **Step 4** | Verify status transition and audit entry (`DIRECTOR_APPROVED` or `DIRECTOR_RETURNED`). |
| **Step 5** | Attempt to modify dossier content (person data, documents) — expect denied. |
| **Step 6** | Navigate to `/case-assignments` — verify read-only (no create/edit/revoke buttons). |
| **Step 7** | Navigate to `/archive` — verify read-only access. |
| **Step 8** | Navigate to `/audit-log` — verify read access. |
| **Expected Result** | Director decision recorded with motivation. Cannot modify dossier content or assignments. Oversight modules accessible read-only. |
| **PASS Criteria** | Decision recorded with audit entry; write restrictions enforced; oversight access confirmed. |
| **FAIL Criteria** | Can modify dossier content; can manage assignments; decision not audited. |
| **Evidence** | Screenshot of Director Review decision. Audit log entry. Screenshot of read-only assignment list. |

---

### Scenario 8 — `ministerial_advisor`

**Module:** Bouwsubsidie (Advisory Review / Paraaf)
**Routes:** `/subsidy-cases/:id`, `/case-assignments`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `ministerial_advisor` (`adviseur@volkshuisvesting.sr`). National scope. At least one case at `advisory_review` status. Login via `/auth/sign-in`. |
| **Step 1** | Open a case at `advisory_review` status. |
| **Step 2** | Navigate to the Ministerial Advisor tab. |
| **Step 3** | Provide formal advice (recommendation + motivation). |
| **Step 4** | Verify status transition and audit entry. |
| **Step 5** | Attempt to modify dossier content — expect denied. |
| **Step 6** | Navigate to `/case-assignments` — verify read-only. |
| **Step 7** | Navigate to `/archive` — verify read-only access. |
| **Step 8** | Navigate to `/audit-log` — verify read access. |
| **Expected Result** | Advisory recommendation recorded with motivation. Cannot modify dossier content or assignments. Oversight modules accessible read-only. |
| **PASS Criteria** | Advice recorded with audit entry; write restrictions enforced; oversight access confirmed. |
| **FAIL Criteria** | Can modify dossier content; advice not audited; can manage assignments. |
| **Evidence** | Screenshot of advisory decision. Audit log entry. Screenshot of read-only assignment list. |

---

### Scenario 9 — `minister`

**Module:** Bouwsubsidie (Final Decision)
**Routes:** `/subsidy-cases/:id`, `/archive`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `minister` (`minister@volkshuisvesting.sr`). National scope. At least one case at `minister_decision` status with advisory recommendation present. Login via `/auth/sign-in`. |
| **Step 1** | Open a case at `minister_decision` status. |
| **Step 2** | Navigate to the Minister Decision tab. |
| **Step 3** | Review the Ministerial Advisor's recommendation displayed on the panel. |
| **Step 4** | Approve or reject the case. |
| **Step 5** | If deviating from advisor recommendation: verify the mandatory explanation field is enforced (cannot submit without it). |
| **Step 6** | Verify status transition and audit entry (including deviation reason if applicable). |
| **Step 7** | Attempt to modify dossier content — expect denied. |
| **Step 8** | Navigate to `/archive` — verify read-only access. |
| **Expected Result** | Minister decision recorded. Deviation from advisor requires mandatory explanation. Cannot modify dossier content. Archive accessible read-only. |
| **PASS Criteria** | Decision recorded with audit entry; deviation rule enforced; write restrictions enforced. |
| **FAIL Criteria** | Can deviate without explanation; can modify dossier content; decision not audited. |
| **Evidence** | Screenshot of Minister Decision panel. Audit log entry (with deviation reason if applicable). |

---

### Scenario 10 — `system_admin`

**Module:** All modules
**Routes:** All routes

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `system_admin` (`info@devmart.sr`). Full system access. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/dashboards` — verify access. |
| **Step 2** | Navigate to `/control-queue` — verify all districts visible (national scope). |
| **Step 3** | Navigate to `/subsidy-cases` — verify full case list. |
| **Step 4** | Navigate to `/case-assignments` — create, reassign, and revoke an assignment. |
| **Step 5** | Navigate to `/housing-registrations` — verify access. |
| **Step 6** | Navigate to `/archive` — verify read-only access (no edit/action buttons). |
| **Step 7** | Navigate to `/audit-log` — verify read access. |
| **Step 8** | Navigate to `/persons` and `/households` — verify access. |
| **Step 9** | Verify all menu items are visible in the sidebar. |
| **Expected Result** | All modules accessible. Assignment management fully functional. Archive is read-only. All sidebar menu items visible. |
| **PASS Criteria** | Full access confirmed; all operations succeed; archive immutability preserved. |
| **FAIL Criteria** | Any module inaccessible; assignment operations fail; archive allows mutation. |
| **Evidence** | Screenshot of sidebar (all items visible). Screenshot of each module accessed. |

---

### Scenario 11 — `audit`

**Module:** Cross-module (read-only verification)
**Routes:** `/control-queue`, `/subsidy-cases/:id`, `/housing-registrations/:id`, `/case-assignments`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `audit` (`audit@volkshuisvesting.sr`). National scope, strictly read-only role. Login via `/auth/sign-in`. |
| **Step 1** | Navigate to `/control-queue` — verify read access (cases visible, no action buttons). |
| **Step 2** | Open a subsidy case detail — verify read-only (no action buttons, no edit forms). |
| **Step 3** | Open a housing registration detail — verify read-only. |
| **Step 4** | Navigate to `/case-assignments` — verify read-only (no create/edit/revoke buttons). |
| **Step 5** | Navigate to `/archive` — verify read access. |
| **Step 6** | Navigate to `/audit-log` — verify read access. Confirm fields visible: actor, action, timestamp, entity type, entity ID, reason. |
| **Step 7** | Attempt any write action (upload document, verify document, create assignment, submit decision) — expect ALL denied. |
| **Expected Result** | All permitted modules accessible in read-only mode. Zero write capabilities. Audit log fields fully visible. |
| **PASS Criteria** | Read-only access confirmed across all modules; zero write capabilities available. |
| **FAIL Criteria** | Any write action available; any permitted module inaccessible; audit log fields missing. |
| **Evidence** | Screenshot of each module showing read-only state. Screenshot of audit log with all fields. |

---

## Part B: End-to-End Workflow Tests (5 tests)

### E2E-1: Bouwsubsidie Full Lifecycle

**Objective:** Verify the complete Bouwsubsidie decision chain from intake through archive.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | Public citizen | Submit application via wizard | `/bouwsubsidie/apply` | Case created with status `submitted`, case number generated |
| 2 | `frontdesk_bouwsubsidie` | Open case in Control Queue, upload documents (intake completeness) | `/control-queue`, `/subsidy-cases/:id` | Documents uploaded, status progresses |
| 3 | `project_leader` | Assign social field worker and technical inspector | `/case-assignments` | Assignments created with reasons, audit entries logged |
| 4 | `social_field_worker` | Draft and finalize social report | `/my-visits`, `/subsidy-cases/:id` | Report saved, finalized, immutable |
| 5 | `technical_inspector` | Draft and finalize technical report | `/my-visits`, `/subsidy-cases/:id` | Report saved, finalized, immutable |
| 6 | `admin_staff` | Complete administrative review | `/subsidy-cases/:id` | Status transitions to next stage |
| 7 | `project_leader` | Complete policy review | `/subsidy-cases/:id` | Status transitions to `awaiting_director_approval` |
| 8 | `director` | Approve at organizational level | `/subsidy-cases/:id` | Status transitions to `advisory_review` |
| 9 | `ministerial_advisor` | Provide formal advice (paraaf) | `/subsidy-cases/:id` | Advisory recorded, status transitions to `minister_decision` |
| 10 | `minister` | Approve or reject | `/subsidy-cases/:id` | Final decision recorded, case transitions to terminal state |
| 11 | Any oversight role | Verify case appears in Archive | `/archive`, `/archive/subsidy/:id` | Case visible, read-only, all history preserved |

**PASS:** Case progresses through all stages; each transition has a `subsidy_case_status_history` entry and `audit_event`; terminal case appears in Archive.
**FAIL:** Any stage blocks without clear error; missing audit entries; case not in Archive.

---

### E2E-2: Woningregistratie Lifecycle

**Objective:** Verify the Housing Registration flow from intake through archive.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | Public citizen | Submit housing registration via wizard | `/housing/register` | Registration created with status `received`, reference number generated |
| 2 | `frontdesk_housing` | Open registration, upload and verify documents | `/housing-registrations/:id` | Documents uploaded and verified, status progresses |
| 3 | `frontdesk_housing` | Progress registration through review stages | `/housing-registrations/:id` | Status transitions through lifecycle |
| 4 | Any oversight role | Verify terminal registration appears in Archive | `/archive`, `/archive/housing/:id` | Registration visible, read-only |

**PASS:** Registration progresses through lifecycle; documents uploaded and verified; terminal record in Archive.
**FAIL:** Status transition blocked; document verification fails; record missing from Archive.

---

### E2E-3: Assignments Lifecycle

**Objective:** Verify the full assignment lifecycle including audit trail.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | `project_leader` | Create a new assignment (select case, user, role, provide mandatory reason) | `/case-assignments` | Assignment created with status `active`, audit entry logged |
| 2 | `project_leader` | Reassign to a different user (provide mandatory reason) | `/case-assignments` | Assignment updated, new audit entry with reassignment reason |
| 3 | `project_leader` | Revoke the assignment (provide mandatory reason) | `/case-assignments` | Assignment status set to `revoked`, audit entry logged |
| 4 | `audit` | Verify all three actions appear in Audit Log | `/audit-log` | Three distinct audit entries: create, reassign, revoke — each with actor, timestamp, reason |
| 5 | `director` | View assignments — verify read-only | `/case-assignments` | Assignments visible, no create/edit/revoke buttons |

**PASS:** All assignment actions succeed with mandatory reasons; audit trail complete; read-only for oversight roles.
**FAIL:** Assignment operation fails; reason not required; audit entries missing; oversight role can mutate.

---

### E2E-4: Audit Log Verification

**Objective:** Verify audit log completeness and role-based visibility.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | `system_admin` | Navigate to Audit Log | `/audit-log` | Full log visible with all fields |
| 2 | — | Verify each entry contains fields: | — | `actor_user_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `occurred_at`, `reason`, `correlation_id` |
| 3 | `audit` | Navigate to Audit Log | `/audit-log` | Same log visible (read-only) |
| 4 | `director` | Navigate to Audit Log | `/audit-log` | Log visible (read-only) |
| 5 | `frontdesk_bouwsubsidie` | Attempt to access Audit Log | `/audit-log` | Access denied or menu item hidden |
| 6 | `social_field_worker` | Attempt to access Audit Log | `/audit-log` | Access denied or menu item hidden |

**PASS:** All required fields present in entries; oversight roles have read access; operational roles denied.
**FAIL:** Missing fields; unauthorized access; entries missing for known actions.

---

### E2E-5: Archive Verification

**Objective:** Verify archive read-only enforcement and access restrictions.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | `system_admin` | Navigate to Archive | `/archive` | Archive list visible with terminal cases (status: `finalized`, `rejected`) |
| 2 | `system_admin` | Open an archived subsidy case | `/archive/subsidy/:id` | Full case detail visible, NO edit/action buttons |
| 3 | `system_admin` | Open an archived housing registration | `/archive/housing/:id` | Full registration detail visible, NO edit/action buttons |
| 4 | `audit` | Navigate to Archive | `/archive` | Archive accessible, read-only |
| 5 | `director` | Navigate to Archive | `/archive` | Archive accessible, read-only |
| 6 | `frontdesk_bouwsubsidie` | Attempt to access Archive | `/archive` | Access denied or menu item hidden |
| 7 | `social_field_worker` | Attempt to access Archive | `/archive` | Access denied or menu item hidden |
| 8 | Any authorized role | Verify `ARCHIVE_VIEWED` audit event is created upon viewing an archived record | `/audit-log` | Audit entry with action `ARCHIVE_VIEWED` present |

**PASS:** Terminal cases visible; strictly read-only; access restricted to oversight roles; archive access audited.
**FAIL:** Non-terminal cases in archive; edit buttons present; unauthorized access; no audit trail for views.

---

## Part C: Bug Triage Protocol & Acceptance Criteria

### 1. Severity Levels

| Severity | Definition | Examples | Impact on Testing |
|----------|-----------|----------|-------------------|
| **Blocker** | System unusable or data integrity at risk. Testing cannot continue for ANY role or module. | Login fails for all users; audit log not recording; data loss; RLS bypass allowing cross-role access | ALL testing halted immediately. Escalate to Delroy. No further scenarios executed until resolved. |
| **Major** | Core functionality broken for a specific role or module. Other roles/modules may still be testable. | Cannot verify documents as `frontdesk_housing`; assignment creation fails for `project_leader`; decision chain blocked at Director stage; status transition engine error | Affected scenario marked FAIL. Other scenarios may continue. Must be fixed before overall acceptance. |
| **Minor** | Non-blocking functional issue. A workaround exists and core flow is not impeded. | Filter not clearing on Control Queue; slow page load (>5s); incorrect sort order; pagination displays wrong count | Logged and tracked. Does not block scenario PASS if core flow succeeds. Should be fixed before go-live. |
| **Cosmetic** | Visual or formatting issue with zero functional impact. | Misaligned text; icon missing; label truncated; spacing inconsistency; color mismatch | Logged for tracking. Does not block acceptance. Fix if time permits. |

### 2. Severity Decision Tree

```
Is the system unusable or is data integrity at risk?
  YES → BLOCKER
  NO  → Is core functionality broken for a role/module?
          YES → MAJOR
          NO  → Is there a functional issue (non-blocking)?
                  YES → MINOR
                  NO  → COSMETIC
```

### 3. Required Bug Report Fields

Every bug report MUST include all of the following fields. Incomplete reports will be rejected.

| Field | Description | Example |
|-------|-------------|---------|
| **Bug ID** | Unique identifier: `BUG-V15-NNN` | BUG-V15-001 |
| **Severity** | Blocker / Major / Minor / Cosmetic | Major |
| **Role** | Exact `app_role` key of the logged-in user | `frontdesk_bouwsubsidie` |
| **Module** | Bouwsubsidie / Woningregistratie / Assignments / Archive / Audit Log / Shared Core | Bouwsubsidie |
| **Route** | Exact URL where the issue occurs | `/subsidy-cases/abc-123` |
| **Steps to Reproduce** | Numbered sequence of exact actions | 1. Open case detail 2. Click "Upload Document" 3. Select file 4. Error displayed |
| **Expected Result** | What should have happened | Document uploaded and visible in list |
| **Actual Result** | What actually happened | Error: "Permission denied" |
| **Reproducibility** | Always / Intermittent / Once | Always |
| **Screenshot/Logs** | Attach if applicable | (attached) |
| **Date/Time** | When the bug was observed | 2026-02-09 14:30 |
| **Test Scenario Ref** | Which scenario and step triggered this bug | Scenario 1, Step 4 |

> **Cross-reference:** Field definitions align with `docs/DVH-IMS-V1.5/operations/06_Bug_Reporting_Process.md`. This protocol extends the operational process with testing-specific fields (Bug ID, Test Scenario Ref, Reproducibility). Severity levels in this document add "Cosmetic" as a fourth tier not present in the operational process.

### 4. Bug Triage Rules

| Rule | Description |
|------|-------------|
| **Reproducibility Required** | Only reproducible bugs may be formally logged. "It happened once but I can't reproduce it" is noted informally but not triaged. |
| **Authorization Gate** | ALL fixes require explicit authorization from Delroy before implementation. No self-service fixes. |
| **Restore Point Mandate** | Every fix MUST be preceded by a restore point. No exceptions. |
| **Scope Lock** | Fixes must address the reported defect ONLY. No scope expansion, no "while we're at it" changes. |
| **Regression Check** | After any fix, re-run the specific test scenario and step that exposed the bug to confirm resolution. |
| **No Feature Requests** | "It would be nice if..." items are logged separately and deferred. They are NOT bugs. See `06_Bug_Reporting_Process.md` Section 5 for the definitive list. |

### 5. Acceptance Criteria

| Verdict | Definition | Action |
|---------|-----------|--------|
| **PASS** | All steps in the test scenario produce the expected results. No functional defects observed. Role restrictions enforced. Audit entries present where required. | Scenario marked complete. Proceed to next scenario. |
| **FAIL** | One or more expected results not met. | File a bug report with severity classification. Scenario paused until bug is triaged. If severity is Minor or Cosmetic, scenario may still be marked conditional PASS with bug tracked. |
| **BLOCKER** | A Blocker-severity bug is identified. | ALL testing is halted immediately. Bug escalated to Delroy. Testing resumes ONLY after the fix is deployed, restore point confirmed, and regression check passed. |

### 6. Overall Acceptance Gate

| Condition | Required for Sign-Off |
|-----------|----------------------|
| All 11 role-based scenarios: PASS | ✅ Yes |
| All 5 E2E workflows: PASS | ✅ Yes |
| Zero open Blocker bugs | ✅ Yes |
| Zero open Major bugs | ✅ Yes |
| Minor bugs tracked with workarounds documented | ✅ Yes |
| Cosmetic bugs logged (fix optional) | ✅ Yes |

### 7. Test Execution Rules

| Rule | Description |
|------|-------------|
| **Sequential Execution** | Role-based scenarios (Part A) are executed first, then end-to-end workflows (Part B). |
| **Clean State** | Each scenario starts from a known state. If prior test data is required, it is documented in preconditions. |
| **One Role Per Session** | Log out and log in as the next role between scenarios. Do not switch roles within a scenario. |
| **Evidence Capture** | For each scenario, record PASS or FAIL with timestamp and evidence (screenshot/log/audit entry). |
| **No Parallel Fixes** | Do not fix bugs while testing is in progress. Complete the test cycle, triage all bugs, then fix in priority order. |

---

## Appendix: Role–Route Access Matrix (Quick Reference)

| Route | `frontdesk_bouwsubsidie` | `frontdesk_housing` | `admin_staff` | `social_field_worker` | `technical_inspector` | `project_leader` | `director` | `ministerial_advisor` | `minister` | `system_admin` | `audit` |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/control-queue` | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/my-visits` | — | — | — | ✅ | ✅ | — | — | — | — | ✅ | — |
| `/subsidy-cases` | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/case-assignments` | — | — | — | — | — | ✅ RW | ✅ RO | ✅ RO | ✅ RO | ✅ RW | ✅ RO |
| `/housing-registrations` | — | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/archive` | — | — | — | — | — | ✅ RO | ✅ RO | ✅ RO | ✅ RO | ✅ RO | ✅ RO |
| `/audit-log` | — | — | — | — | — | ✅ RO | ✅ RO | ✅ RO | — | ✅ RO | ✅ RO |
| `/persons` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/households` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend:** ✅ = Access granted | RO = Read-only | RW = Read-write | — = No access

---

*End of Test Execution Pack. No implementation performed.*
