# DVH-IMS — System Overview and Architecture

**Document:** 01 — System Overview and Architecture
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. System Identity

- **Full Name:** Directoraat Volkshuisvesting — Information Management System (DVH-IMS)
- **Purpose:** Digital platform for managing public housing services in Suriname
- **Operator:** Directoraat Volkshuisvesting, Ministerie van Ruimtelijke Ordening en Milieu
- **Production URL:** https://volkshuisvesting.sr

---

## 2. Two-Service Model

DVH-IMS operates two independent services that share a common person and household registry:

| Service | Dutch Name | Purpose |
|---------|-----------|---------|
| **Construction Subsidy** | Bouwsubsidie | Financial support for housing construction/improvement |
| **Housing Registration** | Woningregistratie & Allocatie | Public housing waiting list and allocation |

### Shared Core
- **Person Registry:** Central registry of individuals identified by national ID (`national_id`). Shared across both services.
- **Household Registry:** Household composition, members, and current address. Linked to persons.
- **Contact Points:** Phone numbers and email addresses linked to persons.

### Module Separation
- Subsidy cases (`subsidy_case`) and housing registrations (`housing_registration`) are **independent** entities
- No data flows between modules beyond the shared person/household lookup
- Each service has its own document requirements, status lifecycle, and decision process

---

## 3. Public vs. Administrative Interface

### Public Interface (No Login Required)

| Page | URL | Purpose |
|------|-----|---------|
| Landing Page | https://volkshuisvesting.sr/ | Service overview and entry points |
| Housing Registration | https://volkshuisvesting.sr/housing/register | 9-step registration wizard |
| Subsidy Application | https://volkshuisvesting.sr/bouwsubsidie/apply | 7-step application wizard |
| Status Tracker | https://volkshuisvesting.sr/status | Lookup application status by reference number + token |

- Citizens do **not** need an account or login
- Applications are submitted anonymously via secure server-side processing
- Citizens receive a reference number and security token upon submission

### Administrative Interface (Login Required)

| Entry Point | URL |
|-------------|-----|
| Staff Login | https://volkshuisvesting.sr/auth/sign-in |
| Dashboard | https://volkshuisvesting.sr/dashboards |

- All staff must authenticate with email and password
- Access is controlled by assigned roles (see Document 06)
- All actions are logged in the audit trail

---

## 4. Module Map

```
DVH-IMS
├── PUBLIC FRONTEND
│   ├── Landing Page
│   ├── Bouwsubsidie Wizard (7 steps)
│   ├── Housing Registration Wizard (9 steps)
│   └── Status Tracker
│
├── ADMIN BACKEND
│   ├── Dashboard (overview + recent activity)
│   │
│   ├── SHARED CORE
│   │   ├── Persons
│   │   └── Households
│   │
│   ├── BOUWSUBSIDIE MODULE
│   │   ├── Subsidy Cases (list + detail)
│   │   ├── Control Queue
│   │   ├── My Visits (field workers)
│   │   ├── Schedule Visits
│   │   └── Case Assignments
│   │
│   ├── WONINGREGISTRATIE MODULE
│   │   ├── Housing Registrations (list + detail)
│   │   └── Housing Waiting List
│   │
│   ├── ALLOCATION ENGINE
│   │   ├── District Quotas
│   │   ├── Allocation Runs
│   │   ├── Allocation Decisions
│   │   └── Allocation Assignments
│   │
│   └── GOVERNANCE
│       ├── Archive (read-only terminal dossiers)
│       └── Audit Log (immutable event history)
```

---

## 5. Technology Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React with TypeScript |
| Styling | Bootstrap (Darkone Admin theme) + Tailwind CSS |
| Backend & Database | Supabase (PostgreSQL) |
| Server Logic | Supabase Edge Functions (Deno) |
| Authentication | Supabase Auth (email/password) |
| File Storage | Supabase Storage (citizen-uploads bucket) |
| Hosting | Lovable Cloud |
| Domain | volkshuisvesting.sr (custom domain) |

---

## 6. Authentication Model

### Citizens
- **No authentication required** for public forms
- Applications are processed by secure server-side functions (Edge Functions)
- Edge Functions use a service-level key to write data securely
- Citizens receive a reference number + security token (hashed, not stored in plain text)

### Staff
- Email/password authentication via Supabase Auth
- Session-based access with automatic timeout
- Roles assigned by system administrator via `user_roles` table
- District scoping enforced at database level

---

## 7. Security Architecture (High-Level)

| Security Layer | Implementation |
|---------------|---------------|
| **Authentication** | Supabase Auth — all admin access requires login |
| **Authorization** | Role-based access control (11 roles) |
| **Data Scoping** | District-based filtering at database level (RLS) |
| **Audit Trail** | Immutable `audit_event` table — append-only, no edits/deletes |
| **Token Security** | Citizen access tokens hashed with SHA-256 before storage |
| **Rate Limiting** | Public endpoints limited (5 submissions/hour, 20 lookups/hour per IP) |
| **Input Validation** | Server-side validation (Zod schemas) on all Edge Functions |

---

## 8. Data Flow Overview

### Citizen Submission Flow
```
Citizen → Public Wizard → Edge Function (server-side) → Database
                                    ↓
                            Validation + Rate Limiting
                                    ↓
                            Person (create or reuse)
                            Household (create)
                            Case/Registration (create)
                            Documents (store files)
                            Audit Event (log)
                            Public Access Token (hash + store)
                                    ↓
                            Reference Number + Token → Citizen
```

### Staff Processing Flow
```
Staff Login → Dashboard → Module List/Detail → Action
                                                  ↓
                                          Status Change (with reason)
                                          Document Verification
                                          Report Submission
                                          Decision Recording
                                                  ↓
                                          Audit Event (log every action)
                                          Status History (append)
```

---

## 9. District Model

Suriname's administrative districts are used as the primary organizational boundary:

- District-scoped roles see only data from their assigned district
- National roles see data across all districts
- Each subsidy case and housing registration is tagged with a `district_code`
- Allocation quotas are defined per district

---

## 10. System Boundaries

The following capabilities are **not** part of the current system version:

| Capability | Status |
|-----------|--------|
| Email/SMS/push notifications | Not implemented |
| Automated task routing | Not implemented |
| Workload balancing | Not implemented |
| KPI dashboards | Not implemented |
| Citizen accounts/portal | Not implemented |
| Deadline/SLA tracking | Not implemented |
| Background jobs | Not implemented |
| Cross-module data sharing (beyond person/household) | Not implemented |

All workflow actions require manual initiation by authorized staff.

---

*End of System Overview and Architecture*
