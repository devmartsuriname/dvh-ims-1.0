# Ministerial System Manual — Documentation Execution Plan

## Objective

Create a comprehensive, Minister-grade system manual for DVH-IMS covering the full end-to-end operation of both services (Bouwsubsidie and Woningregistratie), from public citizen intake to administrative governance.

This is a **documentation-only task**. Zero code, schema, RLS, or UI changes.

---

## Deliverable Structure

**Folder:** `/docs/manual/`


| #   | File                                                 | Purpose                                                                                                  |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 00  | `00-Minister-Executive-Summary.md`                   | 5-10 page executive overview for Minister: system purpose, governance model, accountability, key metrics |
| 01  | `01-System-Overview-Architecture.md`                 | High-level architecture (non-technical), module map, technology summary, deployment topology             |
| 02  | `02-Frontend-Workflows-Housing-Registration.md`      | Step-by-step public Housing Registration wizard (applicant perspective)                                  |
| 03  | `03-Frontend-Workflows-Subsidy-Application.md`       | Step-by-step public Bouwsubsidie wizard (applicant perspective)                                          |
| 04  | `04-Admin-Workflow-Housing-Management.md`            | Staff-side Housing Registration management: intake review, status changes, waiting list, allocation      |
| 05  | `05-Admin-Workflow-Subsidy-Management.md`            | Staff-side Bouwsubsidie management: intake, reviews, inspections, decision chain, Raadvoorstel           |
| 06  | `06-User-Roles-and-Permission-Matrix.md`             | All 11 roles, per-module access matrix, status change authority, document rights                         |
| 07  | `07-Status-Lifecycle-and-Decision-Flows.md`          | Status state diagrams for both services, transition rules, decision authority levels                     |
| 08  | `08-Document-Management-and-Verification.md`         | Upload flows, verification tracking, generated documents (Raadvoorstel), download procedures             |
| 09  | `09-Audit-Logging-and-Traceability.md`               | Audit event model, what is logged, where to find logs, compliance guarantees                             |
| 10  | `10-Allocation-Engine-and-Decision-Logic.md`         | District quotas, urgency scoring, allocation runs, matching, assignment registration                     |
| 11  | `11-Governance-Controls-and-Compliance.md`           | RLS enforcement, least-privilege model, ministerial decision chain, deviation logging                    |
| 12  | `12-System-Modules-Full-Functional-Specification.md` | Module-by-module breakdown of all 16 admin modules + 4 public pages                                      |
| 13  | `13-Operational-Scenarios-End-to-End.md`             | Complete numbered scenarios (preconditions, steps, outcomes, audit trail location)                       |
| 14  | `14-Troubleshooting-and-FAQ.md`                      | Common issues, error handling, resubmission behavior, duplicate handling                                 |
| 15  | `15-Glossary-and-Term-Definitions.md`                | All statuses, field definitions, role names, system terminology                                          |


**Total: 16 documents**

---

## URL Documentation

All documents will include explicit URLs based on:

**Production (Published):**

- Landing: `https://huggable-cloud-whisper.lovable.app/`
- Housing Registration: `https://huggable-cloud-whisper.lovable.app/housing/register`
- Subsidy Application: `https://huggable-cloud-whisper.lovable.app/bouwsubsidie/apply`
- Status Tracker: `https://huggable-cloud-whisper.lovable.app/status`
- Staff Login: `https://huggable-cloud-whisper.lovable.app/auth/sign-in`
- Admin Dashboard: `https://huggable-cloud-whisper.lovable.app/dashboards`

**Staging (Preview):**

- Base: `https://id-preview--0863926a-748e-4b6c-8f0e-91c530bfb3a9.lovable.app`
- Same path structure as production

Admin module URLs will be listed per-module in document 12.

---

## Content Coverage Per Document

### 00 - Executive Summary

- System purpose and legal mandate
- Two services overview (Housing + Subsidy)
- Governance and accountability model (1 paragraph)
- Role structure summary
- Key operational metrics / KPIs
- "What happens next?" for both services
- 5-10 pages, non-technical language

### 01 - System Overview

- Module map (Dashboard, Shared Core, Bouwsubsidie, Woningregistratie, Allocation, Governance)
- Public vs Admin separation
- Authentication model (staff-only login, citizen anonymous access)
- District-based scoping

### 02 + 03 - Public Wizard Workflows

Per service:

- Preconditions
- Step-by-step wizard walkthrough (each form step)
- Reference number generation
- Security token explanation
- Receipt/confirmation page
- Status tracking via `/status`
- "What happens after submission?"

### 04 + 05 - Admin Workflows

Per service:

- Locating records in list view
- Opening detail view
- Status change process (with mandatory reason)
- Document upload and verification
- Field reports (Social, Technical — Bouwsubsidie only)
- Decision chain steps
- Raadvoorstel generation (Bouwsubsidie only)
- Archive flow
- Audit trail per action

### 06 - Roles & Permission Matrix

Table columns:

- Role name (all 11 implemented roles)
- Modules accessible
- Create/Edit rights
- Status change authority (which statuses)
- Document upload/verify rights
- Allocation/decision authority
- Audit log access
- Export/print permissions
- National vs district-scoped flag

### 07 - Status Lifecycle

- ASCII state diagrams for both services
- Transition rules with triggering roles
- Decision authority per transition
- Mandatory reason requirements

### 08 - Document Management

- Upload workflow
- Verification tracking
- Raadvoorstel generation (edge function)
- Download via signed URLs

### 09 - Audit Logging

- `audit_event` table structure
- What triggers a log entry
- Where to view audit logs (Admin > Audit Log)
- Append-only guarantee
- Role access to audit log

### 10 - Allocation Engine

- District quotas setup
- Urgency scoring model
- Allocation run execution
- Matching logic
- Decision recording
- Assignment registration

### 11 - Governance Controls

- RLS enforcement model
- Least-privilege access
- Ministerial Advisor mandatory paraph
- Minister deviation logging
- Status history immutability

### 12 - Module Specification

All 20 pages/modules documented:

- **Public (4):** Landing, Housing Wizard, Subsidy Wizard, Status Tracker
- **Admin (16):** Dashboard, Persons, Households, Housing Registrations, Housing Waiting List, Subsidy Cases, Control Queue, My Visits, Schedule Visits, Case Assignments, Allocation Quotas, Allocation Runs, Allocation Decisions, Allocation Assignments, Archive, Audit Log

Per module: Purpose, target roles, available actions, data displayed, dependencies, audit implications.

### 13 - Operational Scenarios

Minimum 8 numbered end-to-end scenarios:

1. Citizen submits Housing Registration
2. Citizen submits Subsidy Application
3. Frontdesk processes new Housing Registration
4. Frontdesk processes new Subsidy Case through full decision chain
5. Allocation run execution and assignment
6. Minister approves/rejects with deviation from advisor
7. Archive lookup of closed case
8. Audit trail verification for a specific case

Each includes: preconditions, numbered steps, expected outcomes, failure modes, audit trail location.

### 14 - Troubleshooting & FAQ

- Common submission errors
- Duplicate/resubmission behavior
- Status lookup failures
- Document upload issues
- Permission denied scenarios
- Session timeout handling

### 15 - Glossary

- All status values (both services)
- Field definitions
- Role names with descriptions
- System terminology (Raadvoorstel, paraph, district code, etc.)

---

## Screenshots Strategy

- Screenshots will be **described with placeholder references** (e.g., `[Screenshot: Dashboard - Recent Cases Widget]`)
- Each reference follows format: `Figure X.Y — Description`
- PII masking note included in each document header
- Actual screenshot capture deferred to a separate visual documentation pass (requires browser tool)

---

## Execution Sequence

1. Create restore point: `docs/restore-points/v1.7/RESTORE_POINT_V1_7_MINISTERIAL_MANUAL.md`
2. Create `/docs/manual/` folder
3. Generate documents in order: 00 through 15
4. Each document sourced from: existing `/docs/` specifications, route definitions, component code, edge functions, and memory context
5. After all 16 documents: produce completion checklist

---

## Quality Gates

- Language: Clear, non-technical, suitable for Minister and senior staff
- Terminology: Consistent (Housing Registration / Subsidy Application / Bouwsubsidie)
- UI alignment: All labels, navigation paths, and field names match current implementation
- No invented features or roles
- No code/schema/RLS changes
- Restore point created before any file creation

## IMPORTANT — PRODUCTION URL CORRECTION

All documentation must use the official custom production domain:

[https://volkshuisvesting.sr](https://volkshuisvesting.sr)

DO NOT use any [lovable.app](http://lovable.app) subdomain in the manual.

Update all production URLs to:

Landing:

[https://volkshuisvesting.sr/](https://volkshuisvesting.sr/)

Housing Registration:

[https://volkshuisvesting.sr/housing/register](https://volkshuisvesting.sr/housing/register)

Subsidy Application:

[https://volkshuisvesting.sr/bouwsubsidie/apply](https://volkshuisvesting.sr/bouwsubsidie/apply)

Status Tracker:

[https://volkshuisvesting.sr/status](https://volkshuisvesting.sr/status)

Staff Login:

[https://volkshuisvesting.sr/auth/sign-in](https://volkshuisvesting.sr/auth/sign-in)

Admin Dashboard:

[https://volkshuisvesting.sr/dashboards](https://volkshuisvesting.sr/dashboards)

If staging URLs must be mentioned, place them in a separate clearly labeled "Technical Appendix — Staging Environment" section.

The Ministerial Manual must only reference the official production domain.  
  
**Completion Report Format**

After all documents are generated:

```
IMPLEMENTED: [list of created files]
PARTIAL: [any incomplete documents + reason]
SKIPPED: [none expected]
VERIFICATION: [checklist per document — PASS/FAIL]
RESTORE POINT: [ID]
BLOCKERS: NONE / [description]
CONFIRMATION: No code changes. No schema changes. No RLS changes.
```