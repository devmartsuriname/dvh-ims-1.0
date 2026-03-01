# DVH-IMS — System Modules: Full Functional Specification

**Document:** 12 — System Modules Full Functional Specification
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## PUBLIC PAGES

---

### P1. Landing Page

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/ |
| **Purpose** | Entry point for citizens; provides navigation to both services |
| **Users** | General public (no login required) |
| **Actions** | Navigate to Housing Registration or Subsidy Application |
| **Data Shown** | Service descriptions, call-to-action buttons |
| **Dependencies** | None |
| **Audit** | None (static page) |

---

### P2. Housing Registration Wizard

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/housing/register |
| **Purpose** | 9-step form for citizens to register housing need |
| **Users** | General public (no login required) |
| **Actions** | Fill form steps, upload documents, submit registration |
| **Data Shown** | Form fields, document requirements, review summary |
| **Dependencies** | Edge Function: `submit-housing-registration` |
| **Audit** | CREATE event on submission with correlation_id |

See **Document 02** for complete step-by-step workflow.

---

### P3. Subsidy Application Wizard

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/bouwsubsidie/apply |
| **Purpose** | 7-step form for citizens to apply for construction subsidy |
| **Users** | General public (no login required) |
| **Actions** | Fill form steps, upload documents, submit application |
| **Data Shown** | Form fields, document requirements, review summary |
| **Dependencies** | Edge Function: `submit-bouwsubsidie-application` |
| **Audit** | CREATE event on submission with correlation_id |

See **Document 03** for complete step-by-step workflow.

---

### P4. Status Tracker

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/status |
| **Purpose** | Public lookup of application/registration status |
| **Users** | Citizens with a reference number and security token |
| **Actions** | Enter reference number + token → view current status and history |
| **Data Shown** | Current status, status history timeline |
| **Dependencies** | Edge Function: `lookup-public-status` |
| **Audit** | Lookup events tracked (rate limited: 20/hour per IP) |

---

## ADMIN MODULES

---

### A1. Dashboard

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/dashboards |
| **Purpose** | Overview of system activity and recent records |
| **Users** | All authenticated roles |
| **Actions** | View recent subsidy cases, recent housing registrations, navigate to modules |
| **Data Shown** | Recent cases/registrations with applicant initials avatars, status badges |
| **Dependencies** | subsidy_case, housing_registration, person |
| **Audit** | None (read-only view) |

[Screenshot: Admin Dashboard]

---

### A2. Persons

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/persons |
| **Purpose** | Central person registry |
| **Users** | All roles with shared core access |
| **Actions** | Search by national_id, view person details, view linked cases/registrations |
| **Data Shown** | Name, national ID, date of birth, gender, nationality, contact points |
| **Dependencies** | person, contact_point |
| **Audit** | CREATE/UPDATE events on person records |

---

### A3. Households

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/households |
| **Purpose** | Household composition management |
| **Users** | All roles with shared core access |
| **Actions** | View household members, current address, linked cases/registrations |
| **Data Shown** | Primary person, members with relationships, address, district |
| **Dependencies** | household, household_member, address, person |
| **Audit** | CREATE/UPDATE events on household records |

---

### A4. Housing Registrations

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/housing-registrations |
| **Purpose** | List and manage housing registrations |
| **Users** | frontdesk_housing (district), oversight roles (national) |
| **Actions** | View list, open detail, verify documents, change status |
| **Data Shown** | Reference number, applicant (with initials avatar), district, status, registration date, waiting list position |
| **Dependencies** | housing_registration, person, household, housing_document_upload |
| **Audit** | STATUS_CHANGE, DOCUMENT_VERIFIED events |

See **Document 04** for complete admin workflow.

---

### A5. Housing Waiting List

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/housing-waiting-list |
| **Purpose** | View registrations ordered by waiting list position |
| **Users** | frontdesk_housing, system_admin, project_leader |
| **Actions** | View ordered list, filter by district |
| **Data Shown** | Position, applicant, district, status, registration date |
| **Dependencies** | housing_registration |
| **Audit** | None (read-only view) |

---

### A6. Subsidy Cases

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/subsidy-cases |
| **Purpose** | List and manage subsidy cases |
| **Users** | Bouwsubsidie roles (district), oversight roles (national) |
| **Actions** | View list, open detail, verify documents, change status, submit reports, make decisions |
| **Data Shown** | Case number, applicant (with initials avatar), district, status, requested amount, created date |
| **Dependencies** | subsidy_case, person, household, subsidy_document_upload, social_report, technical_report, generated_document |
| **Audit** | Full decision chain events (see Document 09) |

See **Document 05** for complete admin workflow.

---

### A7. Control Queue

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/control-queue |
| **Purpose** | Operational case processing view for subsidy cases |
| **Users** | frontdesk_bouwsubsidie, admin_staff, project_leader, oversight roles |
| **Actions** | Filter by status, district; open case details |
| **Data Shown** | Case number, applicant, status, district, date |
| **Dependencies** | subsidy_case |
| **Audit** | None (navigation view) |

---

### A8. My Visits

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/my-visits |
| **Purpose** | Personal work queue for field workers |
| **Users** | social_field_worker, technical_inspector |
| **Actions** | View assigned cases, navigate to case detail |
| **Data Shown** | Case number, applicant, assignment date, status |
| **Dependencies** | case_assignment, subsidy_case |
| **Audit** | None (navigation view) |

---

### A9. Schedule Visits

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/schedule-visits |
| **Purpose** | Read-only planning view for scheduled visits |
| **Users** | system_admin, project_leader, frontdesk_bouwsubsidie, admin_staff, field workers |
| **Actions** | View scheduled visits (read-only) |
| **Data Shown** | Scheduled visits by date |
| **Dependencies** | case_assignment |
| **Audit** | None (read-only view) |

---

### A10. Case Assignments

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/case-assignments |
| **Purpose** | Assign workers to subsidy cases for review tasks |
| **Users** | system_admin, project_leader (manage); others (view) |
| **Actions** | Assign, reassign, revoke, complete assignments |
| **Data Shown** | Case reference, assigned worker, role, status, date, reason |
| **Dependencies** | case_assignment, subsidy_case, app_user_profile |
| **Audit** | CASE_ASSIGNED, CASE_REASSIGNED, CASE_REVOKED, CASE_ASSIGNMENT_COMPLETED |

---

### A11. Allocation Quotas

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/allocation-quotas |
| **Purpose** | Define housing unit availability per district per period |
| **Users** | system_admin, project_leader (manage); others (view) |
| **Actions** | Create, update quotas |
| **Data Shown** | District, total quota, allocated count, period |
| **Dependencies** | district_quota |
| **Audit** | CREATE/UPDATE events |

---

### A12. Allocation Runs

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/allocation-runs |
| **Purpose** | Execute and review allocation matching runs |
| **Users** | system_admin, project_leader (execute); others (view) |
| **Actions** | Execute allocation run, view results |
| **Data Shown** | Run date, district, status, candidates count, allocations count |
| **Dependencies** | allocation_run, allocation_candidate, housing_registration |
| **Audit** | Allocation run execution events |

---

### A13. Allocation Decisions

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/allocation-decisions |
| **Purpose** | Record accept/reject decisions for allocation candidates |
| **Users** | system_admin, project_leader |
| **Actions** | Accept or reject candidates, provide reasons |
| **Data Shown** | Candidate ranking, registration details, decision status |
| **Dependencies** | allocation_decision, allocation_candidate, housing_registration |
| **Audit** | Decision events |

---

### A14. Allocation Assignments

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/allocation-assignments |
| **Purpose** | Register final housing unit assignments |
| **Users** | system_admin, project_leader |
| **Actions** | Register assignment, link to housing unit |
| **Data Shown** | Registration, decision, assignment type, housing reference, date |
| **Dependencies** | assignment_record, allocation_decision, housing_registration |
| **Audit** | Assignment events |

---

### A15. Archive

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/archive |
| **Purpose** | Read-only repository of terminal dossiers |
| **Users** | system_admin, project_leader, director, minister, ministerial_advisor, audit |
| **Actions** | View completed/rejected cases and registrations (read-only) |
| **Data Shown** | Complete dossier with all documents, reports, decisions, status history |
| **Dependencies** | subsidy_case, housing_registration (terminal statuses) |
| **Audit** | None (read-only access) |

---

### A16. Audit Log

| Attribute | Detail |
|-----------|--------|
| **URL** | https://volkshuisvesting.sr/audit-log |
| **Purpose** | Immutable record of all system actions |
| **Users** | system_admin, project_leader, minister, director, ministerial_advisor, audit |
| **Actions** | View and filter audit events (read-only) |
| **Data Shown** | Timestamp, actor, role, action, entity, reason, metadata |
| **Dependencies** | audit_event |
| **Audit** | N/A (this IS the audit log) |

See **Document 09** for complete audit logging specification.

---

*End of System Modules Full Functional Specification*
