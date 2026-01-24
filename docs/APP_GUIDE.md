# VolksHuisvesting IMS — Application Guide

**Version:** v1.1  
**Status:** Production-Ready  
**Last Updated:** 2026-01-24

---

## 1. System Purpose

VolksHuisvesting IMS is a **Government-Grade Information Management System** for the Suriname Ministry of Social Affairs and Housing (SoZaVo). It provides auditable case management for two core services:

1. **Bouwsubsidie (Construction Subsidy)** — Financial assistance for housing construction
2. **Woning Registratie & Allocatie (Housing Registration & Allocation)** — Central housing waiting list and allocation engine

The system supports **nationwide operations across all 10 districts** with strict role-based access control, immutable audit logging, and Row Level Security (RLS) enforced at the database layer.

### Core Principles
- **Audit-First:** Every status change, decision, and document action is logged
- **RLS-First:** All data access controlled via PostgreSQL policies, not application code
- **District Scoping:** Operational roles are restricted to their assigned district
- **Module Separation:** Bouwsubsidie and Housing operate independently with a shared Person/Household core

---

## 2. Public vs Admin Separation

| Aspect | Public Frontend | Admin Backend |
|--------|-----------------|---------------|
| Theme | Light only | Dark (Darkone Admin) |
| Authentication | None (anonymous) | Supabase Auth required |
| Layout | `PublicLayout.tsx` | `AdminLayout.tsx` |
| Access | Citizens | Ministry staff |
| Routes | `/`, `/bouwsubsidie/*`, `/housing/*`, `/status` | `/dashboards`, `/persons`, `/subsidy-cases`, etc. |

---

## 3. Module Map

### 3.1 Public Modules (Citizen-Facing)

| Route | Module | Purpose | Edge Function |
|-------|--------|---------|---------------|
| `/` | Landing Page | Service selection hub | - |
| `/bouwsubsidie/apply` | Construction Subsidy Wizard | 8-step application intake | `submit-bouwsubsidie-application` |
| `/housing/register` | Housing Registration Wizard | 9-step registration intake | `submit-housing-registration` |
| `/status` | Status Tracker | Reference + token lookup | `lookup-public-status` |

### 3.2 Admin Modules (Staff-Facing)

| Route | Module | Purpose | Primary Table(s) |
|-------|--------|---------|------------------|
| `/dashboards` | Dashboard | KPIs, charts, district trends | Multiple (aggregates) |
| `/persons` | Persons | Shared Core - individual records | `person` |
| `/persons/:id` | Person Detail | Individual person view | `person`, `contact_point` |
| `/households` | Households | Shared Core - household records | `household`, `household_member` |
| `/households/:id` | Household Detail | Household composition view | `household`, `household_member`, `address` |
| `/subsidy-cases` | Subsidy Cases | Bouwsubsidie case management | `subsidy_case` |
| `/subsidy-cases/:id` | Case Detail | Full case lifecycle view | `subsidy_case`, `subsidy_case_status_history`, `social_report`, `technical_report`, `generated_document` |
| `/housing-registrations` | Registrations | Housing registration management | `housing_registration` |
| `/housing-registrations/:id` | Registration Detail | Full registration view + urgency | `housing_registration`, `housing_registration_status_history`, `housing_urgency` |
| `/housing-waiting-list` | Waiting List | Queue visibility by district | `housing_registration` (filtered) |
| `/allocation-quotas` | District Quotas | Quota configuration per period | `district_quota` |
| `/allocation-runs` | Allocation Runs | Engine execution & monitoring | `allocation_run` |
| `/allocation-runs/:id` | Run Detail | Candidates and results | `allocation_run`, `allocation_candidate` |
| `/allocation-decisions` | Decisions | Approval/rejection workflow | `allocation_decision` |
| `/allocation-assignments` | Assignments | Final assignment records | `assignment_record` |
| `/audit-log` | Audit Log | Governance log viewer (read-only) | `audit_event` |

---

## 4. End-to-End Workflows

### 4.1 Bouwsubsidie (Construction Subsidy) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CITIZEN (Public Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Access /bouwsubsidie/apply                                  │
│  2. Complete 8-step wizard:                                     │
│     Step 0: Introduction                                        │
│     Step 1: Personal Info (name, national_id, DOB)              │
│     Step 2: Contact Info (phone, email)                         │
│     Step 3: Household Composition                               │
│     Step 4: Address (district, street)                          │
│     Step 5: Context (reason, requested amount)                  │
│     Step 6: Documents (acknowledgment)                          │
│     Step 7: Review & Submit                                     │
│     Step 8: Receipt (reference number + access token)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function: submit-bouwsubsidie-application      │
├─────────────────────────────────────────────────────────────────┤
│  - Validates input                                              │
│  - Rate-limits by IP (5/hour)                                   │
│  - Creates records in:                                          │
│    • person                                                     │
│    • household                                                  │
│    • household_member                                           │
│    • address                                                    │
│    • contact_point                                              │
│    • subsidy_case (status: 'received')                          │
│    • subsidy_case_status_history                                │
│    • public_status_access (hashed token)                        │
│    • audit_event                                                │
│  - Returns: reference_number, access_token                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN (Staff Backend)                         │
├─────────────────────────────────────────────────────────────────┤
│  Status Progression:                                            │
│  received → screening → field_visit → assessment →              │
│  pending_approval → approved OR rejected                        │
│                                                                 │
│  Staff Actions:                                                 │
│  • Review case details                                          │
│  • Upload/verify documents (subsidy_document_upload)            │
│  • Create social report (social_report)                         │
│  • Create technical report (technical_report)                   │
│  • Generate Raadvoorstel (generate-raadvoorstel Edge Function)  │
│  • Update status with reason                                    │
│                                                                 │
│  All actions create:                                            │
│  • subsidy_case_status_history entry                            │
│  • audit_event entry                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Tables Written (Intake):** `person`, `household`, `household_member`, `address`, `contact_point`, `subsidy_case`, `subsidy_case_status_history`, `public_status_access`, `audit_event`

**Tables Written (Processing):** `subsidy_case`, `subsidy_case_status_history`, `subsidy_document_upload`, `social_report`, `technical_report`, `generated_document`, `audit_event`

---

### 4.2 Housing Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CITIZEN (Public Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Access /housing/register                                    │
│  2. Complete 9-step wizard:                                     │
│     Step 0: Introduction                                        │
│     Step 1: Personal Info                                       │
│     Step 2: Contact Info                                        │
│     Step 3: Living Situation                                    │
│     Step 4: Housing Preference                                  │
│     Step 5: Reason for Application                              │
│     Step 6: Income Declaration                                  │
│     Step 7: Urgency Indicators                                  │
│     Step 8: Review & Submit                                     │
│     Step 9: Receipt                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function: submit-housing-registration          │
├─────────────────────────────────────────────────────────────────┤
│  - Validates input                                              │
│  - Rate-limits by IP (5/hour)                                   │
│  - Creates records in:                                          │
│    • person                                                     │
│    • household                                                  │
│    • household_member                                           │
│    • address                                                    │
│    • contact_point                                              │
│    • housing_registration (status: 'received')                  │
│    • housing_registration_status_history                        │
│    • public_status_access (hashed token)                        │
│    • audit_event                                                │
│  - Returns: reference_number, access_token                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN (Staff Backend)                         │
├─────────────────────────────────────────────────────────────────┤
│  Status Progression:                                            │
│  received → screening → validated → registered →                │
│  on_waiting_list → allocated → assigned OR rejected             │
│                                                                 │
│  Staff Actions:                                                 │
│  • Review registration details                                  │
│  • Perform urgency assessment (housing_urgency)                 │
│  • Assign urgency score and waiting list position               │
│  • Update status with reason                                    │
│                                                                 │
│  All actions create:                                            │
│  • housing_registration_status_history entry                    │
│  • audit_event entry                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Tables Written (Intake):** `person`, `household`, `household_member`, `address`, `contact_point`, `housing_registration`, `housing_registration_status_history`, `public_status_access`, `audit_event`

**Tables Written (Processing):** `housing_registration`, `housing_registration_status_history`, `housing_urgency`, `audit_event`

---

### 4.3 Allocation Engine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 1: Quota Configuration                      │
├─────────────────────────────────────────────────────────────────┤
│  Route: /allocation-quotas                                      │
│  Roles: system_admin, project_leader                            │
│  Actions:                                                       │
│  • Set district_quota per period (start_date, end_date)         │
│  • Define total_quota for each district                         │
│  Table: district_quota                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 2: Allocation Run Execution                 │
├─────────────────────────────────────────────────────────────────┤
│  Route: /allocation-runs                                        │
│  Roles: system_admin, project_leader                            │
│  Actions:                                                       │
│  • Create new allocation run for district                       │
│  • Execute via execute-allocation-run Edge Function             │
│                                                                 │
│  Edge Function Logic:                                           │
│  1. Validate caller role                                        │
│  2. Check district_quota availability                           │
│  3. Fetch housing_registration with status 'on_waiting_list'    │
│  4. Sort by urgency_score DESC, waiting_list_position ASC       │
│  5. Compute composite_rank                                      │
│  6. Select top N candidates (N = remaining quota)               │
│  7. Insert into allocation_candidate                            │
│  8. Update allocation_run status to 'completed'                 │
│                                                                 │
│  Tables: allocation_run, allocation_candidate                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 3: Decision Making                          │
├─────────────────────────────────────────────────────────────────┤
│  Route: /allocation-decisions                                   │
│  Roles: system_admin, project_leader, minister, housing staff   │
│  Actions:                                                       │
│  • Review candidates from completed runs                        │
│  • Approve or reject each candidate                             │
│  • Provide decision_reason                                      │
│                                                                 │
│  Table: allocation_decision                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 4: Assignment Registration                  │
├─────────────────────────────────────────────────────────────────┤
│  Route: /allocation-assignments                                 │
│  Roles: housing staff                                           │
│  Actions:                                                       │
│  • Record final housing assignment                              │
│  • Link to approved decision                                    │
│  • Set assignment_type, housing_reference, assignment_date      │
│                                                                 │
│  Table: assignment_record                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Public Status Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CITIZEN (Public Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Access /status                                              │
│  2. Enter reference_number (e.g., BS2026-0001 or WR2026-0001)   │
│  3. Enter access_token (received at submission)                 │
│  4. Submit lookup request                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function: lookup-public-status                 │
├─────────────────────────────────────────────────────────────────┤
│  - Validates input format                                       │
│  - Rate-limits by IP (10/hour)                                  │
│  - Hashes provided token                                        │
│  - Looks up public_status_access by reference + hash            │
│  - If found:                                                    │
│    • Updates last_accessed_at                                   │
│    • Fetches case/registration + status history                 │
│    • Fetches applicant name from person table                   │
│    • Returns current_status, timeline, next_steps               │
│  - If not found:                                                │
│    • Logs failed attempt to audit_event                         │
│    • Returns generic "not found" error                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS DISPLAY                                │
├─────────────────────────────────────────────────────────────────┤
│  • Applicant name                                               │
│  • Application type (Bouwsubsidie or Housing)                   │
│  • Current status with description                              │
│  • Full status timeline with dates                              │
│  • Next steps guidance                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Explicitly OUT OF SCOPE (v1.x)

The following items are **intentionally not implemented** per Master PRD Section 4:

| Item | Status | Reference |
|------|--------|-----------|
| Housing inventory / unit management | OUT OF SCOPE | Master PRD Section 4 |
| Objection or appeal procedures | OUT OF SCOPE | Master PRD Section 4 |
| Citizen accounts or dashboards | OUT OF SCOPE | Master PRD Section 4 |
| Dark theme for public frontend | OUT OF SCOPE | Architecture_Security.md |
| Policy analytics beyond defined KPIs | OUT OF SCOPE | Master PRD Section 4 |
| User/Role management UI | DEFERRED | No admin UI; roles managed via DB |
| Settings module | NOT PLANNED | Confirmed in v1.1 closure |
| Delete actions in admin UI | EXCLUDED | Guardian Rules (audit compliance) |
| Notification system (backend) | NOT IMPLEMENTED | v1.1-F: cleanup only |
| Document preview/viewer | NOT IMPLEMENTED | Download only via signed URLs |
| Bulk operations | NOT IMPLEMENTED | Single-record operations only |
| Multi-language support | NOT IMPLEMENTED | Dutch only |
| Mobile-responsive admin | PARTIAL | Desktop-first design |

---

## 6. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | SCSS (Darkone Admin) + Tailwind (public only) |
| State Management | React Query (TanStack Query) |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + RLS + Storage) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Document Generation | docx library (DOCX output) |
| Charts | ApexCharts + Recharts |

---

## 7. District Codes Reference

| Code | District Name |
|------|---------------|
| PAR | Paramaribo |
| WAI | Wanica |
| NIC | Nickerie |
| COR | Coronie |
| SAR | Saramacca |
| COM | Commewijne |
| MAR | Marowijne |
| PAR_N | Para |
| BRO | Brokopondo |
| SIP | Sipaliwini |

---

**End of Application Guide**
