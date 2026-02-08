# DVH-IMS — Admin Manual

**Version:** V1.5 (Test & Stabilization)
**Audience:** system_admin, project_leader
**Status:** AS-IS operational reference — no new features

---

## 1. User Management

### Creating User Accounts
1. Users are created via Supabase Auth (email/password)
2. After account creation, a profile must be added to `app_user_profile` with:
   - `user_id` (from auth.users)
   - `full_name`
   - `district_code` (required for district-scoped roles, NULL for national roles)
   - `is_active` (default: true)

### Assigning Roles
- Roles are stored in `user_roles` table (separate from profile)
- One user may hold multiple roles
- Only `system_admin` can assign roles
- Available roles (11 total):

| Role | Scope | Module |
|------|-------|--------|
| system_admin | National | All |
| project_leader | National | Bouwsubsidie |
| minister | National | Bouwsubsidie |
| director | National | Bouwsubsidie |
| ministerial_advisor | National | Bouwsubsidie |
| audit | National | All (read-only) |
| frontdesk_bouwsubsidie | District | Bouwsubsidie |
| frontdesk_housing | District | Woning Registratie |
| admin_staff | District | Bouwsubsidie |
| social_field_worker | District | Bouwsubsidie |
| technical_inspector | District | Bouwsubsidie |

### Deactivating Users
- Set `is_active = false` in `app_user_profile`
- Do NOT delete user records (audit trail preservation)

---

## 2. Role Model Overview

### National Roles
- Have access across all districts
- Includes: system_admin, project_leader, minister, director, ministerial_advisor, audit

### District-Scoped Roles
- Access restricted to their assigned `district_code`
- Includes: frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, social_field_worker, technical_inspector
- District is determined by the `district_code` field in `app_user_profile`

---

## 3. Module Overview

### Bouwsubsidie (Housing Subsidy)
- Public intake wizard (anonymous, no login)
- 8-step decision chain: Intake → Social Review → Technical Inspection → Admin Review → Policy Review → Director Approval → Ministerial Advice → Minister Decision
- Case management via Control Queue
- Document verification and report submission
- Raadvoorstel (council document) generation after full approval

### Woning Registratie & Allocatie (Housing Registration)
- Public registration wizard (anonymous, no login)
- Registration processing and waiting list management
- Urgency assessment and scoring
- District quota management
- Allocation engine (automated candidate ranking + manual decisions)

### Shared Core
- Person registry (national_id–based lookup)
- Household management (members, addresses)
- Contact points (phone, email)

---

## 4. Case Assignments Management

### Overview
- Route: `/case-assignments`
- Purpose: Assign workers to subsidy dossiers for review tasks
- Only `system_admin` and `project_leader` can create/modify assignments

### Operations
| Action | Description | Audit Event |
|--------|-------------|-------------|
| Assign | Assign a worker to a dossier | CASE_ASSIGNED |
| Reassign | Change the assigned worker | CASE_REASSIGNED |
| Revoke | Remove an assignment | CASE_REVOKED |
| Complete | Mark assignment as done | CASE_ASSIGNMENT_COMPLETED |

### Key Rules
- Every action requires a mandatory reason/justification
- Assignments are append-only (history is preserved)
- Assignments do NOT change dossier status
- Assignments do NOT trigger workflow transitions
- All actions are audit-logged with actor, target, and reason

### Viewing Assignments
- system_admin / project_leader: See all assignments
- Field workers / admin_staff: See their own assignments
- Oversight roles (director, minister, audit): Read-only access to all

---

## 5. Archive Access

- Route: `/archive`
- Contains terminal dossiers (finalized or rejected)
- Strictly read-only — no mutations permitted
- National roles see all districts; district roles see their district only
- Supports filtering by status, date, and district

---

## 6. Audit Log Review

- Route: `/audit-log`
- Displays all `audit_event` records
- Filterable by: date range, action type, entity type, actor
- Append-only — no editing or deletion possible
- All system actions (create, update, status changes, assignments) are logged

---

## 7. Schedule Visits

- Route: `/schedule-visits`
- Read-only planning view for scheduled field visits
- No visit creation or modification from this page
- Displays visits assigned via Case Assignments

---

## 8. Dashboard

- Route: `/dashboard`
- Overview of system activity and key metrics
- Available to all authenticated roles
- No KPI tracking or automated reporting exists

---

## What Admins CANNOT Do
- Cannot bypass the 8-step decision chain
- Cannot directly modify dossier status outside the workflow
- Cannot delete audit records
- Cannot access the system without proper authentication
- Cannot assign roles without system_admin privileges
