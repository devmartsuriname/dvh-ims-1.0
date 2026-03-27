

# IMS System Analysis — Volks Huisvesting

This is an analysis-only task. No code will be modified. A comprehensive `IMS_System_Analysis.md` will be generated to `/mnt/documents/` based on the findings below.

---

## Findings Summary

### 1. System Overview
- **Purpose:** Government-grade Information Management System for the Ministry of Social Affairs (SoZaVo), Department of Public Housing (Volkshuisvesting)
- **Two core services:** Bouwsubsidie (Construction Subsidy) and Woning Registratie & Allocatie (Housing Registration & Allocation)
- **Architecture:** React + Vite + TypeScript frontend, Supabase backend (Postgres + Edge Functions + Storage)

### 2. Modules (17 Admin + 5 Public)

**Admin Modules:**
1. Dashboards — Role-based overview
2. Subsidy Cases — Full Bouwsubsidie lifecycle management (26-state workflow)
3. Housing Registrations — Housing registration lifecycle (8-state workflow)
4. Housing Waiting List — Waiting list management
5. Allocation Quotas — District quota configuration
6. Allocation Runs — Automated allocation execution
7. Allocation Decisions — Accept/reject allocation candidates
8. Allocation Assignments — Final housing assignments
9. Case Assignments — Staff-to-case assignment
10. Schedule Visits — Inspection visit scheduling
11. My Visits — Inspector's personal visit queue
12. Control Queue — Workflow control oversight
13. Persons — Person registry (shared entity)
14. Households — Household registry (shared entity)
15. Archive — Finalized/rejected case archive
16. Audit Log — Immutable audit event viewer
17. QR Codes — Public QR code generation

**Public Modules:**
1. Landing Page
2. Bouwsubsidie Application Wizard (9 steps)
3. Housing Registration Wizard (11 steps)
4. Public Status Lookup
5. QR Redirect

### 3. Roles (11)
`system_admin`, `minister`, `project_leader`, `director`, `ministerial_advisor`, `frontdesk_bouwsubsidie`, `frontdesk_housing`, `admin_staff`, `social_field_worker`, `technical_inspector`, `audit`

National roles: system_admin, minister, project_leader, director, ministerial_advisor, audit
District-scoped: frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, social_field_worker, technical_inspector

### 4. Workflows

**Bouwsubsidie (26 statuses, 24 non-terminal):**
```
received → in_social_review → social_completed → in_technical_review → technical_approved → in_admin_review → admin_complete → screening → fieldwork → awaiting_director_approval → director_approved → in_ministerial_advice → ministerial_advice_complete → awaiting_minister_decision → minister_approved → approved_for_council → council_doc_generated → finalized
```
With return loops (returned_to_intake, returned_to_social, returned_to_technical, returned_to_screening, returned_to_director, returned_to_advisor) and rejection from any state. RBAC-enforced transitions per role.

**Housing Registration (8 statuses):**
```
received → under_review → urgency_assessed → waiting_list → matched → allocated → finalized
```
With rejection from any state.

### 5. Data Model (20+ tables)
Core: `person`, `household`, `household_member`, `address`, `contact_point`
Subsidy: `subsidy_case`, `case_assignment`, `inspection_visit`, `generated_document`, `subsidy_document_requirement`
Housing: `housing_registration`, `housing_registration_status_history`, `housing_urgency`, `housing_document_upload`, `housing_document_requirement`
Allocation: `allocation_run`, `allocation_candidate`, `allocation_decision`, `assignment_record`, `district_quota`
System: `user_roles`, `app_user_profile`, `audit_event`, `admin_notification`, `public_status_access`, `qr_scan_event`

### 6. Edge Functions (8)
- `submit-bouwsubsidie-application` (anonymous, rate-limited)
- `submit-housing-registration` (anonymous, rate-limited)
- `execute-allocation-run` (RBAC: system_admin, project_leader)
- `generate-raadvoorstel` (RBAC: system_admin, project_leader, frontdesk_bouwsubsidie, admin_staff)
- `get-citizen-document` (RBAC: all staff)
- `get-document-download-url` (RBAC: admin/oversight roles)
- `lookup-public-status` (anonymous)
- `health-check` (anonymous)
- `track-qr-scan` (anonymous)

### 7. Reusable Components
- **Workflow engine pattern** (STATUS_TRANSITIONS + ROLE_ALLOWED_TRANSITIONS) — directly reusable for any service
- **RBAC framework** (useUserRole hook, RLS policies, has_role/is_national_role DB functions)
- **Public wizard pattern** (multi-step form → edge function → DB)
- **Audit framework** (audit_event table + logEvent hook)
- **Notification system** (admin_notification with role/district routing)
- **District-scoped RLS pattern** (reusable across any district-based service)
- **Status badge/timeline UI components**

### 8. Constraints & Risks
- **Tightly coupled:** Subsidy case detail page (~900 lines) contains review panels inline
- **No shared workflow engine:** Each service defines its own STATUS_TRANSITIONS inline
- **10 Surinamese districts hardcoded** in `VALID_DISTRICTS` constant
- **No foreign keys** in database (Supabase limitation or design choice) — relationships enforced by application logic
- **RLS policies reference specific role names** — changing role taxonomy requires migration
- **Raadvoorstel is Bouwsubsidie-exclusive** — not reusable for other services

### 9. Integration Readiness

**Directly reusable:**
- Person/Household/Address/Contact data model (shared core)
- RBAC infrastructure (user_roles table, has_role functions, useUserRole hook)
- Audit event framework
- Notification system
- Public wizard submission pattern
- District-scoped RLS architecture
- Document upload/verification pattern

**Requires refactoring:**
- Workflow engine needs extraction into a generic, configurable service
- Role definitions need parameterization (currently hardcoded as TypeScript union type)
- District codes need to become configurable (currently hardcoded array)
- Edge functions need service-agnostic abstraction layer

---

## Deliverable

Create `/mnt/documents/IMS_System_Analysis.md` with the full structured analysis above, formatted per the requested template.

No code changes. No schema changes. Analysis only.

