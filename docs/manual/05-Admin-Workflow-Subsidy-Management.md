# DVH-IMS — Admin Workflow: Subsidy Case Management (Bouwsubsidie)

**Document:** 05 — Admin Workflow: Subsidy Case Management
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. Overview

This document describes the complete staff-side workflow for processing Bouwsubsidie (Construction Subsidy) cases, including the mandatory 8-step decision chain from intake to final ministerial decision.

**Primary Roles:** All 11 roles participate at different stages.

---

## 2. Locating Cases

### Subsidy Cases List

**URL:** https://volkshuisvesting.sr/subsidy-cases

- Displays all subsidy cases visible to the current user's role and district
- District-scoped roles see only their district's cases
- National roles see all districts
- Searchable and filterable by status, district, and date

### Control Queue

**URL:** https://volkshuisvesting.sr/control-queue

- Operational view for processing cases
- Filtered by workflow status for case management
- Primary entry point for frontdesk staff

[Screenshot: Control Queue — List View]

---

## 3. Case Detail View

**URL:** https://volkshuisvesting.sr/subsidy-cases/[id]

The detail view is organized into tabs that become visible based on the case's workflow stage:

### 3.1 Overview Tab
- Applicant information (name, national ID, date of birth)
- Contact information (phone, email)
- Household details (size, dependents)
- Current address (street, district, ressort)
- Application context (reason, estimated amount, calamity flag)
- Case status and creation date

### 3.2 Documents Tab
- List of uploaded documents with verification status
- Required documents sidebar showing all requirements (mandatory marked with *)
- Download links for each document
- Verification controls (for authorized roles)

### 3.3 Social Review Tab
*Visible when case reaches or passes social review step*
- Social assessment report (structured JSON form)
- Report status: draft or finalized
- Submitted by and date
- Read-only for non-social-worker roles

### 3.4 Technical Review Tab
*Visible when case reaches or passes technical inspection step*
- Technical inspection report (structured JSON form)
- Report status: draft or finalized
- Submitted by and date
- Read-only for non-inspector roles

### 3.5 Director Review Tab
*Visible when case reaches or passes organizational approval step*
- Director's decision panel: Approve or Return
- Mandatory reason/justification field
- Read-only for non-director roles

### 3.6 Ministerial Advisor Tab
*Visible when case reaches or passes advisory review step*
- Advisor's recommendation panel
- Formal advice (paraaf) with justification
- Read-only for non-advisor roles

### 3.7 Minister Decision Tab
*Visible when case reaches the final decision step*
- Minister's decision panel: Approve or Return
- If decision differs from advisor recommendation: **mandatory deviation explanation**
- Read-only for non-minister roles

### 3.8 Status History Tab
- Complete chronological audit trail of all status changes
- Each entry: from status → to status, reason, changed by, timestamp

### 3.9 Raadvoorstel Tab
*Visible after full approval*
- Generated council document (Raadvoorstel)
- Download link
- Generation date and triggered-by user

[Screenshot: Subsidy Case — Detail View with Tabs]

---

## 4. The 8-Step Decision Chain

### Step 1 — Frontdesk Intake

| Aspect | Detail |
|--------|--------|
| **Role** | frontdesk_bouwsubsidie |
| **Actions** | Review application, verify documents, accept or flag issues |
| **Audit Events** | CREATE, DOCUMENT_VERIFIED |
| **Status Transition** | SUBMITTED → IN_REVIEW |

### Step 2 — Social Review

| Aspect | Detail |
|--------|--------|
| **Role** | social_field_worker |
| **Precondition** | Must be assigned to the case via Case Assignments |
| **Actions** | Conduct social assessment visit, submit structured report |
| **Audit Events** | SOCIAL_ASSESSMENT_STARTED, SOCIAL_ASSESSMENT_COMPLETED |
| **Constraints** | Report cannot be edited after finalization; one report per case |

### Step 3 — Technical Inspection

| Aspect | Detail |
|--------|--------|
| **Role** | technical_inspector |
| **Precondition** | Must be assigned to the case via Case Assignments |
| **Actions** | Conduct technical inspection visit, submit structured report |
| **Audit Events** | TECHNICAL_INSPECTION_STARTED, TECHNICAL_INSPECTION_COMPLETED |
| **Constraints** | Report cannot be edited after finalization; one report per case |

### Step 4 — Administrative Review

| Aspect | Detail |
|--------|--------|
| **Role** | admin_staff |
| **Actions** | Review administrative completeness, confirm all documents and reports are in order |
| **Audit Events** | ADMIN_REVIEW_STARTED, ADMIN_REVIEW_COMPLETED |

### Step 5 — Policy Review

| Aspect | Detail |
|--------|--------|
| **Role** | project_leader |
| **Actions** | Review policy compliance, confirm eligibility |
| **Audit Events** | STATUS_CHANGE (to policy review stage) |

### Step 6 — Director Organizational Approval

| Aspect | Detail |
|--------|--------|
| **Role** | director |
| **Actions** | Approve dossier or return to previous step |
| **Audit Events** | DIRECTOR_REVIEW_STARTED, DIRECTOR_APPROVED or DIRECTOR_RETURNED |
| **Mandatory** | Written justification (reason field) |

### Step 7 — Ministerial Advisor Advisory Review

| Aspect | Detail |
|--------|--------|
| **Role** | ministerial_advisor |
| **Actions** | Review complete dossier, provide formal recommendation (paraaf) |
| **Audit Events** | MINISTERIAL_ADVICE_STARTED, MINISTERIAL_ADVICE_COMPLETED |
| **Mandatory** | Written advice with justification |

### Step 8 — Minister Final Decision

| Aspect | Detail |
|--------|--------|
| **Role** | minister |
| **Actions** | Approve dossier or return to previous step |
| **Audit Events** | MINISTER_DECISION_STARTED, MINISTER_APPROVED or MINISTER_RETURNED |
| **Mandatory** | Written justification |
| **Special Rule** | If decision deviates from advisor recommendation, a mandatory free-text explanation is required. This deviation is permanently logged. |

---

## 5. Raadvoorstel Generation

After the Minister approves a case:

1. The system generates a **Raadvoorstel** (Council Document)
2. The document is stored in the system and linked to the case
3. The generation is audit-logged with: who triggered it, when, case reference
4. The document is available for download from the case detail view

**Precondition:** All 8 steps must be completed with approvals. The system blocks generation if any step is incomplete.

---

## 6. Case Assignments

**URL:** https://volkshuisvesting.sr/case-assignments

Workers are assigned to cases for specific review tasks:

| Action | Description | Audit Event |
|--------|-------------|-------------|
| Assign | Assign a worker to a dossier | CASE_ASSIGNED |
| Reassign | Change the assigned worker | CASE_REASSIGNED |
| Revoke | Remove an assignment | CASE_REVOKED |
| Complete | Mark assignment as done | CASE_ASSIGNMENT_COMPLETED |

**Key Rules:**
- Only `system_admin` and `project_leader` can create/modify assignments
- Every action requires a mandatory reason
- Assignments do **not** change dossier status (decoupled by design)
- All actions are audit-logged

---

## 7. Document Verification

### Process
1. Open the case detail view → Documents tab
2. Review each uploaded document against the required documents sidebar
3. Mark individual documents as verified
4. All verifications are recorded with actor, timestamp, and document reference

### Who Can Verify
- `frontdesk_bouwsubsidie` (own district)
- `admin_staff` (own district)
- `system_admin` (all districts)

---

## 8. Status Changes

Every status change requires:
- Selection of the new status
- A **mandatory reason** explaining the change
- Confirmation by the authorized user

Each status change creates:
- A `subsidy_case_status_history` entry
- An `audit_event` entry

The system enforces the sequential chain — a case cannot skip steps.

---

## 9. Return (Send Back) Process

At steps 6, 7, and 8, the decision-maker can **return** the dossier to a previous step:
- A mandatory reason must be provided
- The return is audit-logged
- The case reverts to the appropriate earlier status
- The case must re-traverse the chain from the return point

---

## 10. Archive

Terminal cases (approved + Raadvoorstel generated, or rejected) move to the Archive:

**URL:** https://volkshuisvesting.sr/archive

- Strictly read-only
- Available to: system_admin, project_leader, director, minister, ministerial_advisor, audit

---

## 11. Field Worker Workflow

### My Visits
**URL:** https://volkshuisvesting.sr/my-visits

- Displays cases assigned to the logged-in field worker
- Primary work queue for social_field_worker and technical_inspector

### Schedule Visits
**URL:** https://volkshuisvesting.sr/schedule-visits

- Read-only planning view for scheduled field visits
- Shows visits assigned via Case Assignments

---

## 12. Responsible Roles Summary

| Action | Authorized Roles |
|--------|-----------------|
| View cases (own district) | frontdesk_bouwsubsidie, admin_staff, social_field_worker, technical_inspector |
| View cases (all districts) | system_admin, project_leader, director, minister, ministerial_advisor, audit |
| Verify documents | frontdesk_bouwsubsidie, admin_staff, system_admin |
| Submit social report | social_field_worker |
| Submit technical report | technical_inspector |
| Administrative review | admin_staff |
| Policy review | project_leader |
| Organizational approval | director |
| Advisory recommendation | ministerial_advisor |
| Final decision | minister |
| Manage case assignments | system_admin, project_leader |
| Generate Raadvoorstel | system (automatic after full approval) |

---

*End of Admin Workflow: Subsidy Case Management*
