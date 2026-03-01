# DVH-IMS — Admin Workflow: Housing Registration Management

**Document:** 04 — Admin Workflow: Housing Registration Management
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. Overview

This document describes the staff-side workflow for processing Housing Registrations (Woningregistratie), from initial intake through waiting list placement, urgency assessment, and allocation.

**Primary Roles:** frontdesk_housing, project_leader, system_admin

---

## 2. Locating Registrations

### Housing Registrations List

**URL:** https://volkshuisvesting.sr/housing-registrations

- Displays all housing registrations visible to the current user's role and district
- District-scoped roles see only their district's registrations
- National roles see all districts
- Searchable and filterable by status, district, and date

[Screenshot: Housing Registrations — List View]

### Table Columns

| Column | Description |
|--------|------------|
| Reference Number | Unique registration identifier (WR-YYYYMMDD-XXXX) |
| Applicant | Name with initials avatar |
| District | Registration district |
| Status | Current processing status |
| Registration Date | Date of submission |
| Waiting List Position | Position in the district waiting list |
| Actions | View detail button |

---

## 3. Registration Detail View

**URL:** https://volkshuisvesting.sr/housing-registrations/[id]

The detail view displays:

### 3.1 Applicant Information
- Full name, national ID, date of birth, gender
- Contact information (phone, email)
- Linked person record

### 3.2 Household Information
- Household size
- Household members and relationships
- Current address

### 3.3 Housing Preference
- Interest type (Rent / Rent-to-Own / Purchase)
- Preferred district

### 3.4 Application Details
- Application reason
- Income information (applicant + partner)
- Special needs / urgency indicators

### 3.5 Document Panel
- List of uploaded documents with verification status
- Each document shows: file name, upload date, verified/unverified status
- Documents can be downloaded for review

### 3.6 Status History
- Chronological list of all status changes
- Each entry shows: from status, to status, changed by, date, reason

[Screenshot: Housing Registration — Detail View]

---

## 4. Document Verification

### Process
1. Open the registration detail view
2. Navigate to the Documents panel
3. Review each uploaded document against the requirement
4. Mark documents as verified when confirmed authentic

### Audit Trail
- Each verification action creates an audit event
- The verification is recorded with: who verified, when, which document

### Who Can Verify
- `frontdesk_housing` (own district)
- `system_admin` (all districts)

---

## 5. Status Changes

### Available Statuses

| Status | Meaning |
|--------|---------|
| SUBMITTED | Citizen has submitted; awaiting review |
| IN_REVIEW | Frontdesk is reviewing the registration |
| APPROVED | Registration approved and placed on waiting list |
| REJECTED | Registration rejected (with reason) |
| WAITLISTED | Active on the waiting list for allocation |
| ALLOCATED | Housing unit has been allocated |
| ASSIGNED | Housing assignment has been registered |

### Making a Status Change
1. Open the registration detail view
2. Select the new status
3. Provide a **mandatory reason** for the change
4. Confirm the transition

### Audit Trail
Every status change creates:
- A `status_history` entry (from_status, to_status, reason, changed_by, timestamp)
- An `audit_event` entry (action, entity, actor, reason, timestamp)

---

## 6. Waiting List Management

**URL:** https://volkshuisvesting.sr/housing-waiting-list

- Displays registrations ordered by waiting list position
- Waiting list position is assigned automatically at registration time
- No manual re-ordering of the waiting list
- Filterable by district

[Screenshot: Housing Waiting List]

---

## 7. Urgency Assessment

When a registration indicates special needs (disability, emergency), an urgency assessment may be conducted:

| Field | Description |
|-------|------------|
| Urgency Category | Type of urgency (medical, emergency, etc.) |
| Urgency Points | Numeric score affecting allocation priority |
| Justification | Written explanation |
| Supporting Document | Optional document reference |
| Assessed By | Staff member who conducted the assessment |

Higher urgency scores increase the registration's priority in the allocation engine.

---

## 8. Connection to Allocation

Approved and waitlisted registrations become eligible for the Allocation Engine:

1. **District Quotas** define available housing units per district per period
2. **Allocation Runs** rank eligible candidates by composite score (urgency + waiting list position)
3. **Allocation Decisions** record accept/reject per candidate
4. **Assignment Records** register final housing assignments

For the complete allocation workflow, see **Document 10 — Allocation Engine and Decision Logic**.

---

## 9. Archive

Terminal registrations (final status reached) move to the Archive:

**URL:** https://volkshuisvesting.sr/archive

- Read-only access
- Contains completed, rejected, or finalized registrations
- Available to: system_admin, project_leader, director, minister, ministerial_advisor, audit

---

## 10. Responsible Roles Summary

| Action | Authorized Roles |
|--------|-----------------|
| View registrations (own district) | frontdesk_housing |
| View registrations (all districts) | system_admin, project_leader, director, minister, ministerial_advisor, audit |
| Verify documents | frontdesk_housing, system_admin |
| Change status | frontdesk_housing, system_admin |
| View waiting list | frontdesk_housing, system_admin, project_leader |
| Conduct urgency assessment | frontdesk_housing, system_admin |
| View archive | system_admin, project_leader, director, minister, ministerial_advisor, audit |

---

*End of Admin Workflow: Housing Registration Management*
