# DVH-IMS V1.5 — Test Execution Pack & Bug Triage Protocol

**Version:** V1.5 (Test & Stabilization Window)
**Status:** Active — No new features authorized
**Authority:** Delroy
**Date:** 2026-02-09

---

## Table of Contents

1. [Part A: Role-Based Test Scenarios](#part-a-role-based-test-scenarios)
2. [Part B: End-to-End Workflow Tests](#part-b-end-to-end-workflow-tests)
3. [Part C: Bug Triage Protocol & Acceptance Criteria](#part-c-bug-triage-protocol--acceptance-criteria)

---

## Part A: Role-Based Test Scenarios

### Scenario 1 — `frontdesk_bouwsubsidie`

**Module:** Bouwsubsidie
**Routes:** `/control-queue`, `/subsidy-cases`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `frontdesk_bouwsubsidie`. District-scoped user. At least one subsidy case exists in the user's district. |
| **Actions** | 1. Navigate to `/control-queue`. 2. Verify case list is filtered to own district. 3. Open a case detail. 4. Upload a document against a requirement. 5. Mark a document as verified. 6. Attempt to access `/archive` — expect denied. 7. Attempt to access `/audit-log` — expect denied. 8. Attempt to access `/case-assignments` — expect denied or read-only. |
| **Expected Results** | Control Queue shows only own-district cases. Document upload and verification succeed. Archive, Audit Log, and Case Assignments are inaccessible or hidden. |
| **PASS Criteria** | All expected results met; no access to restricted modules. |
| **FAIL Criteria** | Cross-district data visible; restricted module accessible; document operation fails. |

---

### Scenario 2 — `frontdesk_housing`

**Module:** Woningregistratie
**Routes:** `/housing-registrations`, `/housing-registrations/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `frontdesk_housing`. District-scoped user. At least one housing registration exists in the user's district. |
| **Actions** | 1. Navigate to `/housing-registrations`. 2. Verify list is filtered to own district. 3. Open a registration detail. 4. Upload a housing document. 5. Verify a housing document. 6. Attempt to access `/subsidy-cases` — expect denied. 7. Attempt to access `/archive` — expect denied. 8. Attempt to access `/audit-log` — expect denied. |
| **Expected Results** | Registration list shows only own-district records. Document upload and verification succeed. Bouwsubsidie, Archive, and Audit Log are inaccessible. |
| **PASS Criteria** | All expected results met; module isolation enforced. |
| **FAIL Criteria** | Cross-district data visible; Bouwsubsidie module accessible; document operation fails. |

---

### Scenario 3 — `admin_staff`

**Module:** Bouwsubsidie (read + administrative review)
**Routes:** `/control-queue`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `admin_staff`. District-scoped user. At least one case in `admin_review` status exists. |
| **Actions** | 1. Navigate to `/control-queue`. 2. Verify cases filtered to own district. 3. Open a case in `admin_review` status. 4. Complete the administrative review (approve/return). 5. Verify status transition recorded in status history. 6. Attempt to access `/case-assignments` — expect read-only or denied. 7. Attempt to modify a social or technical report — expect denied. |
| **Expected Results** | Admin review completes successfully. Status history updated. Cannot modify field reports or manage assignments. |
| **PASS Criteria** | Review action succeeds; write restrictions enforced. |
| **FAIL Criteria** | Review fails; can modify field reports; cross-district access. |

---

### Scenario 4 — `social_field_worker`

**Module:** Bouwsubsidie (Social Review)
**Routes:** `/my-visits`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `social_field_worker`. At least one case assigned for social review. |
| **Actions** | 1. Navigate to `/my-visits`. 2. Verify only cases at visit-relevant stages are shown. 3. Open a case and navigate to the Social Review tab. 4. Draft a social report (save without finalizing). 5. Re-open and verify draft is persisted. 6. Finalize the social report. 7. Attempt to edit the finalized report — expect denied. 8. Attempt to access `/archive` — expect denied. 9. Attempt to access `/audit-log` — expect denied. |
| **Expected Results** | My Visits displays correct cases. Draft save/load works. Finalization locks the report. Archive and Audit Log inaccessible. |
| **PASS Criteria** | Draft/finalize flow works; finalized report is immutable; restricted modules hidden. |
| **FAIL Criteria** | Draft not persisted; finalized report editable; restricted access bypassed. |

---

### Scenario 5 — `technical_inspector`

**Module:** Bouwsubsidie (Technical Review)
**Routes:** `/my-visits`, `/subsidy-cases/:id`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `technical_inspector`. At least one case assigned for technical inspection. |
| **Actions** | 1. Navigate to `/my-visits`. 2. Verify only cases at inspection-relevant stages are shown. 3. Open a case and navigate to the Technical Review tab. 4. Draft a technical report (save without finalizing). 5. Re-open and verify draft is persisted. 6. Finalize the technical report. 7. Attempt to edit the finalized report — expect denied. 8. Attempt to access `/archive` — expect denied. 9. Attempt to access `/case-assignments` — expect denied. |
| **Expected Results** | My Visits displays correct cases. Draft save/load works. Finalization locks the report. Archive and Case Assignments inaccessible. |
| **PASS Criteria** | Draft/finalize flow works; finalized report is immutable; restricted modules hidden. |
| **FAIL Criteria** | Draft not persisted; finalized report editable; restricted access bypassed. |

---

### Scenario 6 — `project_leader`

**Module:** Bouwsubsidie (Policy Review + Assignments)
**Routes:** `/control-queue`, `/subsidy-cases/:id`, `/case-assignments`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `project_leader`. National-level role. Cases exist at `policy_review` status. |
| **Actions** | 1. Navigate to `/control-queue`. 2. Verify all districts are visible (national scope). 3. Open a case in `policy_review` status and complete the policy review. 4. Navigate to `/case-assignments`. 5. Create a new assignment (select case, user, role, provide reason). 6. Reassign an existing assignment (provide reason). 7. Revoke an assignment (provide reason). 8. Verify each action created an audit entry in `/audit-log`. 9. Navigate to `/archive` and verify read-only access. |
| **Expected Results** | Policy review completes. All assignment operations succeed with mandatory reasons. Audit entries recorded for each action. Archive is read-only. |
| **PASS Criteria** | All operations succeed; audit entries present; no write access to archive. |
| **FAIL Criteria** | Assignment operation fails; missing audit entries; archive allows mutation. |

---

### Scenario 7 — `director`

**Module:** Bouwsubsidie (Organizational Approval)
**Routes:** `/subsidy-cases/:id`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `director`. National-level role. At least one case at `org_approval` status. |
| **Actions** | 1. Open a case at `org_approval` status. 2. Navigate to Director Review tab. 3. Approve or return the case (provide motivation). 4. Verify status transition and audit entry. 5. Attempt to modify dossier content (person data, documents) — expect denied. 6. Attempt to manage assignments at `/case-assignments` — expect read-only. 7. Navigate to `/archive` — verify read-only access. 8. Navigate to `/audit-log` — verify read access. |
| **Expected Results** | Director decision recorded with motivation. Cannot modify dossier content or assignments. Archive and Audit Log accessible as read-only. |
| **PASS Criteria** | Decision recorded; write restrictions enforced; oversight access confirmed. |
| **FAIL Criteria** | Can modify dossier content; can manage assignments; decision not audited. |

---

### Scenario 8 — `ministerial_advisor`

**Module:** Bouwsubsidie (Advisory Review / Paraaf)
**Routes:** `/subsidy-cases/:id`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `ministerial_advisor`. National-level role. At least one case at `advisory_review` status. |
| **Actions** | 1. Open a case at `advisory_review` status. 2. Navigate to Ministerial Advisor tab. 3. Provide formal advice (recommendation + motivation). 4. Verify status transition and audit entry. 5. Attempt to modify dossier content — expect denied. 6. Attempt to manage assignments — expect denied. 7. Navigate to `/archive` — verify read-only access. 8. Navigate to `/audit-log` — verify read access. |
| **Expected Results** | Advisory recommendation recorded with motivation. Cannot modify dossier content or assignments. Oversight modules accessible read-only. |
| **PASS Criteria** | Advice recorded; write restrictions enforced; oversight access confirmed. |
| **FAIL Criteria** | Can modify dossier content; advice not audited; can manage assignments. |

---

### Scenario 9 — `minister`

**Module:** Bouwsubsidie (Final Decision)
**Routes:** `/subsidy-cases/:id`, `/archive`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `minister`. National-level role. At least one case at `minister_decision` status with advisory recommendation present. |
| **Actions** | 1. Open a case at `minister_decision` status. 2. Navigate to Minister Decision tab. 3. Review the Ministerial Advisor's recommendation. 4. Approve or reject the case. 5. If deviating from advisor recommendation, verify mandatory explanation field is enforced. 6. Verify status transition and audit entry (including deviation reason if applicable). 7. Attempt to modify dossier content — expect denied. 8. Navigate to `/archive` — verify read-only access. |
| **Expected Results** | Minister decision recorded. Deviation from advisor requires mandatory explanation. Cannot modify dossier content. Archive accessible read-only. |
| **PASS Criteria** | Decision recorded; deviation rule enforced; write restrictions enforced. |
| **FAIL Criteria** | Can deviate without explanation; can modify dossier content; decision not audited. |

---

### Scenario 10 — `system_admin`

**Module:** All modules
**Routes:** All routes

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `system_admin`. Full system access. |
| **Actions** | 1. Navigate to `/dashboards` — verify access. 2. Navigate to `/control-queue` — verify all districts visible. 3. Navigate to `/subsidy-cases` — verify full list. 4. Navigate to `/case-assignments` — create, reassign, revoke assignments. 5. Navigate to `/housing-registrations` — verify access. 6. Navigate to `/archive` — verify read-only access. 7. Navigate to `/audit-log` — verify read access. 8. Navigate to `/persons` and `/households` — verify access. 9. Verify all menu items are visible in the sidebar. |
| **Expected Results** | All modules accessible. Assignment management fully functional. Archive is read-only. All sidebar menu items visible. |
| **PASS Criteria** | Full access confirmed; all operations succeed; archive immutability preserved. |
| **FAIL Criteria** | Any module inaccessible; assignment operations fail; archive allows mutation. |

---

### Scenario 11 — `audit`

**Module:** Cross-module (read-only verification)
**Routes:** `/control-queue`, `/subsidy-cases/:id`, `/housing-registrations/:id`, `/archive`, `/audit-log`

| Item | Detail |
|------|--------|
| **Preconditions** | Logged in as `audit`. National-level, strictly read-only role. |
| **Actions** | 1. Navigate to `/control-queue` — verify read access. 2. Open a subsidy case detail — verify read-only (no action buttons). 3. Open a housing registration detail — verify read-only. 4. Navigate to `/archive` — verify read access. 5. Navigate to `/audit-log` — verify read access, confirm fields visible: actor, action, timestamp, entity, reason. 6. Attempt any write action (upload, verify, assign, decide) — expect all denied. 7. Attempt to access `/case-assignments` — expect read-only. |
| **Expected Results** | All permitted modules accessible in read-only mode. No write actions available. Audit log fields fully visible. |
| **PASS Criteria** | Read-only access confirmed across all modules; zero write capabilities. |
| **FAIL Criteria** | Any write action available; any module inaccessible; audit log fields missing. |

---

## Part B: End-to-End Workflow Tests

### E2E-1: Bouwsubsidie Full Lifecycle

**Objective:** Verify the complete Bouwsubsidie decision chain from intake through archive.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | Public citizen | Submit application via wizard | `/bouwsubsidie/apply` | Case created with status `submitted`, case number generated |
| 2 | `frontdesk_bouwsubsidie` | Open case in Control Queue, verify documents | `/control-queue`, `/subsidy-cases/:id` | Documents uploaded and verified, status progresses |
| 3 | `project_leader` | Assign social field worker and technical inspector | `/case-assignments` | Assignments created with reasons, audit entries logged |
| 4 | `social_field_worker` | Draft and finalize social report | `/my-visits`, `/subsidy-cases/:id` | Report saved, finalized, immutable |
| 5 | `technical_inspector` | Draft and finalize technical report | `/my-visits`, `/subsidy-cases/:id` | Report saved, finalized, immutable |
| 6 | `admin_staff` | Complete administrative review | `/subsidy-cases/:id` | Status transitions to next stage |
| 7 | `project_leader` | Complete policy review | `/subsidy-cases/:id` | Status transitions to `org_approval` |
| 8 | `director` | Approve at organizational level | `/subsidy-cases/:id` | Status transitions to `advisory_review` |
| 9 | `ministerial_advisor` | Provide formal advice (paraaf) | `/subsidy-cases/:id` | Advisory recorded, status transitions to `minister_decision` |
| 10 | `minister` | Approve or reject | `/subsidy-cases/:id` | Final decision recorded, case transitions to terminal state |
| 11 | Any oversight role | Verify case appears in Archive | `/archive` | Case visible, read-only, all history preserved |

**PASS:** Case progresses through all 8 stages; each transition has a status_history entry and audit_event; terminal case appears in Archive.
**FAIL:** Any stage blocks without clear error; missing audit entries; case not in Archive.

---

### E2E-2: Woningregistratie Lifecycle

**Objective:** Verify the Housing Registration flow from intake through archive.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | Public citizen | Submit housing registration via wizard | `/housing/register` | Registration created with status `received`, reference number generated |
| 2 | `frontdesk_housing` | Open registration, verify documents | `/housing-registrations/:id` | Documents verified, status progresses |
| 3 | `frontdesk_housing` | Progress registration through review stages | `/housing-registrations/:id` | Status transitions through lifecycle |
| 4 | Any oversight role | Verify terminal registration appears in Archive | `/archive` | Registration visible, read-only |

**PASS:** Registration progresses through lifecycle; documents verified; terminal record in Archive.
**FAIL:** Status transition blocked; document verification fails; record missing from Archive.

---

### E2E-3: Assignments Lifecycle

**Objective:** Verify the full assignment lifecycle including audit trail.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | `project_leader` | Create a new assignment (select case, user, role, reason) | `/case-assignments` | Assignment created with status `active`, audit entry logged |
| 2 | `project_leader` | Reassign to a different user (provide reason) | `/case-assignments` | Assignment updated, new audit entry with reassignment reason |
| 3 | `project_leader` | Revoke the assignment (provide reason) | `/case-assignments` | Assignment status set to `revoked`, audit entry logged |
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
| 2 | Verify fields | Check each entry contains: | — | `actor_user_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `occurred_at`, `reason`, `correlation_id` |
| 3 | `audit` | Navigate to Audit Log | `/audit-log` | Same log visible (read-only) |
| 4 | `director` | Navigate to Audit Log | `/audit-log` | Log visible (read-only) |
| 5 | `frontdesk_bouwsubsidie` | Attempt to access Audit Log | `/audit-log` | Access denied or menu item hidden |
| 6 | `social_field_worker` | Attempt to access Audit Log | `/audit-log` | Access denied or menu item hidden |

**PASS:** All required fields present; oversight roles have read access; operational roles denied.
**FAIL:** Missing fields; unauthorized access; entries missing for known actions.

---

### E2E-5: Archive Verification

**Objective:** Verify archive read-only enforcement and access restrictions.

| Step | Actor | Action | Route | Expected Outcome |
|------|-------|--------|-------|-------------------|
| 1 | `system_admin` | Navigate to Archive | `/archive` | Archive list visible with terminal cases |
| 2 | `system_admin` | Open an archived subsidy case | `/archive/subsidy/:id` | Full case detail visible, NO edit/action buttons |
| 3 | `system_admin` | Open an archived housing registration | `/archive/housing/:id` | Full registration detail visible, NO edit/action buttons |
| 4 | `audit` | Navigate to Archive | `/archive` | Archive accessible, read-only |
| 5 | `director` | Navigate to Archive | `/archive` | Archive accessible, read-only |
| 6 | `frontdesk_bouwsubsidie` | Attempt to access Archive | `/archive` | Access denied or menu item hidden |
| 7 | `social_field_worker` | Attempt to access Archive | `/archive` | Access denied or menu item hidden |
| 8 | Any authorized role | Verify `ARCHIVE_VIEWED` audit event is created | `/audit-log` | Audit entry with `entity_type: 'archive'` and action `ARCHIVE_VIEWED` |

**PASS:** Terminal cases visible; strictly read-only; access restricted to oversight roles; archive access audited.
**FAIL:** Non-terminal cases in archive; edit buttons present; unauthorized access; no audit trail for views.

---

## Part C: Bug Triage Protocol & Acceptance Criteria

### 1. Severity Levels

| Severity | Definition | Examples | SLA |
|----------|-----------|----------|-----|
| **Blocker** | System unusable or data integrity at risk. Testing cannot continue. | Login fails; audit log not recording; data loss; RLS bypass | Must be fixed before any other testing continues |
| **Major** | Core functionality broken for a role or module. Workaround may exist. | Cannot verify documents; assignment creation fails; decision chain blocked; status transition fails | Must be fixed before phase can be marked PASS |
| **Minor** | Non-blocking functional issue. Workaround exists. | Filter not clearing; slow page load; incorrect sort order; pagination issue | Should be fixed but does not block acceptance |
| **Cosmetic** | Visual or formatting issue. No functional impact. | Misaligned text; icon missing; label truncated; spacing inconsistency | Fix if time permits; does not block acceptance |

### 2. Required Bug Report Fields

Every bug report MUST include all of the following fields. Incomplete reports will be rejected.

| Field | Description | Example |
|-------|-------------|---------|
| **Bug ID** | Unique identifier (auto-assigned or manual) | BUG-V15-001 |
| **Severity** | Blocker / Major / Minor / Cosmetic | Major |
| **Role** | The role logged in when the bug was observed | `frontdesk_bouwsubsidie` |
| **Module** | Bouwsubsidie / Woningregistratie / Assignments / Archive / Audit Log / Shared Core | Bouwsubsidie |
| **Route** | The URL or page where the issue occurs | `/subsidy-cases/abc-123` |
| **Steps to Reproduce** | Numbered sequence of exact actions | 1. Open case detail 2. Click "Verify Document" 3. Error displayed |
| **Expected Result** | What should have happened | Document marked as verified |
| **Actual Result** | What actually happened | Error: "Permission denied" |
| **Reproducibility** | Always / Intermittent / Once | Always |
| **Screenshot/Logs** | Attach if applicable | (attached) |
| **Date/Time** | When the bug was observed | 2026-02-09 14:30 |
| **Test Scenario Ref** | Which test scenario triggered this bug | Scenario 1, Step 5 |

> **Cross-reference:** Field definitions align with `docs/DVH-IMS-V1.5/operations/06_Bug_Reporting_Process.md`. This protocol extends the operational bug reporting process with testing-specific fields (Bug ID, Test Scenario Ref, Reproducibility).

### 3. Bug Triage Rules

| Rule | Description |
|------|-------------|
| **Reproducibility Required** | Only reproducible bugs may be formally logged. "It happened once but I can't reproduce it" is noted but not triaged. |
| **Authorization Gate** | ALL fixes require explicit authorization from Delroy before implementation. No self-service fixes. |
| **Restore Point Mandate** | Every fix must be preceded by a restore point. No exceptions. |
| **Scope Lock** | Fixes must address the reported defect ONLY. No scope expansion, no "while we're at it" changes. |
| **Regression Check** | After any fix, re-run the specific test scenario that exposed the bug to confirm resolution. |
| **No Feature Requests** | "It would be nice if..." items are logged separately and deferred. They are NOT bugs. See `06_Bug_Reporting_Process.md` Section 5 for examples. |

### 4. Acceptance Criteria

| Verdict | Definition |
|---------|-----------|
| **PASS** | All actions in the test scenario produce the expected results. No functional defects observed. Role restrictions enforced. Audit entries present where required. |
| **FAIL** | One or more expected results not met. A bug report is filed with severity classification. Testing of the affected scenario is paused until the bug is triaged. |
| **BLOCKER** | A Blocker-severity bug is identified. ALL testing is paused. The bug is escalated immediately to Delroy for authorization. Testing resumes only after the fix is deployed and the restore point is confirmed. |

### 5. Test Execution Rules

| Rule | Description |
|------|-------------|
| **Sequential Execution** | Role-based scenarios (Part A) are executed first, then end-to-end workflows (Part B). |
| **Clean State** | Each scenario starts from a known state. If prior test data is required, it is documented in preconditions. |
| **One Role Per Session** | Log out and log in as the next role between scenarios. Do not switch roles within a scenario. |
| **Evidence Capture** | For each scenario, record PASS or FAIL with timestamp. For FAIL, attach the bug report. |
| **No Parallel Fixes** | Do not fix bugs while testing is in progress. Complete the test cycle, triage all bugs, then fix in priority order. |

---

## Appendix: Role–Route Access Matrix (Quick Reference)

| Route | frontdesk_bs | frontdesk_h | admin_staff | social_fw | tech_insp | project_leader | director | min_advisor | minister | system_admin | audit |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/control-queue` | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/my-visits` | — | — | — | ✅ | ✅ | — | — | — | — | ✅ | — |
| `/subsidy-cases` | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/case-assignments` | — | — | — | — | — | ✅ (RW) | ✅ (RO) | ✅ (RO) | ✅ (RO) | ✅ (RW) | ✅ (RO) |
| `/housing-registrations` | — | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/archive` | — | — | — | — | — | ✅ (RO) | ✅ (RO) | ✅ (RO) | ✅ (RO) | ✅ (RO) | ✅ (RO) |
| `/audit-log` | — | — | — | — | — | ✅ (RO) | ✅ (RO) | ✅ (RO) | — | ✅ (RO) | ✅ (RO) |

**Legend:** ✅ = Access granted | ✅ (RO) = Read-only | ✅ (RW) = Read-write | — = No access

---

*End of Test Execution Pack. No implementation performed.*
